/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, Mustache, brackets, $*/

define(function (require, exports) {

    var Dialogs             = brackets.getModule("widgets/Dialogs"),
        Tube                = require("src/tube").instance,
        AliceUtils          = require("src/view/aliceUtils");

    var self = this;
    self.Tube = Tube;

    this.config = function(locationName){
        var Model               = require("src/model/model").instance,
            Preferences         = require("src/preferences").instance(),
            dialogCredentials   = require("text!tpl/init/bitbucket/credentials.mustache");

        var location = Model.issueTrackers.filter(function(elem){
            return elem.name == locationName;
        });

        if(location.length > 0){
            location = location[0];
        }
        var serverLocation = Preferences.getServersByITName(location.domain);
        var credential = {
            name : location.name
        };
        credential.usr = serverLocation.credential?serverLocation.credential.usr:null;
        credential.pass = serverLocation.credential?serverLocation.credential.pass:null;
        var rendered = Mustache.render(dialogCredentials, credential);

        var dialog = Dialogs.showModalDialogUsingTemplate(rendered);

        dialog.done(function(){
            self.Tube.drop("changePanel",{to:"init"});
        });

        $("#alice-save-credential").click(function(){
            var credential = {
                usr: $("#alice-new-access-user").val(),
                pass: $("#alice-new-access-pass").val()
            };
            Preferences.updateCredentals(serverLocation,credential);
            dialog.close();
        });
    };

    exports.transformers = [
        {
            id:"bitbucket-blocker",
            name:"",
            icon:"octicon-circle-slash",
            color:"red",
            transform: function(results){
                return results.filter(function(issue){
                    return issue.labels.some(function(label){
                        return label.name.indexOf(AliceUtils.images.priorities.blocker) != -1;
                    });
                });
            }
        },
        {
            id:"bitbucket-critical",
            name:"",
            icon:"octicon-arrow-up",
            color:"red",
            transform: function(results){
                return results.filter(function(issue){
                    return issue.labels.some(function(label){
                        return label.name.indexOf(AliceUtils.images.priorities.critical) != -1;
                    });
                });
            }
        },
        {
            id:"bitbucket-major",
            name:"",
            icon:"octicon-arrow-small-up",
            color:"red",
            transform: function(results){
                return results.filter(function(issue){
                    return issue.labels.some(function(label){
                        return label.name.indexOf(AliceUtils.images.priorities.major) != -1;
                    });
                });
            }
        },
        {
            id:"bitbucket-trivial",
            name:"",
            icon:"octicon-arrow-small-down",
            color:"green",
            transform: function(results){
                return results.filter(function(issue){
                    return issue.labels.some(function(label){
                        return label.name.indexOf(AliceUtils.images.priorities.trivial) != -1;
                    });
                });
            }
        },
        {
            id:"bitbucket-minor",
            name:"",
            icon:"octicon-arrow-down",
            color:"green",
            transform: function(results){
                return results.filter(function(issue){
                    return issue.labels.some(function(label){
                        return label.name.indexOf(AliceUtils.images.priorities.minor) != -1;
                    });
                });
            }
        },
    ];

    exports.call = function(locationName){
        this.config(locationName);
    };
});
