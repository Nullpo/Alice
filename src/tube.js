/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets */

define( function( require, exports ) {
    'use strict';

    var Tube = function(){
            var self = this;

            this.subscriptions = { };

            this.drop = function(subscription,params){
                console.log("[subs] "  + subscription + " -> " + JSON.stringify(params));

                if(self.subscriptions[subscription]){
                    self.subscriptions[subscription].forEach(function(subscriptor){
                        try {
                            subscriptor(params);
                        } catch (exception) {
                            console.error("The subscriptor throwed an error: " + exception.message);
                            console.error(exception.stack);
                        }
                    });
                } else {
                    console.warn("[tube] We have recieved a message without listeners!");
                    console.warn(subscription);
                    console.warn(params);
                    console.warn("[tube] end");
                }
            };
            this.on = function(subscription, listener){
                if(!self.subscriptions[subscription]){
                    self.subscriptions[subscription] = [];
                }

                self.subscriptions[subscription].push(listener);
                return self;
            };
    };


    exports.instance = new Tube();
});
