/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets */

define( function( require, exports ) {
	'use strict';
    var	PreferencesManager = brackets.getModule( 'preferences/PreferencesManager' );
    var clazz = this;

    var Preferences = function(){
        var self = this;
        self.init = function(){
            self.prefs = PreferencesManager.getExtensionPrefs( 'nullpo.alice-issuetracker' );

            var defaultServers = [
                {
                    domain      : "^github\\.com" ,
                    api         : "https://api.github.com/repos/",
                    credential  : "",
                    protocol    : "Github",
                    name        : "Github",
                    fixed       : true
                },
                {
                    domain      : "^gitlab\\.com",
                    api         : "https://gitlab.com/api/v3/projects/",
                    credential  : "",
                    protocol    : "Gitlab",
                    name        : "Gitlab cloud",
                    fixed       : true
                },
                {
                    domain      : "^bitbucket\\.com",
                    api         : "https://bitbucket.org/api/1.0/repositories/",
                    credential  : "",
                    protocol    : "Bitbucket",
                    name        : "Bitbucket cloud",
                    fixed       : true
                }
            ];

            self.prefs.definePreference('servers', 'object', defaultServers);
            //self.prefs.set('locations',defaultLocations);
            self.prefs.save();
            var issueTrackers = self.prefs.get("issueTrackers",
                                               PreferencesManager.CURRENT_PROJECT);

            if(!issueTrackers){
                var defaultRepositories = {
                    "last" : "Github",
                };

                self.prefs.set("issueTrackers", defaultRepositories);
            }

            self.prefs.save();
        };

        self.getLocations = function (){
            return self.prefs.get("servers");
        };


        self.getLocationByIT = function (issueTracker) {
            var locations = self.getLocations();
            var resp = locations.filter( function(elem) {
                return issueTracker.domain.match(new RegExp(elem.domain)) && true;
            });

            return resp? resp[0] : undefined;
        };

        self.getLocationByITName = function(domain) {
            var locations = self.getLocations();
            var resp = locations.filter( function(elem) {
                return domain.match(new RegExp(elem.domain)) && true;
            });

            return resp? resp[0] : undefined;
        };

        self._setIssueTrackers = function(object) {
            self.prefs.set("issueTrackers", object, PreferencesManager.CURRENT_PROJECT);
            self.prefs.save();
            self.prefs = PreferencesManager.getExtensionPrefs( 'nullpo.alice-issuetracker' );
        };

        self.getLocationByDomain = function(name){
            return self.prefs.get('servers')[name];
        };

        self.getIssueTrackers = function(){
            return self.prefs.get("issueTrackers", PreferencesManager.CURRENT_PROJECT);
        };

        self.getIssueTrackerByName = function(name) {
            return self.getIssueTrackers()[name];
        };

        self.setIssueTrackerByName = function(name, object) {
            var issueTrackers = self.getIssueTrackers();
            issueTrackers[name] = object;
            self._setIssueTrackers(issueTrackers);
        };
        self.updateCredentals = function(location,credential){
            var servers = self.prefs.get('servers');

            for(var i = 0; i < servers.length;i++){
                if(location.domain == servers[i].domain)
                    break;
            }
            servers[i].credential = credential;
            self.prefs.set('servers',servers);
            self.prefs.save();
            self.prefs = PreferencesManager.getExtensionPrefs( 'nullpo.alice-issuetracker' );
        };
    };

    exports.init = function() {
        clazz.singleton = (new Preferences());
        clazz.singleton.init();
    };

    exports.instance = function(){
        return clazz.singleton;
    };
});
