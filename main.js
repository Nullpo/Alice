/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

define(function (require, exports, module) {
    "use strict";

    var Menus          = brackets.getModule("command/Menus"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        PanelManager   = brackets.getModule("view/PanelManager"),
        CommandManager = brackets.getModule("command/CommandManager");

    // Local modules
    var panelHTML   = require("text!panel.html");

    ExtensionUtils.loadStyleSheet(module,"main.css");

    // Constants

    var panel,
        visible = false,
        baseUrl = "http://github.com/nullpo/Alice",
        realVisibility=false;

    var i18n = {
        MNU_TRACKING         : "Tracking",
        MNU_GITHUB           : "Github issues...",
        BTN_TOGGLE           : "Show Alice Tracker panel",
        BTN_ISSUES_OPEN      : "Open issues",
        BTN_ISSUES_CLOSE     : "Closed issues",
        BTN_ISSUES_ALL       : "All issues",
        BTN_ISSUES_OPEN_BUGS : "Open bugs",
        LBL_LOADING          : "Loading...",
        BTN_ISSUE_DETAIL     : "Detalle"
    }

    var ids = {
        MNU_TRACKING      : "nullpo.alice",
        CMD_SHOW_PANEL    : "nullpo.alice.showPanel"
    }

    var panelButtons = {
        BTN_SHOW_BUGS   : "nullpo-alice-btn-bugs",
        BTN_SHOW_OPENED : "nullpo-alice-btn-open",
        BTN_SHOW_CLOSED : "nullpo-alice-btn-closed",
        BTN_SHOW_ALL    : "nullpo-alice-btn-all"
    }

    var filters = {
        operators : {
            UNION : function(filter1,filter2){
                return function(elem){
                    return filter1(elem) && filter2(elem);
                }
            }
        },
        issues:{
            all:function(){ return true},
            bugs:function(elem){
                return elem.labels.some(function(obj){
                    return obj.name == "bug";
                });
            },
            opened : function(elem){
                return elem.closed_at == null;
            },
            closed : function(elem){
                return elem.closed_at != null;
            },
            byNumber: function(number){
                return function(elem){
                    return elem.number == number;
                }
            }
        }
    }

    var model = {
        issues: {},
        time: {}
    };

    var _setGithubRepository = function(repo,callback){
        var regex = /github.com\/(.*)/g,
            githubUrl = regex.exec(repo),
            githubContext,
            url;

        if(!githubUrl || !githubUrl[1]){
            return false
        }

        githubContext = githubUrl[1];
        baseUrl = "https://api.github.com/repos/" + githubContext;
        url = baseUrl + "/issues?state=all";
        $.getJSON(url,function(data){
            model.issues = data;
            model.time = new Date();
            callback(model.issues);
        });

        return true;
    }

    var _setRepository= function(){
        var $txtRawUrl = $("#alice-url"),
            issuesHTML = $("#bottom-alice-issues-tpl").html(),
            isSettingTheRepository = false,
            $buttonsGroup,
            afterSetingRepository = function(data){
                views.issues.buttons.showAll.evt();
            };

        isSettingTheRepository = _setGithubRepository($txtRawUrl.val(),afterSetingRepository);

        if(!isSettingTheRepository){
            $(".alice-control-group-repo-url").removeClass("success")
            $(".alice-control-group-repo-url").addClass("error")
            return;
        } else {
            $("#title-alice").html(i18n.LBL_LOADING);
            $(".alice-control-group-repo-url").removeClass("success")
            $(".alice-control-group-repo-url").addClass("success")
            $(".alice-control-group-repo-url input").removeAttr("disabled")

            $("#bottom-alice-issues").html(i18n.LBL_LOADING);

            $buttonsGroup = $("#alice-select-issuetype input[type=button]");
            $buttonsGroup.removeAttr('disabled');
            $buttonsGroup.addClass("btn");
            $buttonsGroup.removeClass("btn-warning btn-primary");

            $("#nullpo-alice-btn-refresh").removeAttr("disabled")
        }

    }

    var _showIssues = function(button,title,state){
        //panelButtons.BTN_SHOW_CLOSED,i18n.BTN_ISSUES_CLOSE, filters.issues.closed
        return function(){
            var issuesHTML = $("#bottom-alice-issues-tpl").html(),
                rendered,
                issuesToShow,
                $buttonsGroup;

            $("#title-alice").html(title);
            Mustache.parse(issuesHTML);
            issuesToShow = model.issues.filter(state);
            rendered = Mustache.render(issuesHTML,{issues:issuesToShow});
            $("#bottom-alice-issues").html(rendered);

            $buttonsGroup = $("#alice-select-issuetype input[type=button]");
            $buttonsGroup.removeAttr('disabled');
            $buttonsGroup.addClass("btn");
            $buttonsGroup.removeClass("btn-warning btn-primary");

            $("#"+button).addClass("btn-primary");
            $("#"+button).removeClass("btn-warning btn");
            $(".alice-get-details").click(function(evt){
                var $this = $(this);
                views.issue.buttons.show.evt($this.data("number"))
            })
        }
    }

    var _showDetail = function(title){
        return function(number){
            var issue = model.issues.filter(filters.issues.byNumber(number))[0],
                detailHTML = $("#bottom-alice-issuedetail-tpl").html();
            $("#title-alice").html("#" + number + " - " + issue.title);
            Mustache.parse(detailHTML);
            $("#bottom-alice-issues").html(i18n.LBL_LOADING);

            $.getJSON(baseUrl + "/issues/"+number+"/comments", function(data){
                var obj = {issue:issue, comments:data};
                $("#bottom-alice-issues").html(Mustache.render(detailHTML,obj));
            });
        };
    };

    var views = {
        issues: {
            buttons: {
                showBugs: {
                    id: panelButtons.BTN_SHOW_BUGS,
                    evt: _showIssues(panelButtons.BTN_SHOW_BUGS,i18n.BTN_ISSUES_OPEN_BUGS,filters.operators.UNION(filters.issues.bugs,filters.issues.opened))
                },
                showOpen: {
                    id:panelButtons.BTN_SHOW_OPENED,
                    evt: _showIssues(panelButtons.BTN_SHOW_OPENED,i18n.BTN_ISSUES_OPEN, filters.issues.opened)
                },
                showClosed: {
                    id:panelButtons.BTN_SHOW_CLOSED,
                    evt: _showIssues(panelButtons.BTN_SHOW_CLOSED,i18n.BTN_ISSUES_CLOSE, filters.issues.closed)
                },
                showAll: {
                    id:panelButtons.BTN_SHOW_ALL,
                    evt: _showIssues(panelButtons.BTN_SHOW_ALL,i18n.BTN_ISSUES_ALL, filters.issues.all)
                }
            }
        },
        issue : {
            buttons: {
                show: {
                    id: panelButtons.BTN_SHOW_DETAIL,
                    evt: _showDetail(i18n.BTN_ISSUE_DETAIL)
                }
            }
        }
    }

    function _toggleVisibility() {
        visible = !visible;
        _setPanelVisibility(visible);
    }

    function _setPanelVisibility(isVisible){
        if (isVisible === realVisibility) {
            return;
        }

        realVisibility = isVisible;

        if (isVisible) {
            if(!panel){
                var $panel = $(panelHTML);
                $panel.find(".close").click(function(){
                    togglePanel();
                })
                panel = PanelManager.createBottomPanel("alice-panel", $panel,200);

                $panel.on("panelResizeUpdate", function (e, newSize) {
                    //$("#bottom-alice-content")
                });
                var buttons = views.issues.buttons;
                for(var button in buttons){
                    $("#"+ buttons[button].id).click(buttons[button].evt);
                }
                $("#nullpo-alice-saveurl").click(function(){
                    $("#alice-url").val($("#alice-url-firsttime").val());
                    $("#nullpo-alice-btn-refresh").click(
                        function(){
                            _setRepository();
                        }
                    );
                    _setRepository();
                });

            }
            panel.show();
        } else {
            panel.hide();
        }

    }

    function togglePanel(){
        visible = !visible
        _setPanelVisibility(visible);
    }

    // Integration with Brackets

    CommandManager.register(i18n.MNU_GITHUB, ids.CMD_SHOW_PANEL, togglePanel);

    var $icon = $("<a id='alice-toolbar-button' href='#'>T</a>")
        .attr("title", i18n.BTN_TOGGLE)
        .appendTo($("#main-toolbar .buttons"));

    $icon.on("click", togglePanel);

});
