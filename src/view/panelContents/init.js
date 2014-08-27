/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, Mustache, brackets, $*/

define(function (require, exports) {
    //var Utils = require("src/view/aliceUtils");
    var Dialogs   = brackets.getModule("widgets/Dialogs");
    var Tube      = require("src/tube").instance;
    var panel = (function(){
        var _html               = require("text!tpl/init/init.mustache"),
            _toolbar            = require("text!tpl/init/issueListToolbar.mustache");

        Mustache.parse(_html);
        Mustache.parse(_toolbar);

        return {
            render: function() {
                var Model   = require("src/model/model").instance;
                var Preferences = require("src/preferences").instance();
                var it      = Model.issueTrackers;
                var issueTrackers = it.map(function(elem){
                    switch (elem.protocol){
                        case "Github":
                            elem.image = "https://cdn1.iconfinder.com/data/icons/" +
                                            "windows-8-metro-style/512/github.png";
                            break;
                        case "Gitlab":
                            elem.image = "http://luzem.dyndns.org/wp-content/" +
                                            "uploads/2012/02/gitlab_logo.png";
                            break;
                        case "Bitbucket":
                            elem.image = "https://pbs.twimg.com/profile_images/3091771597/6599f87f8b4f374fde735ba3feece4bb_400x400.png";
                            break;
                    }

                    elem.location = Preferences.getLocationByIT(elem);
                    return elem;
                });
                return {
                    toolbar: "",
                    content: Mustache.render(_html,{issueTrackers : issueTrackers})
                };
            },
            afterRender: function(){

            },
            events: function(elem,$toolbar,$content) {
                var Model   = require("src/model/model").instance;

                $content.find(".selectedIT").click(function(){
                    var name = $(this).data("it");
                    Model.changeTo(name).done(function(){
                        Tube.drop("changePanel",{
                            to: "issues",
                        });
                    });
                });

                $content.find(".alice-credentials").click(function(){
                    Model.getConfigurator($(this).data("protocol")).call($(this).data("it"));
                });
            }
        };
    })();

    exports.instance = panel;
});
