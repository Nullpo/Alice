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
        lastUrl = "http://github.com/nullpo/FerNet",
        realVisibility=false;

    var i18n = {
        MNU_TRACKING         : "Tracking",
        MNU_GITHUB           : "Github issues...",
        BTN_TOGGLE           : "Show Alice Tracker panel",
        BTN_ISSUES_OPEN      : "Open issues",
        BTN_ISSUES_CLOSE     : "Closed issues",
        BTN_ISSUES_ALL       : "All issues",
        BTN_ISSUES_OPEN_BUGS : "Open bugs",
        LBL_LOADING          : "Loading..."
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

    var _showIssues = function(button,title,state,type){
        return function(){
            var $txtRawUrl = $("#alice-url"),
                issuesHTML = $("#bottom-alice-issues-tpl").html(),
                regex = /github.com\/(.*)/g,
                githubUrl = regex.exec($txtRawUrl.val()),
                githubContext,
                url,
                $buttonsGroup,


            regex = /github.com\/(.*)/g
            githubUrl = regex.exec($("#alice-url").val());

            if(!githubUrl || !githubUrl[1]){
                //$txtRawUrl.val(lastUrl);
                $(".alice-control-group-repo-url").removeClass("success")
                $(".alice-control-group-repo-url").addClass("error")
                return;
            }


            lastUrl = githubUrl;
            githubContext = githubUrl[1];
            url ="https://api.github.com/repos/" + githubContext + "/issues?state=" + state;

            // Mustache templates
            Mustache.parse(issuesHTML);

            if(type){
                url += "&labels="+type;
            }

            // UI Settings
            $("#title-alice").html(title);
            $("#bottom-alice-issues").html(i18n.LBL_LOADING);

            $(".alice-control-group-repo-url").removeClass("success")
            $(".alice-control-group-repo-url").addClass("success")
            $(".alice-control-group-repo-url input").removeAttr("disabled")

            $buttonsGroup = $("#alice-select-issuetype input[type=button]");
            $buttonsGroup.removeAttr('disabled');
            $buttonsGroup.addClass("btn");
            $buttonsGroup.removeClass("btn-warning btn-primary");

            $("#"+button).addClass("btn-warning");
            $("#"+button).removeClass("btn");

            // Get data from Github
            $.getJSON(url,function(data){
                var rendered = Mustache.render(issuesHTML,{issues:data})
                $("#bottom-alice-issues").html(rendered);
                $("#"+button).addClass("btn-primary");
                $("#"+button).removeClass("btn-warning");
            });
        }
    }

    var views = {
        panel: {
            issues: {
                tpl: null,
                buttons: {
                    showBugs: {
                        id: panelButtons.BTN_SHOW_BUGS,
                        evt: _showIssues(panelButtons.BTN_SHOW_BUGS,i18n.BTN_ISSUES_OPEN_BUGS, "open","bug")
                    },
                    showOpen: {
                        id:panelButtons.BTN_SHOW_OPENED,
                        evt: _showIssues(panelButtons.BTN_SHOW_OPENED,i18n.BTN_ISSUES_OPEN, "open")
                    },
                    showClosed: {
                        id:panelButtons.BTN_SHOW_CLOSED,
                        evt: _showIssues(panelButtons.BTN_SHOW_CLOSED,i18n.BTN_ISSUES_CLOSE, "closed")
                    },
                    showAll: {
                        id:panelButtons.BTN_SHOW_ALL,
                        evt: _showIssues(panelButtons.BTN_SHOW_ALL,i18n.BTN_ISSUES_ALL, "all")
                    }
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
                var buttons = views.panel.issues.buttons;
                for(var button in buttons){
                    $("#"+ buttons[button].id).click(buttons[button].evt);
                }
                $("#nullpo-alice-saveurl").click(function(){
                    $("#alice-url").val($("#alice-url-firsttime").val());
                    buttons.showBugs.evt();
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
    //CommandManager.register(i18n.MNU_GITHUB, ids.CMD_SHOW_PANEL, togglePanel);

    var $icon = $("<a id='alice-toolbar-button' href='#'>T</a>")
        .attr("title", i18n.BTN_TOGGLE)
        .appendTo($("#main-toolbar .buttons"));

    $icon.on("click", togglePanel);

});
