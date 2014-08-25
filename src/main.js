/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

define(function (require, exports) {
    "use strict";
    var Async = brackets.getModule("utils/Async");
    var self = this;


    self.preferences = undefined;

    self.initView = function () {
        var deferred = $.Deferred(),
            mainview = require("src/view/mainview");
        mainview.init();
        self.mainview = mainview;
        deferred.resolve();
        return deferred;
    };

    self.loadPreferences = function () {
        var deferred = $.Deferred();
        self.preferences = require("src/preferences");
        self.preferences.init();

        console.debug(self.preferences.instance().getLocations());

        deferred.resolve();
        return deferred;
    };

    self.fillModel = function () {
        var deferred    = $.Deferred();
        var ModelClass  = require("src/model/model");
        self.model      = ModelClass.init();
        self.model.done(function(){
            self.model = ModelClass.instance;
            deferred.resolve();
        }).fail(function(resp){
            self.model = ModelClass.instance;
            deferred.reject(resp);
        });

        return deferred;
    };

    self.viewEvents = function () {
        var deferred = $.Deferred();
        console.debug("****** View events ******");
        console.debug(self.model.data.lastIssueList);
        console.debug("*************************");
        deferred.resolve();
        return deferred;
    };

    self.debugAsync = function(text) {
        return function() {
            var deferred = $.Deferred();
            console.debug(text);
            deferred.resolve();
            return deferred;
        };
    };

    self.init = function () {
        self.initView();
        self.loadPreferences();

        var jobs = [
            self.fillModel,
            self.viewEvents,
        ];
        return Async.chain(jobs);
    };

    exports.init = self.init;
});
