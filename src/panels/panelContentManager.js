define(function (require, exports, module) {

    var PanelView = require("src/panelView");
    var i18n = require("src/i18n").i18n;
    var filters = require("src/utils").filters;
    var clazz = this;

    var panelButtons = {
        BTN_SHOW_BUGS   : "nullpo-alice-btn-bugs",
        BTN_SHOW_OPENED : "nullpo-alice-btn-open",
        BTN_SHOW_CLOSED : "nullpo-alice-btn-closed",
        BTN_SHOW_ALL    : "nullpo-alice-btn-all"
    };

    var PanelContentManager = function(props){
        var self = this;
        self.name = props.name,
        self.minWidth = props.minWidth;
        self._events = {
            onToggle: function(){}
        }

        self._actualPanel = {
            view : undefined,
            controller : undefined
        };

        self.view = // First time!

        self.panels = {};

        self.changeTo = function(panelName,params){
            if(self._actualPanel.controller.beforeHide()){
                self.panels[panelName].show(params);
            }
        }

        self._firstTimeToggle = function(){
            var initController = self.panels.init;
            var initView = PanelView.create({
                html: self.panels.init.html,
                name: self.name,
                minWidth: self.minWidth,
                onCreation: self.panels.init.show
            });

            self._actualPanel.view = initView;
            self._actualPanel.controller = initController;
        }

        self.toggle = function(){
            var actualPanel = self._actualPanel;

            if(!actualPanel.view){
                self._firstTimeToggle();
            }
            var isVisible = actualPanel.view.togglePanel();
            self._events.onToggle(isVisible);
        }

        self.onToggle = function(f){
            self._events.onToggle = f;
        }

        self.addPanel = function(name,panel){
            self.panels[name] = panel;
            panel.contentManager = self;
        }
    };

    exports.create = function(props){
        return new PanelContentManager(props);
    }
});
