/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, Mustache, $*/

define(function (require, exports) {
    var Utils = require("src/view/aliceUtils");
    var Tube      = require("src/tube").instance;
    var panel = (function(){
        var self = this,
            _html = require("text!tpl/init/issueList.mustache"),
            _toolbar = require("text!tpl/init/issueListToolbar.mustache"),
            _panelButtons = [
                {id: "nullpo-alice-btn-bugs",filter:Utils.filters.issues.bugs},
                {id: "nullpo-alice-btn-open",filter:Utils.filters.issues.opened},
                {id: "nullpo-alice-btn-closed",filter:Utils.filters.issues.closed},
                {id: "nullpo-alice-btn-all",filter:Utils.filters.issues.all}
            ];

        Mustache.parse(_html);
        Mustache.parse(_toolbar);

        return {
            render: function(filterData) {
                var Model = require("src/model/model").instance;
                var data = {
                    issues: Model.data.lastIssueList
                };
                var toolbarData = {
                    transformers : Model.getTransformers()
                };

                if(filterData.data && filterData.data.filter){
                    data.issues = data.issues.filter(filterData.data.filter);
                }

                if(filterData.transform){
                    data.issues = filterData.transform(data.issues);
                }

                return {
                    toolbar: Mustache.render(_toolbar,toolbarData),
                    content: Mustache.render(_html,data)
                };
            },
            afterRender: function(filterData){
                if(filterData.data && filterData.data.filter){
                    $("#"+filterData.data.id).attr("class","btn-primary");
                } else {
                    $("#nullpo-alice-btn-all").attr("class","btn-primary");
                }

                if(filterData.transformId){
                    $("#nullpo-alice-btn-transformer-" + filterData.transformId)
                        .attr("class","btn-primary");
                }

            },
            events: function(bla,$toolbar,$content,filterData) {
                var Model = require("src/model/model").instance;
                var transformers = Model.getTransformers();

                if(transformers){
                    transformers.forEach(function(elem){
                        $("#nullpo-alice-btn-transformer-" + elem.id).click(function(){
                            if($(this).attr("class").indexOf("btn-primary") == -1){
                                filterData.transform = elem.transform;
                                filterData.transformId = elem.id;
                            } else {
                                filterData.transform = undefined;
                                filterData.transformId = undefined;
                            }
                            Tube.drop("changePanel",filterData);
                        });
                    });
                }



                _panelButtons.forEach(function(elem){
                    $("#"+elem.id).click(function(){
                        Tube.drop("changePanel",{
                            to: "issues",
                            data : elem
                        });
                    });
                });

                $(".alice-get-details").click(function(){
                    Tube.drop("changePanel",{
                            to: "detail",
                            data : $(this).data("number")
                    });
                });

                $("#nullpo-alice-btn-settings").click(function(){
                    Tube.drop("changePanel",{
                        to: "config"
                    });
                });
            }
        };
    })();

    exports.instance = panel;
});
