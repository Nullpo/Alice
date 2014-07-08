/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

define(function (require, exports, module) {
    var AppInit         = brackets.getModule("utils/AppInit"),
        FileSystem      = brackets.getModule("filesystem/FileSystem"),
        ProjectManager  = brackets.getModule("project/ProjectManager"),
        FileUtils = brackets.getModule("file/FileUtils");

    var self = this;
    self.projectManager = ProjectManager;
    self.fileSystem = FileSystem;
    self.fileUtils = FileUtils;
    self.repositoryHandlers = [];
    self.data = {
        issues: {},
        time: {},
        hasBeenLoaded : false,
        accessToken : undefined
    };

    self.baseUrl = "";
    self.rawUrl = "";

    self._observers = {
        onStartRequest: [],
        onSuccessRequest : [],
        onFailRequest    : []
    }

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
        })
    };

    self._requestSuccess = function(data){
        self._observers.onSuccessRequest.every(function(elem){
            return elem(data);
        })
    }

    self._requestFail = function(err,code) {
        self._observers.onFailRequest.every(function(elem){
            return elem(err, code);
        });
    }

    //ProjectManager.projectRefresh
    self._getProjectRepositoryFromFile = function(callback) {
        return function(){
            var path = self.projectManager.getProjectRoot().fullPath + ".git/config"
            //TODO: Use regular expressions instead strUrl & strUrl2
            var f = self.fileSystem.getFileForPath(path);
            self.fileUtils.readAsText(f).done(function(data,warehaus){
                var strRemote       = '[remote "origin"]',
                    strUrl          = "url = git@github.com:",
                    strUrl2         = "url = https://github.com/",
                    lines           = data.split("\n"),
                    itsInOrigins    = false,
                    repo            = undefined;
                lines.every(function(obj){
                    if(!itsInOrigins){
                        if(obj.indexOf(strRemote) != -1){
                            itsInOrigins = true;
                        }
                    } else if(obj.indexOf(strUrl) != -1){
                        repo = obj.substring(obj.indexOf(strUrl) + strUrl.length, obj.length -4);
                        return false;
                    } else if(obj.indexOf(strUrl2) != -1) {
                        repo = obj.substring(obj.indexOf(strUrl2) + strUrl2.length, obj.length -4);
                        return false;
                    }
                    return true;
                });

                if(repo){
                    callback("https://github.com/"+repo);
                } else {
                    callback(undefined,undefined,"NotGithub");
                }
                return false;
            }).fail(function(a,b,c){
                callback(undefined,undefined,a);
            });
        }
    }

    self.repositoryHandlers.push(function(data){
        var repo = data.repository,
            done = data.done,
            fail = data.fail,
            regex = /github.com\/(.*)/g,
            githubUrl = regex.exec(data.repository),
            githubContext,
            url;

        console.log("Setting the new github repository: " + repo);

        if(!githubUrl || !githubUrl[1]){
            console.log("The URL is not a Github repository!" + repo);
            return false
        }

        self.rawUrl = repo;
        githubContext = githubUrl[1];
        self.baseUrl = "https://api.github.com/repos/" + githubContext;
        url = self.baseUrl + "/issues?state=all&per_page=100";
        if(self.data.accessToken){
            url += "&access_token=" + self.data.accessToken;
        } else {
            console.warn("The user doesn't have any acces token!");
        }


        self._requestStarted(url);

        $.getJSON(url,function(data){
            self.data.issues = data;
            self.data.time = new Date();
            self._requestSuccess(self.data);
            done(self.data.issues);
        }).fail(function(jqxhr, textStatus, error ){
            self.data.hasBeenLoaded = false;
            self._requestFail(url, jqxhr.status);
            fail(url, jqxhr.status);
        });

        return self.baseUrl;
    })

    self.issueDetail = function(number,callback){
        var url = self.baseUrl + "/issues/"+number+"/comments?per_page=100";
        if(self.data.accessToken){
            url += "&access_token=" + self.data.accessToken;
        } else {
            console.warn("The user doesn't have any acces token!");
        }
        self._requestStarted(url);
        $.getJSON(url, function(data){
            self._requestSuccess(data);
            callback(data);
        }).fail(function(jqxhr, textStatus, error ){
            self._requestFail(url, jqxhr.status);
        });
    };

    self.setRepository = function(data) {
        return self.repositoryHandlers.every(function(f){
          return !f(data);
        });
    }

    exports.issueDetail = self.issueDetail;
    exports.setRepository = self.setRepository;
    exports.onStartRequest = self.onStartRequest;
    exports.onSuccessRequest = self.onSuccessRequest;
    exports.data = this.data;
    exports.getRawUrl = function(){
        return self.rawUrl;
    }
    exports.testConnection = function(data){
        var token = data.token,
            done = data.done,
            fail = data.fail;

        $.getJSON("https://api.github.com/?access_token=" + token)
            .success(done)
            .fail(fail);
    }

    exports.onRefreshProject = function(callback){
        if(self.projectManager.getProjectRoot())
            self._getProjectRepositoryFromFile(callback)();

        $(self.projectManager).on("projectOpen", self._getProjectRepositoryFromFile(callback));
        $(self.projectManager).on("projectRefresh", self._getProjectRepositoryFromFile(callback));
    }
})
