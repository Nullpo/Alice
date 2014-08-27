/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, Mustache, brackets, $*/

define(function (require, exports) {
    //var Utils = require("src/view/aliceUtils");
    var Dialogs             = brackets.getModule("widgets/Dialogs"),
        Tube                = require("src/tube").instance;

    var self = this;
    self.Tube = Tube;

    this.config = function(locationName){
        var Model               = require("src/model/model").instance,
            Preferences         = require("src/preferences").instance(),
            dialogCredentials   = require("text!tpl/init/gitlab/credentials.mustache");

        var location = Model.issueTrackers.filter(function(elem){
            return elem.name == locationName;
        });

        if(location.length > 0){
            location = location[0];
        }
        var server = Preferences.getServersByITName(location.domain);

        var rendered = Mustache.render(dialogCredentials, {
            token: server.credential,
            name : location.name
        });

        var dialog = Dialogs.showModalDialogUsingTemplate(rendered);

        dialog.done(function(){
            self.Tube.drop("changePanel",{to:"init"});
        });

        $("#alice-save-credential").click(function(){
            var credential = $("#alice-new-credential").val();
            Preferences.updateCredentals(server,credential);
            dialog.close();
        });
    };

    exports.transformers = [
        {
            id:"gitlab-confirmed",
            name:"",
            icon:"octicon-check",
            title:"confirmed",
            color:"red",
            transform: function(results){
                return results.filter(function(issue){
                    return issue.labels.some(function(label){
                        return label.name.toLowerCase() == "confirmed";
                    });
                });
            }
        },
        {
            id:"gitlab-critical",
            name:"",
            icon:"octicon-alert",
            title:"critical",
            color:"red",
            transform: function(results){
                return results.filter(function(issue){
                    return issue.labels.some(function(label){
                        return label.name.toLowerCase() == "critical";
                    });
                });
            }
        },
        {
            id:"gitlab-documentation",
            name:"",
            icon:"octicon-repo",
            title:"documentation",
            color:"yellow",
            transform: function(results){
                return results.filter(function(issue){
                    return issue.labels.some(function(label){
                        return label.name.toLowerCase() == "documentation";
                    });
                });
            }
        },
        {
            id:"gitlab-enhancement",
            name:"",
            icon:"octicon-tag",
            title:"enhancement",
            color:"green",
            transform: function(results){
                return results.filter(function(issue){
                    return issue.labels.some(function(label){
                        return label.name.toLowerCase() == "enhancement";
                    });
                });
            }
        },
        {
            id:"gitlab-feature",
            name:"",
            icon:"octicon-zap",
            title:"feature",
            color:"green",
            transform: function(results){
                return results.filter(function(issue){
                    return issue.labels.some(function(label){
                        return label.name.toLowerCase() == "feature";
                    });
                });
            }
        }
    ];



    exports.call = function(locationName){
        this.config(locationName);
    };
});
