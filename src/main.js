/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

define(function (require, exports) {
    "use strict";
    var Async           = brackets.getModule("utils/Async"),
        ProjectManager  = brackets.getModule("project/ProjectManager"),
        self = this;


    self.preferences = undefined;
    self.projectManager = ProjectManager;

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
        deferred.resolve();
        return deferred;
    };

    self.fillModel = function () {
        var deferred    = $.Deferred();
        var ModelClass  = require("src/model/model");
        self.model      = ModelClass.init();
        self.model.done(function (){
            self.model = ModelClass.instance;
            deferred.resolve();
        }).fail(function(resp){
            self.model = ModelClass.instance;
            deferred.reject(resp);
        });

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

        var jobs = [
            self.loadPreferences,
            self.fillModel
        ];

        return Async.chain(jobs);
    };

    exports.init = self.init;
});
