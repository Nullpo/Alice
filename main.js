/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets,$ */

define(function (require, exports, module) {
    "use strict";


    var AppInit         = brackets.getModule("utils/AppInit"),
        ExtensionUtils  = brackets.getModule("utils/ExtensionUtils"),
        Tube            = require("src/tube"),
        Model           = require("src/model/model"),
        Preferences     = require("src/preferences"),
        ProjectManager  = brackets.getModule("project/ProjectManager");;

    var Main            = require("src/main");

    ExtensionUtils.loadStyleSheet(module,"css/toolbar.css");
    ExtensionUtils.loadStyleSheet(module,"css/alice-panels.css");

    //ExtensionUtils.loadStyleSheet(module,"css/main.css");
    //ExtensionUtils.loadStyleSheet(module,"css/loading.css");

    //Call main
    AppInit.appReady(function () {
        Main.init().done(function(){
            console.log("All loaded");

        }).fail(function(){
            var Tube  = require("src/tube").instance;
            Tube.drop("error",arguments[0]);

            if(arguments[0] && arguments[0].stack){
                console.error(arguments[0].stack);
            } else {
                console.error(arguments);
            }
        });
    });

    var onReload = function(){
        Tube.instance.drop("clickOnToolbar");

        //Reload preferences
        if(Preferences.instance() && Preferences.instance().init){
            Preferences.instance().init();

            //Reload model
            Model.init().done(function(){
                Tube.instance.drop("changePanel",{to:"init"});
            });

            console.debug("Reload complete!");
        }
    };

    $(ProjectManager).on("projectOpen", onReload);
    $(ProjectManager).on("projectRefresh", onReload);

});
