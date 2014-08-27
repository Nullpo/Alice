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
            dialogCredentials   = require("text!tpl/init/github/credentials.mustache");

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
            id:"github-duplicated",
            name:"",
            icon:"octicon-playback-pause",
            title:"Duplicated issues",
            color:"black",
            transform: function(results){
                return results.filter(function(issue){
                    return issue.labels.some(function(label){
                        return label.name.toLowerCase() == "duplicate";
                    });
                });
            }
        },
        {
            id:"github-helpwanted",
            name:"",
            icon:"octicon-light-bulb",
            title:"Help wanted",
            color:"green",
            transform: function(results){
                return results.filter(function(issue){
                    return issue.labels.some(function(label){
                        return label.name.toLowerCase() == "help wanted";
                    });
                });
            }
        },
        {
            id:"github-invalid",
            name:"",
            icon:"octicon-x",
            title:"Invalid issue",
            color:"red",
            transform: function(results){
                return results.filter(function(issue){
                    return issue.labels.some(function(label){
                        return label.name.toLowerCase() == "invalid";
                    });
                });
            }
        },
        {
            id:"github-enhancement",
            name:"",
            icon:"octicon-tag",
            title:"Enhancement",
            color:"#84b6eb",
            transform: function(results){
                return results.filter(function(issue){
                    return issue.labels.some(function(label){
                        return label.name.toLowerCase() == "enhancement";
                    });
                });
            }
        },
        {
            id:"github-question",
            name:"",
            icon:"octicon-broadcast",
            title:"Question",
            color:"magenta",
            transform: function(results){
                return results.filter(function(issue){
                    return issue.labels.some(function(label){
                        return label.name.toLowerCase() == "question";
                    });
                });
            }
        }
    ];

    exports.addComment = function(){
    }

    exports.call = function(locationName){
        this.config(locationName);
    };
});
