/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

define(function (require, exports) {
    require("src/view/panelModelView");

    var PanelManager   = brackets.getModule("view/PanelManager");
    var html           = require("text!tpl/panel.mustache");
    var clazz           = this;
    clazz.html          = html;
    clazz.Tube          = require("src/tube").instance;

    var PanelView = function(){
        var self = this;
        self.first = true;
        self._visible = false;
        self._realVisibility = false;
        self.panelHTML = clazz.html;
        self._minWidth = 200;
        self._onCreation = function(){};
        self.panel = undefined;

        self.togglePanel = function(){
            self._visible = !self._visible;
            var value =  self._setPanelVisibility(self._visible);
            if(value){
                clazz.Tube.drop("openPanel");
            } else {
                clazz.Tube.drop("closePanel");
            }

            if(self.first){
                self.first = false;
            }
            return value;
        };

        self._setPanelVisibility = function(isVisible){
            if (isVisible === self._realVisibility) {
                return self._realVisibility;
            }

            self._realVisibility = isVisible;

            if (isVisible) {
                if(!self.panel){
                    var $panel = $(self.panelHTML);
                    self.panel = PanelManager.createBottomPanel("ThePanel", $panel,self._minWidth);
                    self._onCreation($panel);
                    // Add close event
                    $panel.find(".close").click(function(){
                        self.togglePanel();
                    });
                }
                self.panel.show();
            } else {
                self.panel.hide();
            }
            return self._realVisibility;
        };
        clazz.Tube.on("clickOnToolbar",self.togglePanel);
    };

    exports.init = function() {
        var pnl = new PanelView();

        return pnl;
    };
});
