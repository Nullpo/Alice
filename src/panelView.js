define(function (require, exports, module) {
    var PanelManager   = brackets.getModule("view/PanelManager");

    var PanelView = function(props){
        var self = this;
        self._visible = false;
        self._realVisibility = false;
        self._listeners = props;
        self.panelHTML = props.html;
        self._name = props.name;
        self._minWidth = props.minWidth;
        self._onCreation = props.onCreation;
        self.panel = undefined;

        self.togglePanel = function(){
            self._visible = !self._visible
            self._setPanelVisibility(self._visible);
        }

        self._setPanelVisibility = function(isVisible){
            if (isVisible === self._realVisibility) {
                return;
            }

            self._realVisibility = isVisible;

            if (isVisible) {
                if(!self.panel){
                    var $panel = $(self.panelHTML);
                    self.panel = PanelManager.createBottomPanel(self._name, $panel,self._minWidth);


                    $panel.on("panelResizeUpdate", function (e, newSize) {
                        //$("#bottom-alice-content")
                    });
                    self._onCreation($panel);
                }
                self.panel.show();
            } else {
                self.panel.hide();
            }
        }
    };

    exports.create = function(props){
        return new PanelView(props);
    }

})
