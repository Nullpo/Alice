define(function (require, exports, module) {
    var Dialogs     = brackets.getModule("widgets/Dialogs"),
        PanelView   = require("src/panelView"),
        i18n        = require("src/i18n").i18n,
        filters     = require("src/utils").filters,
        preferences = require("src/preferences"),
        panelHTML   = require("text!templates/modals/repositories.html");

    exports.show = function(repositories){
        var modal = $(panelHTML).filter("#alice-repositories-dialog-tpl").html(),
            $btnRefresh     = $("#nullpo-alice-btn-refresh"),
            renderedRepositories = null;

        renderedRepositories = repositories.map(function(repo){
            console.log("Repo!!!!");
            console.log(repo);
            return repo.handler.viewConfig.data(repo);
        })


        Mustache.parse(modal);

        var rendered        = Mustache.render(modal,{
            integrators : renderedRepositories
        });
        var dialog          = Dialogs.showModalDialogUsingTemplate(rendered),
            $dialog         = dialog.getElement();

        dialog.done(function(){
            $btnRefresh.click();
        })

        /*$dialogButton.click(function(){
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
        });*/
    }
});
