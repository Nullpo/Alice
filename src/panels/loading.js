define(function (require, exports, module) {
     var panelHTML      = require("text!templates/panels/loading.html"),
         i18n           = require("src/i18n").i18n,
         loadingHTML   = $(panelHTML).filter("#alice-loading").html();

     Mustache.parse(loadingHTML);

     var Panel = function(props){
        var self = this;
        self.html = Mustache.render(loadingHTML, {text:i18n.LBL_LOADING});
        self.contentManager = undefined;

        self.show = function(props){
            //$("#bottom-alice-issues > .alice-bottom-content").html(i18n.LBL_LOADING);
            $("#bottom-alice-issues > .alice-bottom-content"
                    ).html(self.html);
        }

        self.beforeHide = function(){
            return true;
        }

        return self;
    }

    exports.create = function(props){
        return new Panel(props);
    }
});
