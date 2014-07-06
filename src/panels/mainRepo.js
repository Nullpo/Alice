define(function (require, exports, module) {

    var PanelView   = require("src/panelView"),
        i18n        = require("src/i18n").i18n,
        filters     = require("src/utils").filters,
        panelHTML   = require("text!templates/panels/mainRepo.html");

    var panelButtons = {
        BTN_SHOW_BUGS   : "nullpo-alice-btn-bugs",
        BTN_SHOW_OPENED : "nullpo-alice-btn-open",
        BTN_SHOW_CLOSED : "nullpo-alice-btn-closed",
        BTN_SHOW_ALL    : "nullpo-alice-btn-all"
    }

    var Panel = function(model){
        var self            = this,
            bugsOpened      = filters.operators.UNION(filters.issues.bugs,filters.issues.opened),
            issuesOpened    = filters.issues.opened,
            issuesClosed    = filters.issues.closed,
            allIssues       = filters.issues.all;
        self.model          = model;
        self.contentManager = undefined;

        self.$panelHTML = $(panelHTML),
        self.panelTpl = self.$panelHTML.filter("#bottom-alice-issues-tpl").html(),

        self._filter = function(button,title,state){
            return function(){
                var issuesToShow = self.model.data.issues.filter(state),
                    $panelContainer = $("#bottom-alice-issues > .alice-bottom-content");

                Mustache.parse(self.panelTpl);
                $panelContainer.html(Mustache.render(self.panelTpl, {issues: issuesToShow}));

                var $selectedButton     = $("#"+button),
                    $title              = $("#title-alice"),
                    $buttonsGroup       = $("#alice-select-issuetype button"),
                    $getDetails         = $(".alice-get-details");


                $title.html(title);

                $buttonsGroup.removeAttr('disabled');
                $buttonsGroup.addClass("btn");
                $buttonsGroup.removeClass("btn-warning btn-primary");

                $selectedButton.addClass("btn-primary");
                $selectedButton.removeClass("btn-warning btn");

                $getDetails.click(function(evt){
                    var $this = $(this);
                    self.contentManager.changeTo("detailIssue",$this.data("number"));
                });

            }
        }

        self._issueEvents = {
            showBugs: {
                id: panelButtons.BTN_SHOW_BUGS,
                evt: self._filter(panelButtons.BTN_SHOW_BUGS,i18n.BTN_ISSUES_BUGS, bugsOpened)
            },
            showOpened: {
                id: panelButtons.BTN_SHOW_OPENED,
                evt: self._filter(panelButtons.BTN_SHOW_OPENED,i18n.BTN_ISSUES_OPEN, issuesOpened)
            },
            showClosed: {
                id: panelButtons.BTN_SHOW_CLOSED,
                evt: self._filter(panelButtons.BTN_SHOW_CLOSED,i18n.BTN_ISSUES_CLOSE, issuesClosed)
            },
            showAll: {
                id: panelButtons.BTN_SHOW_ALL,
                evt: self._filter(panelButtons.BTN_SHOW_ALL,i18n.BTN_ISSUES_ALL, allIssues)
            }
        }

        self._validRepositoryStyle = function(url){
            var $buttonsGroup = $("#alice-select-issuetype input[type=button]");
            if(!$buttonsGroup)
                return;

            //$("#title-alice").html(i18n.LBL_LOADING);
            $(".alice-control-group-repo-url").removeClass("success")
            $(".alice-control-group-repo-url").addClass("success")
            $(".alice-control-group-repo-url input").removeAttr("disabled")
            //$("#bottom-alice-issues > .alice-bottom-content").html(i18n.LBL_LOADING);

            $buttonsGroup.addClass("btn");
            $buttonsGroup.removeClass("btn-warning btn-primary");

            $("#nullpo-alice-btn-refresh").removeAttr("disabled");
            $("#alice-url").val(self.model.getRawUrl());
            $(".alice-background-logo").removeClass("busy");
        }

        self._invalidRepository = function(){
            $(".alice-control-group-repo-url").removeClass("success")
            $(".alice-control-group-repo-url").addClass("error")
        }

        self.show = function(){
            var buttons = self._issueEvents;

            // Toolbox buttons (bug-open-closed-all)
            for(property in buttons){
                var elem = buttons[property];
                $("#"+ elem.id).click(elem.evt);
            }

            // Change style of toolbox
            self._validRepositoryStyle();

            // Show all issues
            self._issueEvents.showAll.evt();
        }

        self.beforeHide = function(){
            return true;
        }

        return self;
    }

    exports.create = function(props){
        return new Panel(props);
    }

});
