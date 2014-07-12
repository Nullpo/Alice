define(function (require, exports, module) {
     var Dialogs            = brackets.getModule("widgets/Dialogs"),
         PanelView          = require("src/panelView"),
         DialogRepository   = require("src/modals/repositories"),
         i18n               = require("src/i18n").i18n,
         filters            = require("src/utils").filters,
         preferences        = require("src/preferences"),
         panelHTML          = require("text!templates/panels/init.html"),
         $panelHTML         = $(panelHTML);

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
                $background     = $(".alice-background-logo"),
                $select         = $("#alice-select-repo");

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
                self.model.update().done(function(){
                    self.contentManager.changeTo("mainRepo")
                }).fail(function(){
                    // FIXME: This
                    self.contentManager.changeTo("noRepo",[])
                });
            });

            $url.val(model.rawUrl);

            // Toolbox textbox - refresh on enter
            $url.keydown(function(e){
                if (e.keyCode == 13) {
                    $btnRefresh.click();
                }
            });


            model.data.repositories.forEach(function(repo){
                    $select.html($select.html() +
                                 "<option value="+repo.data.url+">" + repo.type + " - " + repo.data.url + "</option>");
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

        self.repositoryChanged = function(url){
            console.log("Repository changed! New url" + url);
            console.log("Loading issues");
            var promise = self.model.update();

            promise.done(function(data){
                console.log("New repository data: ");
                console.log(data);
                self.contentManager.changeTo("mainRepo");
            });
            promise.fail(function(jqHxr){
                console.log("Failed to fetch issues from repository: " + jqHxr);
                self.contentManager.changeTo("noRepo",{
                    url     : url,
                    status  : jqHxr.status,
                    fileError   : "PROBLEM?"
                });
            });
        };

        self.refreshProject = function(repositories,status,fileError){
            console.log("New project recieved! ");
            console.log(repositories);

            var validRepos = repositories.filter(function(elem){
                return elem.error == null;
            });

            if(validRepos.length == 1){
                var wasSetted = model.setRepository(
                    {
                        type        : validRepos[0].type,
                        repository  : validRepos[0].data.url,
                        handler     : validRepos[0].handler
                    }
                );
                if(wasSetted){
                    self.repositoryChanged(validRepos[0].data.url);
                } else {
                    self.repositoryNotValid(validRepos[0].data.url);
                }
            } else {
                DialogRepository.show(validRepos);
            }
        };

        self.failedRefreshProject = function(errors){
            self.contentManager.changeTo("noRepo",errors);
        }

        model.onRefreshProject(self.refreshProject,self.failedRefreshProject);


        return self;
    }
    exports.create = function(props){
        return new Panel(props);
    }
});
