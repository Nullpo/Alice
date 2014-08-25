/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $ */

define(function (require, exports) {
    "use strict";
    var title       = "Alice issue tracker";
    var id          = "alice-toolbar-element";
    var Panel       = require("src/view/alicePanel");
    var global      = this;
    global.Tube        = require("src/tube").instance;

    var ToolbarElement = function () {
        var self = this;
        self.classes = {
                base   : "alice-icon",
                active : "alice-toolbar-open",
                shakeIt: "alice-toolbar-loading",
                error  : "alice-toolbar-error"
        };

        self.$icon = $("<a id='" + id + "' href='#'></a>")
                .attr("title", title)
                .addClass(self.classes.base);
        self.$toolbar = $("#main-toolbar .buttons");

        self.shakeIt = function () {
            self.$icon.removeClass();
            self.$icon.addClass(self.classes.base + " " + self.classes.shakeIt);
        };
        self.error = function () {
            self.$icon.removeClass();
            self.$icon.addClass(self.classes.base + " " + self.classes.error);
        };
        self.active = function () {
            self.$icon.removeClass();
            self.$icon.addClass(self.classes.base + " " + self.classes.active);
        };
        self.inactive = function () {
            self.$icon.removeClass();
            self.$icon.addClass(self.classes.base);
        };

        self.$icon.appendTo(self.$toolbar);

        this.on = function(evt,f){
            self.$icon.on(evt,f);
        };

        this.on("click",function(){
           global.Tube.drop("clickOnToolbar");
        });

        self.isPanelOpen = false;


        global.Tube.on("error", function() {
            self.error();
        });
        global.Tube.on("openPanel", function() {
            self.isPanelOpen = true;
            self.active();
        });
        global.Tube.on("closePanel", function() {
            self.isPanelOpen = false;
            self.inactive();
        });
        global.Tube.on("busy", function() {
            self.shakeIt();
        });
        global.Tube.on("notbusy", function() {
            if(self.isPanelOpen){
                self.active();
            } else {
                self.inactive();
            }
        });
    };

    exports.init = function () {
        global.activeToolbar = new ToolbarElement();
        Panel.init();
    };
});
