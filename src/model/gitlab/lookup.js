/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */
define(function (require, exports) {

    var FileUtils       = brackets.getModule("file/FileUtils"),
        FileSystem      = brackets.getModule("filesystem/FileSystem"),
        ProjectManager  = brackets.getModule("project/ProjectManager"),
        self            = this;

    exports.project = function(response){
        var deferred = $.Deferred();
        var promise = $.when(self.getFromGit(),self.getFromConfiguration());

        promise.then(function(a,b){

            if(a !== undefined){
                response = response.concat(a);
            }

            if(b !== undefined){
                response = response.concat(b);
            }

            deferred.resolve(response);

            return ["saraza"];
        });

        return deferred;
    };

    self.getFromConfiguration = function(){

        var deferred    = $.Deferred();
        //        Preferences.instance.get
        deferred.resolve();
        return deferred;
    };

    self.getFromGit = function(){
        var path        = ProjectManager.getProjectRoot().fullPath + ".git/config",
            repoMatcher = /(gitlab\.com:|https:\/\/gitlab\.com\/)([^\/]+\/[^\/]+)\.git$/,
            remote      = /^\s*\[\s*remote\s*"([^"]+)"\s*\]\s*$/,
            f           = FileSystem.getFileForPath(path),
            response    = [],
            deferred    = $.Deferred(),
            lastRemote;


        FileUtils.readAsText(f).done(function(data){
            var repos   = [];

            data.split("\n").forEach(function(line){
                var actualRemote = line.match(remote),
                    parsedRepo   =  line.match(repoMatcher);

                if(actualRemote &&
                   actualRemote.length &&
                   actualRemote[1]){
                    lastRemote = actualRemote[1];
                } else if (lastRemote &&
                           parsedRepo &&
                           parsedRepo.length &&
                           parsedRepo[2]) {
                    repos.push({
                        name: lastRemote,
                        url : parsedRepo[2]
                    });
                    lastRemote = undefined;
                }
            });
            repos.forEach(function(elem){
                var resp = {
                    protocol:"Gitlab",
                    name: elem.name,
                    domain: "gitlab.com",
                    context: elem.url,
                    source: ".git"
                };
                response.push(resp);
            });
            deferred.resolve(response);
        }).fail(function(){
            deferred.resolve([]);
            // Probably the file doesn't exists
            /*response.push({
                protocol : "GitlabCloud",
                handler: self,
                error: jqXhr
            });
            deferred.reject(response);*/
        });
        return deferred;
    };
});
