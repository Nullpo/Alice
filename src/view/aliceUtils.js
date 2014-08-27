/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require, exports) {

    exports.colors = {
        isTooLightYIQ : function (hexcolor){
          var r = parseInt(hexcolor.substr(0,2),16);
          var g = parseInt(hexcolor.substr(2,2),16);
          var b = parseInt(hexcolor.substr(4,2),16);
          var yiq = ((r*299)+(g*587)+(b*114))/1000;
          return yiq >= 128;
        }
    };

    exports.images = {
        priorities: {
blocker:"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE2LjAuNCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiICB2aWV3Qm94PSIwIDAgMzIgMzIiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDMyIDMyIiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHBhdGggaWQ9IkJsb2NrZXIiIGZpbGw9IiNEMDQ0MzciIGQ9Ik0xNS45OTksMy45OThjLTYuNjE4LDAtMTIuMDAyLDUuMzg1LTEyLjAwMiwxMi4wMDRjMCw2LjYxNyw1LjM4NCwxMiwxMi4wMDIsMTIKCWM2LjYxOSwwLDEyLjAwNC01LjM4MywxMi4wMDQtMTJDMjguMDAzLDkuMzgzLDIyLjYxOCwzLjk5OCwxNS45OTksMy45OTh6IE0yNC4wMDMsMTYuMDAyYzAsMS40ODEtMC40MTIsMi44NjUtMS4xMTcsNC4wNTYKCUwxMS45NDMsOS4xMTVjMS4xOTEtMC43MDUsMi41NzUtMS4xMTcsNC4wNTYtMS4xMTdDMjAuNDEyLDcuOTk4LDI0LjAwMywxMS41ODgsMjQuMDAzLDE2LjAwMnogTTcuOTk3LDE2LjAwMgoJYzAtMS40ODIsMC40MTItMi44NjcsMS4xMTgtNC4wNTlsMTAuOTQyLDEwLjk0MmMtMS4xOTEsMC43MDUtMi41NzUsMS4xMTctNC4wNTgsMS4xMTdDMTEuNTg3LDI0LjAwMiw3Ljk5NywyMC40MTMsNy45OTcsMTYuMDAyeiIvPgo8L3N2Zz4K",        critical:"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE2LjAuNCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiICB2aWV3Qm94PSIwIDAgMzIgMzIiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDMyIDMyIiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHBhdGggaWQ9IkNyaXRpY2FsIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZmlsbD0iI0QwNDQzNyIgZD0iTTUuOTk4LDEyLjY3NWw5LjYwMi05LjY4MWgwLjc4MWw5LjYyMiw5LjY4MQoJbC0yLjI0LDIuMjYyTDE4LDkuMTU2VjIwYy0wLjE4LDItMC45LDMtMiwzYy0xLjEsMC0xLjc4MS0wLjczOC0yLTNWOS4xNzVsLTUuODIyLDUuNzA0TDUuOTk4LDEyLjY3NXogTTE4LDMwaC00di00aDRWMzB6Ii8+Cjwvc3ZnPgo=", major:'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE2LjAuNCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAzMiAzMiIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMzIgMzIiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8cGF0aCBpZD0iTWFqb3IiIGRpc3BsYXk9Im5vbmUiIGZpbGw9IiNEMjQ1MzgiIGQ9Ik01Ljk5OCwxMi42NzNsOS42MDQtOS42ODFoMC43NzlsOS42MjQsOS42ODFsLTIuMjQxLDIuMjYybC01Ljc2MS01Ljc4MXYxMC44NDQKCWMtMC4xODMsMi0wLjg5OSwzLTIuMDAyLDNjLTEuMSwwLTEuNzc5LTAuNzM4LTItM1Y5LjE3M2wtNS44MjIsNS43MDNMNS45OTgsMTIuNjczeiIvPgo8cGF0aCBpZD0iTWFqb3JfMV8iIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBmaWxsPSIjRDI0NTM3IiBkPSJNNS45OTgsMTIuNjczbDkuNjA0LTkuNjgxaDAuNzc5bDkuNjI0LDkuNjgxCglsLTIuMjQyLDIuMjYybC01Ljc2LTUuNzgxdjEwLjg0NGMtMC4xODIsMi0wLjksMy0yLjAwMiwzYy0xLjEsMC0xLjc3OS0wLjczOC0yLTNWOS4xNzNsLTUuODIyLDUuNzAzTDUuOTk4LDEyLjY3M3oiLz4KPC9zdmc+Cg==',
trivial:'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE2LjAuNCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiICB2aWV3Qm94PSIwIDAgMzIgMzIiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDMyIDMyIiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHBhdGggaWQ9IlRyaXZpYWwiIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBmaWxsPSIjMUE4QTQzIiBkPSJNMjYuMDAzLDE2LjMxOWwtOS42MDIsOS42ODRoLTAuNzc5bC05LjYyMy05LjY4NAoJbDIuMjQtMi4yNThMMTQsMTkuODQzVjE1YzAuMTgxLTIuMDAyLDAuOS0zLjAwMiwyLjAwMS0zLjAwMmMxLjA5OSwwLDEuNzgxLDAuNzQyLDIsMy4wMDJ2NC44MTlsNS44MjItNS43TDI2LjAwMywxNi4zMTl6Ii8+Cjwvc3ZnPgo=',
minor:"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE2LjAuNCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiICB2aWV3Qm94PSIwIDAgMzIgMzIiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDMyIDMyIiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHBhdGggaWQ9Ik1pbm9yIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZmlsbD0iIzFBOEE0MyIgZD0iTTI2LjAwNCwxNi4zMTlMMTYuNCwyNi4wMDNoLTAuNzc5bC05LjYyMy05LjY4NAoJbDIuMjQtMi4yNThMMTQsMTkuODQzVjguOTk5YzAuMTgtMi4wMDEsMC45LTMuMDAxLDItMy4wMDFjMS4xMDIsMCwxLjc4MiwwLjc0LDIuMDAyLDMuMDAxdjEwLjgyMWw1LjgyLTUuN0wyNi4wMDQsMTYuMzE5eiIvPgo8L3N2Zz4K"
        }
    };

    exports.filters = {
        operators : {
            UNION : function(filter1,filter2){
                return function(elem){
                    return filter1(elem) && filter2(elem);
                };
            }
        },
        issues:{
            all:function(){ return true; },
            bugs:function(elem){
                return elem.labels.some(function(obj){
                    return obj.name == "bug";
                });
            },
            opened : function(elem){
                return elem.state == "open" || elem.state == "opened" ||
                    elem.state == "new" || elem.state == "on hold";
            },
            closed : function(elem){
                return elem.state == "closed" || elem.state == "resolved" ||
                        elem.state == "duplicate"  || elem.state == "invalid" ||
                        elem.state == "wontfix";
            },
            byNumber: function(number){
                return function(elem){
                    return elem.number == number;
                };
            }
        }
    };

});
