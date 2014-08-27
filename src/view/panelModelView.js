/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $ */

define(function (require, exports) {
    var Tube = require("src/tube").instance;
    var panels = {
        "init"   : require(  "src/view/panelContents/init"  ).instance,
        "issues" : require( "src/view/panelContents/issues" ).instance,
        "config" : require( "src/view/panelContents/config" ).instance,
        "detail" : require( "src/view/panelContents/detail" ).instance,
        "error"  : require( "src/view/panelContents/error" ).instance,
    };
    var lazy = true;
    var lastState = { to: "init" };

    Tube.on("changePanel",function(args){
        if(lazy){
            lastState = args;
            return;
        }

        if(args.to){
            $("#alice-btn-change").unbind();
            $("#alice-btn-change").click(function(){
                Tube.drop("changePanel",{
                    to: "init",
                });
            });

            var htmls = panels[args.to].render(args);

            var $toolbar = $("#alice-panel-toolbar");
            var $content = $("#alice-panel-content");
            $toolbar.html(htmls.toolbar);
            $content.html(htmls.content);

            if(panels[args.to].afterRender){
                panels[args.to].afterRender(args,$toolbar,$content);
            }
            if(panels[args.to].events){
                panels[args.to].events($("#alice-bottom"),$toolbar,$content);
            }
        }
    });

    Tube.on("openPanel",function(){
        if(!lazy)
            return;
        lazy = false;

        Tube.drop("changePanel", lastState);
    });
});
