/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

define(function (require, exports, module) {
    var ProjectManager  = brackets.getModule("project/ProjectManager"),
        Async           = brackets.getModule('utils/Async'),
        Preferences     = require("src/preferences"),
        Github          = require("src/integrators/github"),
        Gitlab          = require("src/integrators/gitlab"),
        Redmine         = require("src/integrators/redmine");


    var self = this;
    self.projectManager = ProjectManager;
    self.repositoryHandlers = [];

    self.data = {
        issues          : {},
        time            : {},
        hasBeenLoaded   : false,
        accessToken     : undefined,
        integrator      : null,
        baseUrl         : "",
        repositories    : []
    };



    self.repositoryHandlers.push(Github);
    self.repositoryHandlers.push(Gitlab);

    self._observers = {
        onStartRequest: [],
        onSuccessRequest : [],
        onFailRequest    : []
    }

    self.repositoryHandlers.findByType = function(type){
        return this.filter(function(elem){
            return elem.name == type;
        });
    };

    self.onStartRequest = function(f){
        self._observers.onStartRequest.push(f);
    };

    self.onSuccessRequest = function(f){
        self._observers.onSuccessRequest.push(f);
    };

    self.onFailRequest = function(f){
        self._observers.onFailRequest.push(f);
    };

    self._requestStarted = function(query){
        self._observers.onStartRequest.every(function(elem){
            return elem(query);
        });
    };

    self._requestSuccess = function(data){
        self._observers.onSuccessRequest.every(function(elem){
            return elem(data);
        });
    }

    self._requestFail = function(err,code) {
        self._observers.onFailRequest.every(function(elem){
            return elem(err, code);
        });
    }

    //ProjectManager.projectRefresh
    /**
        @Example
        callbackOk
        callbackFail
    */
    self.getProjectValidRepositories = function(callbackOk, callbackFail) {
        return function(){
            console.log("Getting project default repositories");
            var possibleRepositories = [];
            var promises = [];

            self._requestStarted("");

            self.repositoryHandlers.forEach(function(elem){
                promises.push(elem.getProjectValidRepositories(possibleRepositories));
            });

            Async.waitForAll(promises).done(function(){
                console.log("Obtained project default repositories:");
                console.log(possibleRepositories);
                self.data.repositories = possibleRepositories;
                var validRepos = possibleRepositories.filter(function(elem){
                    return elem.error == null;
                });
                if(!validRepos.length){
                    self._requestFail(promises);
                    callbackFail(possibleRepositories);
                } else {
                    self._requestSuccess(possibleRepositories);
                    callbackOk(possibleRepositories);
                }
            });
        }
    };

    /**
        @Example
        {
            type        : validRepos[0].type,
            repository  : validRepos[0].data.url,
            done        : self.repositoryChanged,
            fail        : self.repositoryNotFound,
        }
    */
    self.setRepository = function(data) {
        var handler = self.repositoryHandlers.findByType(data.type);

        //Check if its a valid URL
        if(handler && handler[0].isValidUrl(data.repository)){
            self.data.repository = data.repository;
            self.data.integrator = {
                type        : data.type,
                handler     : handler[0],
            };
            return true;
        }
        return false;
    }

    /**
        @example
        model.update();
    */
    self.update = function(){
        var data        = self.data;
        self._requestStarted(data.repository);

        var promise = self.data.integrator.handler.getIssues({
            url         : data.repository,
            page        : 1,
        });

        promise.done(function(respData){
            self._requestSuccess(respData);
            data.issues = respData;
        });

        promise.fail(function(jqxhr, textStatus, error){
            self._requestFail(data.baseUrl, jqxhr.status);
            data.issues = null;
        });

        return promise;
    }

    /**
    */
    self.issueDetail = function(number,callback){
        self._requestStarted(self.data.repository);

        var promise = self.data.integrator.handler.issueDetail({
            number      : number,
            url         : self.data.repository,
            page        : 1
        });

        promise.done(function(data){
            self._requestSuccess(data);
            callback(data);
        });

        promise.fail(function(jqxhr, textStatus, error ){
            self._requestFail(url, jqxhr.status);
        });

    };

    exports.issueDetail = self.issueDetail;
    exports.setRepository = self.setRepository;
    exports.onStartRequest = self.onStartRequest;
    exports.onSuccessRequest = self.onSuccessRequest;
    exports.data = this.data;
    exports.getRawUrl = function(){
        return self.rawUrl;
    };
    exports.update = self.update;

    exports.testConnection = function(data){
        var token = data.token,
            done = data.done,
            fail = data.fail;

        $.getJSON("https://api.github.com/?access_token=" + token)
            .success(done)
            .fail(fail);
    }

    exports.onRefreshProject = function(ok, fail){
        if(self.projectManager.getProjectRoot())
            self.getProjectValidRepositories(ok,fail)();

        $(self.projectManager).on("projectOpen", self.getProjectValidRepositories(ok,fail));
        $(self.projectManager).on("projectRefresh", self.getProjectValidRepositories(ok,fail));
    }
})
