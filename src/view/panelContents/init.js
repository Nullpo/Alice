/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, Mustache, $*/

define(function (require, exports) {
    var Tube      = require("src/tube").instance;
    var AliceUtils   = require("src/view/aliceUtils");
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
                var tmpIssueTrackers = it.map(function(elem){
                    switch (elem.protocol){
                        case "Github":
                            elem.image = AliceUtils.images.protocols.github;
                            break;
                        case "Gitlab":
                            elem.image = AliceUtils.images.protocols.gitlab;
                            break;
                        case "Bitbucket":
                            elem.image = AliceUtils.images.protocols.bitbucket;
                            break;
                    }

                    elem.server = Preferences.getServerByIT(elem);
                    return elem;
                });

                // Divide the issue trackers in groups of three
                var issueTrackers = [];
                var actualGroup = [];
                for(var i = 0; i < tmpIssueTrackers.length;i++){
                    if(actualGroup.length === 3)  {
                        actualGroup = [];
                    }

                    if(actualGroup.length === 0){
                        issueTrackers.push(actualGroup);
                    }

                    actualGroup.push(tmpIssueTrackers[i]);
                }


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
