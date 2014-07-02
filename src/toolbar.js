define(function (require, exports, module) {
    // class = "alice-icon"
    // title = i18n.BTN_TOGGLE
    // id = alice-toolbar-button
    var ToolbarIcon = function(baseCssClass,title,id){
        var self = this,
            $icon = $("<a id='"+id+"' href='#'></a>")
                .attr("title", title)
                .addClass(baseCssClass);

        self._states = {
            default: baseCssClass
        }

        self.$icon = $icon;

        self.putInToolbar = function(){
            $icon.appendTo($("#main-toolbar .buttons"));
        }

        self.addState = function(name,cssState) {
            self._states[name] = cssState;
        }

        self.changeState = function(name){
            $icon.removeClass();
            $icon.addClass(self._states.default + " " +self._states[name]);
        }
        self.on = function(evt,f){
            $icon.on(evt,f);
        }
    }

    exports.ToolbarIcon = {
        createIcon: function(params){
            return new ToolbarIcon(params.defaultCssClass,params.title,params.id);
        }
    }
});
