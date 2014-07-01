/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

define(function (require, exports, module) {

    exports.filters = {
        operators : {
            UNION : function(filter1,filter2){
                return function(elem){
                    return filter1(elem) && filter2(elem);
                }
            }
        },
        issues:{
            all:function(){ return true},
            bugs:function(elem){
                return elem.labels.some(function(obj){
                    return obj.name == "bug";
                });
            },
            opened : function(elem){
                return elem.closed_at == null;
            },
            closed : function(elem){
                return elem.closed_at != null;
            },
            byNumber: function(number){
                return function(elem){
                    return elem.number == number;
                }
            }
        }
    }

});
