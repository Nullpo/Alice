/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, Mustache, $ */

define(function (require, exports) {
    var Tube      = require("src/tube").instance;

    var panel = (function(){
        var _html = require("text!tpl/init/config.mustache");
        var _toolbar = require("text!tpl/init/issueDetailToolbar.mustache");
        Mustache.parse(_html);
        Mustache.parse(_toolbar);
        return {
            render: function(elem) {
                var Preferences = require("src/preferences").instance();
                var it = Preferences.getIssueTrackers();
                var locations = Preferences.getLocations();
                return {
                    toolbar: Mustache.render(_toolbar),
                    content: JSON.stringify(it) + "<br />" + JSON.stringify(locations)
                };
            },
            events: function() {
                $("#alice-btn-back").click(function(){
                    Tube.drop("changePanel",{
                        to: "init"
                    });
                });
            }
        };
    })();

    exports.instance = panel;
});
