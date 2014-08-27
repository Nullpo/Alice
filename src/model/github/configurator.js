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
        var serverLocation = Preferences.getLocationByITName(location.domain);

        var rendered = Mustache.render(dialogCredentials, {
            token: serverLocation.credential,
            name : location.name
        });

        var dialog = Dialogs.showModalDialogUsingTemplate(rendered);

        dialog.done(function(){
            self.Tube.drop("changePanel",{to:"init"});
        });

        $("#alice-save-credential").click(function(){
            var credential = $("#alice-new-credential").val();
            Preferences.updateCredentals(serverLocation,credential);
            dialog.close();
        });
    };


    exports.call = function(locationName){
        this.config(locationName);
    };
});
