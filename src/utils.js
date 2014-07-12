/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

define(function (require, exports, module) {

    exports.colors = {
        isTooLightYIQ : function(hexcolor){
          var r = parseInt(hexcolor.substr(0,2),16);
          var g = parseInt(hexcolor.substr(2,2),16);
          var b = parseInt(hexcolor.substr(4,2),16);
          var yiq = ((r*299)+(g*587)+(b*114))/1000;
          return yiq >= 128;
        }
    }

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
                return elem.state == "opened";
            },
            closed : function(elem){
                return elem.state == "closed";
            },
            byApiId: function(number){
                return function(elem){
                    return elem.apiId == number;
                }
            }
        }
    }

});
