/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, Mustache, $ */

define(function (require, exports) {
    var Tube      = require("src/tube").instance;

    var panel = (function(){
        var html = require("text!tpl/init/error.mustache");
        Mustache.parse(html);
        return {
            render: function(elem) {
                var data = {
                    title  : "Internal error",
                    headline : ""
                };

                $(".alice-background-logo").attr("class","alice-background-logo error");

                switch (elem.data.status){
                    case 404:
                        data.title = "404 - Not found";
                        data.headline = "The issue tracker server response was 404. Check the " +
                            "repository URL and try again.<br/>" +
                            "If its a private repository, please configure your credentials " +
                            "before trying again.";
                        break;
                    case 401:
                        data.title = "401 - Bad credentials";
                        data.headline = "The issue tracker server response is 401. Check your " +
                            "credentials and try again later.<br/>";
                        break;
                    case "NoIT":
                        data.title = "No Issue Tracker configuration";
                        data.headline = "There is no configuration in this project! Please, configure"+
                            " it and try again.";
                        break;
                }
                console.debug("Rendering error page");
                return {
                    toolbar: "<b> Error: "+data.title+"</b>",
                    content: Mustache.render(html,data)
                };
            },
            events: function() {

            }
        };
    })();

    Tube.on("error", function(elem){
        Tube.drop("changePanel",{
            to: "error",
            data : elem
        });
    });
    exports.instance = panel;
});
