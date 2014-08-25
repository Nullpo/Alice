/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, Mustache, $*/

define(function (require, exports) {
    var Tube      = require("src/tube").instance;
    var panel = (function(){
        var self = this,
            _html = require("text!tpl/init/issueDetail.mustache"),
            _toolbar = require("text!tpl/init/issueDetailToolbar.mustache");

        Mustache.parse(_html);
        Mustache.parse(_toolbar);

        return {
            render: function(args) {
                return {
                    toolbar: Mustache.render(_toolbar),
                    content: "Loading..."
                };
            },
            afterRender: function(args,$toolbar, $content){
                var Model  = require("src/model/model").instance,
                    number = args.data;

                Model.issueDetail(number).done(function(resp){
                    var Marked = require("third_party/marked");
                    if(resp.issue.body){
                        resp.issue.parsedBody = Marked(resp.issue.body);
                    }

                    var data = {
                        issue : resp.issue,
                        comments: resp.comments.map(function(elem){
                            elem.parsedBody = Marked(elem.body);
                            return elem;
                        })
                    };
                    $content.html(Mustache.render(_html,data));
                });

                return;
            },
            events: function() {
                 $("#alice-btn-back").click(function(){
                    Tube.drop("changePanel",{
                            to: "issues"
                    });
                });
            }
        };
    })();

    exports.instance = panel;
});
