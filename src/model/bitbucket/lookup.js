/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */
define(function (require, exports) {

    var FileUtils       = brackets.getModule("file/FileUtils"),
        FileSystem      = brackets.getModule("filesystem/FileSystem"),
        ProjectManager  = brackets.getModule("project/ProjectManager"),
        self            = this;

    exports.project = function(response){
        var path        = ProjectManager.getProjectRoot().fullPath + ".git/config",
            repoMatcher = /https:\/\/([\w\d_-]*)@bitbucket\.org\/([\w\d_-]*\/[\w\d_-]*)\.git/,
            remote      = /^\s*\[\s*remote\s*"([^"]+)"\s*\]\s*$/,
            theResponse = response,
            f           = FileSystem.getFileForPath(path),
            deferred    = $.Deferred(),
            reader      = FileUtils.readAsText(f);

        reader.done(function(data){
            var repos   = [],
                lines = data.split("\n"),
                lastRemote;

            lines.forEach(function(line){
                var actualRemote = line.match(remote),
                    parsedRepo   =  line.match(repoMatcher);

                if(actualRemote && actualRemote.length && actualRemote[1]){
                    lastRemote = actualRemote[1];
                } else if (lastRemote && parsedRepo && parsedRepo.length && parsedRepo[2]) {
                    repos.push({
                        name: lastRemote,
                        url : parsedRepo[2],
                        user: parsedRepo[1]
                    });
                    lastRemote = undefined;
                }
            });

            repos.forEach(function(elem){
                var resp = {
                    protocol:"Bitbucket",
                    name: elem.name,
                    domain: "bitbucket.com",
                    context: elem.url,
                    source: ".git",
                    user: elem.user
                };

                theResponse.push(resp);
            });

            deferred.resolve(response);
        }).fail(function(){
            // File doesn't exists
            deferred.resolve([]);
        });
        return deferred;
    };

});
