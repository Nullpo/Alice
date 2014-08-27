/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

define(function (require, exports) {
    "use strict";
    var Preferences = require("src/preferences"),
        Async       = brackets.getModule("utils/Async"),
        clazz       = this;

    clazz.Tube      = require("src/tube").instance;

    clazz.genericIT = {
        "Github" : {
            connector    : require("src/model/github/connector"),
            lookup       : require("src/model/github/lookup"),
            configurator : require("src/model/github/configurator"),
        },
        "Gitlab" : {
            connector    : require("src/model/gitlab/connector"),
            lookup       : require("src/model/gitlab/lookup"),
            configurator : require("src/model/gitlab/configurator")
        },
        "Bitbucket" : {
            connector    : require("src/model/bitbucket/connector"),
            lookup       : require("src/model/bitbucket/lookup"),
            configurator : require("src/model/bitbucket/configurator")
        },
    };

    clazz.model = null;

    var Model = function(issueTrackers) {
        var self = this;
        this.issueTrackers = null;

        this.getConfigurator = function(protocol){
            var issueTracker = this.issueTrackers.filter(function(elem){
                return elem.protocol == protocol;
            })[0];
            return clazz.genericIT[issueTracker.protocol].configurator;
        };

        this.getTransformers = function(protocol) {
            if(!protocol){
                protocol = this.data.selectedIssueTracker.protocol;
            }

            return this.getConfigurator(protocol).transformers;
        };



        this.data = {
            selectedIssueTracker : null,
            lastIssueList : [],
        };

        /**
        * Update the issue tracker list
        */
        this.update = function (issueTrackers) {
            this.issueTrackers = issueTrackers;
        };

        /**
        * Refresh the issue list
        */
        this.refresh = function () {
            clazz.Tube.drop("busy");
            if(this.data.selectedIssueTracker === null){
                this._changeToFirst();
            }

            var protocol = this.data.selectedIssueTracker.protocol,
                it       = this.data.selectedIssueTracker,
                server = Preferences.instance().getServerByIT(it);

            return clazz.genericIT[protocol].connector.getIssues(it, server).done(function(resp){
                clazz.Tube.drop("notbusy");
                self.data.lastIssueList = resp;
            }).fail(function(data){
                clazz.Tube.drop("error",{
                    data: data
                });
            });
        };

        this._changeToFirst = function() {
            this.data.selectedIssueTracker = this.issueTrackers[0];
        };

        /**
        * Changes the actual issue tracker, and refresh the issue list.
        */
        this.changeTo = function(nameIT) {
            var tmp = this.issueTrackers.filter(function(elem){
                return elem.name == nameIT;
            });

            this.data.selectedIssueTracker = tmp? tmp[0] : null;
            return this.refresh();
        };

        this.issueDetail = function(number){
            var protocol = this.data.selectedIssueTracker.protocol,
                it       = this.data.selectedIssueTracker,
                server = Preferences.instance().getServerByIT(it),
                deferred = $.Deferred();

            clazz.genericIT[protocol].connector.issueDetail(it, server,number).done(function(resp){
                clazz.Tube.drop("notbusy");
                var theIssue = null;
                for(var i = 0; i < self.data.lastIssueList.length;i++){
                    if(self.data.lastIssueList[i].apiId == number){
                        theIssue = self.data.lastIssueList[i];
                    }
                }
                deferred.resolve({
                    issue: theIssue,
                    comments: resp
                });
            }).fail(function(data){
                clazz.Tube.drop("error",{
                    data: data
                });
                deferred.reject(data);
            });
            return deferred;
        };

        this.update(issueTrackers);
    };

    clazz.availableIT = function () {
        var deferred = $.Deferred();
        var toDo = [];
        for(var property in clazz.genericIT){
            var job = clazz.genericIT[property].lookup.project;
            toDo.push(job);
        }

        Async.chain(toDo,[[]]).done(function(response){
            deferred.resolve(response);
        }).fail(function(response){
            console.log(response);
            deferred.reject(response);
        });

        return deferred;
    };

    exports.init = function () {
        var deferred = $.Deferred();
        //TODO: Migration from previous versions.

        //DOING: Get issue trackers from the project
        clazz.availableIT().done(function(response){
            clazz.model = new Model(response);
            exports.instance = clazz.model;

            if(response.length === 0){
                var Tube = require("src/tube").instance;
                Tube.drop("error",{
                    "status": "NoIT"
                });
            }
            deferred.resolve();
            /*if(response.length === 1){
                clazz.model.refresh("origin").done(function(resp){
                    deferred.resolve(resp);
                }).fail(function(resp){
                    deferred.reject(resp);
                });
            }*/
        }).fail(function(bleh){
            console.log("BLEH");
        });

        return deferred;
    };
});

















