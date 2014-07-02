/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

define(function (require, exports, module) {
    var self = this;
    self.data = {
        issues: {},
        time: {}
    };

    self.baseUrl = "";

    self._observers = {
        onStartRequest: [],
        onSuccessRequest : []
    }

    self.onStartRequest = function(f){
        self._observers.onStartRequest.push(f);
    };

    self.onSuccessRequest = function(f){
        self._observers.onSuccessRequest.push(f);
    };

    self._requestStarted = function(query){
        self._observers.onStartRequest.every(function(elem){
            return elem(query);
        })
    };

    self._requestSuccess = function(data){
        self._observers.onSuccessRequest.every(function(elem){
            return elem(data);
        })
    }

    exports.setGithubRepository = function(repo,callback){
        var regex = /github.com\/(.*)/g,
            githubUrl = regex.exec(repo),
            githubContext,
            url;

        if(!githubUrl || !githubUrl[1]){
            return false
        }

        githubContext = githubUrl[1];
        self.baseUrl = "https://api.github.com/repos/" + githubContext;
        url = self.baseUrl + "/issues?state=all";
        self._requestStarted(url);
        $.getJSON(url,function(data){
            self.data.issues = data;
            self.data.time = new Date();
            self._requestSuccess(self.data);
            callback(self.data.issues);
        });

        return self.baseUrl;
    }

    exports.issueDetail = function(number,callback){
        var url = self.baseUrl + "/issues/"+number+"/comments";
        self._requestStarted(url);
        $.getJSON(url, function(data){
            self._requestSuccess(data);
            callback(data);
        });
    }

    exports.onStartRequest = self.onStartRequest;
    exports.onSuccessRequest = self.onSuccessRequest;
    exports.data = this.data
})
