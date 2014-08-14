/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

define(function (require, exports, module) {
    "use strict";
    var title       = "Alice issue tracker";
    var id          = "alice-toolbar-element";
    var global      = this;


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

        this.shakeIt = function () {
            self.$icon.removeClass();
            self.$icon.addClass(self.classes.base + " " + self.classes.shakeIt);
        };
        this.error = function () {
            self.$icon.removeClass();
            self.$icon.addClass(self.classes.base + " " + self.classes.error);
        };
        this.active = function () {
            self.$icon.removeClass();
            self.$icon.addClass(self.classes.base + " " + self.classes.active);
        };
        this.inactive = function () {
            self.$icon.removeClass();
            self.$icon.addClass(self.classes.base);
        };

        self.$icon.appendTo(self.$toolbar);

        this.on = function(evt,f){
            self.$icon.on(evt,f);
        };

        self.borrame = [
            "shakeIt",
            "error",
            "active",
            "inactive"
        ];
        self.actual = 0;

        this.on("click", function(){
            self[self.borrame[self.actual]]();
            self.actual += 1;
            if(self.actual == 4){
                self.actual = 0;
            }
        });
    };

    exports.init = function () {
        global.activeToolbar = new ToolbarElement();
    };

    exports.getToolbar = function () {
        return global.activeToolbar;
    };
});
