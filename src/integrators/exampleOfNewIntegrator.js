define(function (require, exports, module) {
    var FileUtils       = brackets.getModule("file/FileUtils"),
        FileSystem      = brackets.getModule("filesystem/FileSystem"),
        ProjectManager  = brackets.getModule("project/ProjectManager"),
        self            = this;

    self.apiUrl  = "https://gitlab.com/api/v3/";

    self._getUrlContext = function(url){
        return url.match(/^\s*https:\/\/github\.com\/([^\/\s]+\/[^\/\s]+)\s*$/)[1];
    }

    self.isValidUrl = function(url){
        return url.match(/^\s*https:\/\/github\.com\/[^\/\s]+\/[^\/\s]+\s*$/);
    };


    /**
        This method returns the default repositories for this type when you open
        the project.

        i.e: If you have a git proyect, this method can seek if you have a
        github repository in the ".git/config" file.

    */
    self.getProjectValidRepositories = function(response){
        var f = FileSystem.getFileForPath(pathToFileWithTheConfiguration);

        return FileUtils.readAsText(f).done(function(data,warehaus){
        }).fail(function(errName){
            response.push({
                type : self.name,
                error: errName
            });
        });
    }

    /** Get all the issues from a github project.
        @example
        github.getIssues({
            url         : "https://github.com/Nullpo/Alice",
            credentials : {accessToken: "13AD21FE31B2F04"},
            page        : 1
            done        : function(data){alert("Recieved data:" + done)},
            fail        : function(url, errCode){alert("Error code:" + errCode)}
        })
    */
    self.getIssues = function(params){
        return /* Jquery deferer / promise */;
    };

    /** Get the details for an issue from a github project.
        @example
        github.getIssue({
            number      : 3,
            url         : "https://github.com/Nullpo/Alice",
            credentials : {accessToken: "13AD21FE31B2F04"},
            done        : function(data){alert("Recieved data:" + done)},
            fail        : function(url, errCode){alert("Error code:" + errCode)}
        })

        returns a IssueList object
    */
    self.issueDetail = function(params) {
        return /* Jquery deferer / promise */;
    };

    exports.name                        = "MyNew Name";
    exports.isValidUrl                  = self.isValidUrl;
    exports.getProjectValidRepositories = self.getProjectValidRepositories;
    exports.getIssues                   = self.getIssues;
    exports.issueDetail                 = self.issueDetail;
    exports.filterBy                    = self.filterBy;
})
