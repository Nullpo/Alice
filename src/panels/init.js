define(function (require, exports, module) {

    var PanelView   = require("src/panelView"),
        i18n        = require("src/i18n").i18n;
        filters     = require("src/utils").filters
        panelHTML   = require("text!templates/panels/init.html");

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

        self.html           = panelHTML;
        self.contentManager = undefined;
        self.model          = model;
        self.iAmLoaded      = false;
        self.lazyRefresh    = false;

        self._filter = function(button,title,state){
            return function(){
                var mustacheParse       = Mustache.parse(issuesHTML),
                    issuesHTML          = $("#bottom-alice-issues-tpl").html(),
                    $selectedButton     = $("#"+button),
                    $buttonsGroup       = $("#alice-select-issuetype input[type=button]"),
                    $container          = $("#bottom-alice-issues > .alice-bottom-content"),
                    $title              = $("#title-alice"),
                    allIssues           = self.model.data.issues,
                    issuesToShow        = allIssues.filter(state),
                    rendered            = Mustache.render(issuesHTML,{issues:issuesToShow}),
                    selectorGetDetails  = ".alice-get-details",
                    $lnkGetDetails
                    ;

                $title.html(title);
                $container.html(rendered);

                $buttonsGroup.removeAttr('disabled');
                $buttonsGroup.addClass("btn");
                $buttonsGroup.removeClass("btn-warning btn-primary");

                $selectedButton.addClass("btn-primary");
                $selectedButton.removeClass("btn-warning btn");

                $lnkGetDetails = $(selectorGetDetails);
                $lnkGetDetails.click(function(evt){
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

        model.onSuccessRequest(function(){
            $(".alice-background-logo").removeClass("busy");
            return true;
        });

        model.onStartRequest(function(){
            $(".alice-background-logo").addClass("busy");
            return true;
        });

        self._validRepository = function(url){
            var $buttonsGroup = $("#alice-select-issuetype input[type=button]");
            if(!$buttonsGroup)
                return;

            $("#title-alice").html(i18n.LBL_LOADING);
            $(".alice-control-group-repo-url").removeClass("success")
            $(".alice-control-group-repo-url").addClass("success")
            $(".alice-control-group-repo-url input").removeAttr("disabled")
            $("#bottom-alice-issues > .alice-bottom-content").html(i18n.LBL_LOADING);

            $buttonsGroup.removeAttr('disabled');
            $buttonsGroup.addClass("btn");
            $buttonsGroup.removeClass("btn-warning btn-primary");

            $("#nullpo-alice-btn-refresh").removeAttr("disabled");
            $("#alice-url").val(url);
        }

        self._invalidRepository = function(){
            $(".alice-control-group-repo-url").removeClass("success")
            $(".alice-control-group-repo-url").addClass("error")
        }

        self._setRepository = function(url,afterSetingRepository){
            return self.model.setGithubRepository(
                url,
                afterSetingRepository
            );
        }

        self.refreshRepository = function(newUrl) {
            var isSettingRepo = self._setRepository(
                newUrl,
                self._issueEvents.showAll.evt);

            if(isSettingRepo){
                self._validRepository(newUrl);
            } else {
                self._invalidRepository();
            }
        }

        self.show = function($panel){
            var $btnSaveUrl = $("#nullpo-alice-saveurl"),
                $firstUrl = $("#alice-url-firsttime"),
                $secondUrl = $("#alice-url"),
                $btnRefresh = $("#nullpo-alice-btn-refresh"),
                buttons = self._issueEvents;
                self.iAmLoaded = true;

            $panel.find(".close").click(function(){
                self.contentManager.toggle();
            });

            for(property in buttons){
                var elem = buttons[property];
                $("#"+ elem.id).click(elem.evt);
            }

            // First refresh!
            $btnSaveUrl.click(function(){
                self.refreshRepository($firstUrl.val());
            });

            // No-first refresh
            $btnRefresh.click(function(){
                self.refreshRepository($secondUrl.val());
            });

            var saveOnEnter = function(e){
                if (e.keyCode == 13) {
                    $btnSaveUrl.click();
                }
            };

            var refreshOnEnter = function(e){
                if (e.keyCode == 13) {
                    $btnRefresh.click();
                }
            };

            $firstUrl.keydown(saveOnEnter);
            $secondUrl.keydown(refreshOnEnter);

            if(self.lazyRefresh){
                self._validRepository(self.model.rawUrl);
                self._issueEvents.showAll.evt();
            }
        }

        self.refreshIssueList = function(){
            console.log("Refreshing issue list from: " + self.model.rawUrl)
            if(self.iAmLoaded){
                self._validRepository(self.model.rawUrl);
                self._issueEvents.showAll.evt();
            } else {
                console.log("Activate lazy issue refresh")
                self.lazyRefresh = true;
            }
        }

        self.beforeHide = function(){
            return true;
        }

        model.onRefresh(function(url){
            self._setRepository(url,function(){
                self.refreshIssueList();
            });
        });

        return self;
    }

    exports.create = function(props){
        return new Panel(props);
    }

});
