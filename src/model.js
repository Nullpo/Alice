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

    self.data = {
        issues: {},
        time: {}
    };

    self.baseUrl = "";
    self.rawUrl = "";

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
        self.rawUrl = repo;
        githubContext = githubUrl[1];
        self.baseUrl = "https://api.github.com/repos/" + githubContext;
        url = self.baseUrl + "/issues?state=all&per_page=100";
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
        var url = self.baseUrl + "/issues/"+number+"/comments?per_page=100";
        self._requestStarted(url);
        $.getJSON(url, function(data){
            self._requestSuccess(data);
            callback(data);
        });
    }

    exports.onStartRequest = self.onStartRequest;
    exports.onSuccessRequest = self.onSuccessRequest;
    exports.data = this.data

    //ProjectManager.projectRefresh
    self._getProjectRepositoryFromFile = function(callback) {
        return function(){
            var path = self.projectManager.getProjectRoot().fullPath + ".git/config"
            //[remote "origin"]
            var f = self.fileSystem.getFileForPath(path);
            self.fileUtils.readAsText(f).done(function(data,warehaus){
                var strRemote = '[remote "origin"]';
                var strUrl = "url = git@github.com:"
                var lines = data.split("\n");
                var itsInOrigins = false;
                var repo = undefined;
                lines.every(function(obj){
                    if(!itsInOrigins){
                        if(obj.indexOf(strRemote) != -1){
                            itsInOrigins = true;
                        }
                    } else if(obj.indexOf(strUrl) != -1){
                        repo = obj.substring(obj.indexOf(strUrl) + strUrl.length, obj.length -4);
                        return false;
                    }
                    return true;
                });

                if(repo){
                    callback("https://github.com/"+repo);
                    return false;
                } else {
                    return false;
                }
            });
        }
    }

    exports.getRawUrl = function(){
        return self.rawUrl;
    }

    exports.onRefresh = function(callback){
        if(self.projectManager.getProjectRoot())
            self._getProjectRepositoryFromFile(callback)();

        $(self.projectManager).on("projectOpen", self._getProjectRepositoryFromFile(callback));
        $(self.projectManager).on("projectRefresh", self._getProjectRepositoryFromFile(callback));
    }
})
