/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

define(function (require, exports, module) {
    "use strict";


    var AppInit         = brackets.getModule("utils/AppInit"),
        CommandManager  = brackets.getModule("command/CommandManager"),
        Commands        = brackets.getModule("command/Commands"),
        ExtensionUtils  = brackets.getModule("utils/ExtensionUtils"),
        Menus           = brackets.getModule("command/Menus");

    var Main            = require("src/main");

    ExtensionUtils.loadStyleSheet(module,"css/toolbar.css");

    //ExtensionUtils.loadStyleSheet(module,"css/main.css");
    //ExtensionUtils.loadStyleSheet(module,"css/loading.css");

    //Call main

    AppInit.appReady(function () {
        Main.init().done(function(){
            alert("All loaded");
        }).fail(function(){
            alert("Todo mal loco");
        });
    });

});
