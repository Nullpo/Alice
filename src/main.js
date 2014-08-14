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
        deferred.resolve();
        return deferred;
    };

    self.loadPreferences = function () {
        var deferred = $.Deferred();
        self.preferences = require("src/preferences");
        self.preferences.init();

        console.debug(self.preferences.instance.getLocations());

        deferred.resolve();
        return deferred;
    };

    self.fillModel = function () {
        var deferred = $.Deferred();
        deferred.resolve();
        return deferred;
    };

    self.viewEvents = function () {
        var deferred = $.Deferred();
        deferred.resolve();
        return deferred;
    };


    self.init = function () {
        var jobs = [
            self.initView,
            self.loadPreferences,
            self.fillModel,
            self.viewEvents,
        ];

        return Async.chain(jobs);
    };

    exports.init = self.init;
});
