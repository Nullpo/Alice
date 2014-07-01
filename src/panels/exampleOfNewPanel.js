define(function (require, exports, module) {

     var Panel = function(props){
        var self = this;
        self.html = "<p>example</p>";
        self.contentManager = undefined;

        self.show = function(props){
            var propsToShow = {
                foo: "bar"
            }
            // This, calls the "anotherPanel" panel, and sends it to the
            // anotherPanel.show method, the argument "propsToShow"

            self.contentManager.changeTo("anotherPanel",propsToShow);
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
