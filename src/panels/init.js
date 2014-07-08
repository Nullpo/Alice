define(function (require, exports, module) {
     var Dialogs     = brackets.getModule("widgets/Dialogs"),
         PanelView   = require("src/panelView"),
         i18n        = require("src/i18n").i18n,
         filters     = require("src/utils").filters,
         preferences = require("src/preferences"),
         panelHTML   = require("text!templates/panels/init.html"),
         $panelHTML  = $(panelHTML);

    var panelButtons = {
        BTN_SHOW_BUGS   : "nullpo-alice-btn-bugs",
        BTN_SHOW_OPENED : "nullpo-alice-btn-open",
        BTN_SHOW_CLOSED : "nullpo-alice-btn-closed",
        BTN_SHOW_ALL    : "nullpo-alice-btn-all"
    }

    var Panel = function(model){
        var self = this;
        self.html             = panelHTML;
        self.model            = model;
        self.contentManager   = undefined;
        self.iAmLoaded        = false;
        self.lazyLoadMainRepo = false;

        model.onSuccessRequest(function(){
            $(".alice-background-logo").removeClass("error")
                                       .removeClass("busy");
            return true;
        });

        model.onStartRequest(function(){
            $(".alice-background-logo").removeClass("error")
                                       .addClass("busy");
            return true;
        });

        self.show = function($panel){
            var $btnRefresh     = $("#nullpo-alice-btn-refresh"),
                $close          = $panel.find(".close"),
                $url            = $("#alice-url"),
                $settingsButton = $("#nullpo-alice-btn-settings"),
                $background     = $(".alice-background-logo");

            $background.addClass("more-transparent busy");

            $settingsButton.click(function(){
                var modal = $(panelHTML).filter("#alice-settings-dialog-tpl").html(),
                    objToken = { token: preferences.get("githubAccessToken") };

                Mustache.parse(modal);

                var rendered        = Mustache.render(modal, objToken),
                    dialog          = Dialogs.showModalDialogUsingTemplate(rendered),
                    $dialog         = dialog.getElement(),
                    $dialogButton   = $dialog.find(".btn.primary"),
                    $lblTest        = $dialog.find(".lblTest"),
                    $token          = $dialog.find(".alice.accessToken");
                dialog.done(function(){
                    $btnRefresh.click();
                })
                $dialogButton.click(function(){
                    $lblTest.html("Testing connection...");
                    $lblTest.addClass("label label-info");

                    self.model.testConnection({
                        token: $token.val(),
                        done: function() {
                            $lblTest.html("¡OK!");
                            $lblTest.removeClass("label-info");
                            $lblTest.addClass("label label-success");
                            preferences.persist("githubAccessToken",$token.val());
                            preferences.save();
                            dialog.close();
                        },
                        fail: function(data){
                            $lblTest.html("Bad credentials");
                            $lblTest.removeClass("label-info");
                            $lblTest.addClass("label label-warning");
                        }
                    });
                });
            });

            $close.click(function(){
                self.contentManager.toggle();
            });

            // Toolbox - refresh button
            $btnRefresh.click(function(){
                var $panelContainer = $("#bottom-alice-issues > .alice-bottom-content");
                self.model.setRepository(
                    {
                        repository: $url.val(),
                        done: self.repositoryChanged,
                        fail: self.repositoryNotFound,
                    }
                );
            });

            $url.val(model.rawUrl);

            // Toolbox textbox - refresh on enter
            $url.keydown(function(e){
                if (e.keyCode == 13) {
                    $btnRefresh.click();
                }
            });

            if(self.lazyLoadMainRepo){
                //self.contentManager.changeTo("mainRepo",propsToShow);
            }
        }

        self.beforeHide = function(){
            return true;
        }

        self.refreshIssueList = function(){
            console.log("Refreshing issue list from: " + self.model.rawUrl)
            if(self.iAmLoaded){
                self.contentManager.changeTo("mainRepo")
            } else {
                console.log("Activate lazy issue refresh")
                self.lazyLoadMainRepo = true;
            }
        }

        self.repositoryChanged = function(data){
            console.log("Repository changed! Recieved data:");
            console.log(data);
            self.contentManager.changeTo("mainRepo");
        };

        self.repositoryNotFound = function(url, status,fileError){
            console.log("Repository not found! url: " + url + " status:" + status );

            self.contentManager.changeTo("noRepo",{
                url     : url,
                status  : status,
                fileError   : fileError
            });
        };

        //TODO: When the preferences are loaded, check it out the Github repository
        //For now: check if its a github repository

        model.onRefreshProject(function(newUrl,status,fileError){
            console.log("New project recieved! " + newUrl);
            model.data.accessToken = preferences.get("githubAccessToken");

            if(model.data.accessToken){
                console.log("Access token: " + model.data.accessToken);
            } else {
                console.log("This user doesn't have any access token");
            }

            if(!newUrl){
                self.repositoryNotFound(newUrl,status,fileError);
            } else {
                model.setRepository(
                    {
                        repository: newUrl,
                        done: self.repositoryChanged,
                        fail: self.repositoryNotFound,
                    }
                );
            }
        });


        return self;
    }
    exports.create = function(props){
        return new Panel(props);
    }
});
