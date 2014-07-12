define(function (require, exports, module) {

    var FileUtils       = brackets.getModule("file/FileUtils"),
        FileSystem      = brackets.getModule("filesystem/FileSystem"),
        ProjectManager  = brackets.getModule("project/ProjectManager"),
        Preferences     = require("src/preferences"),
        AliceUtils      = require("src/utils"),
        templateFile    = require("text!templates/integrators/github.html"),
        self            = this;

    self.apiUrl     = "https://api.github.com/repos/";
    self.html       = $(templateFile).filter("#alice-config-github-body-tpl").html();
    Mustache.parse(self.html);

    self.allCredentials = Preferences.get("credentials");

    self._getUrlContext = function(url){
        return url.match(/^\s*https:\/\/github\.com\/([^\/\s]+\/[^\/\s]+)\s*$/)[1];
    }

    self._normalizeLabel = function(label) {
        return {
            name:label.name,
            color: AliceUtils.colors.isTooLightYIQ(label.color)?"#333":"white",
            background : "#" + label.color
        }
    }

    self._normalizeIssueComments = function(data){
        var creator = null;

        if (data.user) {
            creator = {};
            creator.title = data.user.login;
            creator.avatarUrl = data.user.avatar_url;
            creator.htmlUrl = data.user.htmlUrl;
        }

        return {
            htmlUrl     : data.html_url,
            user        : data.user,
            createdDate : data.created_at,
            updatedDate : data.updated_at,
            body        : data.body,
            creator     : creator
        }
    }

    self._normalizeIssue = function(data){
        var milestone   = null,
            creator     = null,
            assignee    = null;

        if(data.milestone){
            milestone = {};
            milestone.title = data.milestone.title;
            milestone.openIssues = data.milestone.open_issues;
            milestone.closedIssues = data.milestone.closed_issues;
        }

        if (data.user) {
            creator = {};
            creator.title = data.user.login;
            creator.avatarUrl = data.user.avatar_url;
            creator.htmlUrl = data.user.htmlUrl;
        }

        if(data.assignee) {
            assignee = {};
            assignee.title = data.assignee.login;
            assignee.avatarUrl = data.assignee.avatar_url;
            assignee.htmlUrl = data.assignee.htmlUrl;
        }

        return {
            number      : data.number,
            id          : data.id,
            apiId       : data.number,
            htmlUrl     : data.html_url,
            title       : data.title,
            labels      : data.labels.map(self._normalizeLabel),
            state       : data.state,
            createdDate : data.created_at,
            milestone   : milestone,
            creator     : creator,
            assignee    : assignee
        };
    }

    self.isValidUrl = function(url){
        return url.match(/^\s*https:\/\/github\.com\/[^\/\s]+\/[^\/\s]+\s*$/);
    };

    //https://api.github.com/repos/Nullpo/FerNet/issues?state=open
    //https://gitlab.com/api/v3/projects/Nullpo%2FAlice/issues?&private_token=Wg7WHAxhzg3QYtsc8mws
    self.getProjectValidRepositories = function(response){
        var path        = ProjectManager.getProjectRoot().fullPath + ".git/config",
            repoMatcher = /(github\.com:|https:\/\/github\.com\/)([^\/]+\/[^\/]+)\.git$/,
            remote      = /^\s*\[\s*remote\s*"([^"]+)"\s*\]\s*$/,
            myUrl       = "https://github.com/",
            lastRemote  = undefined,
            f           = FileSystem.getFileForPath(path);

        return FileUtils.readAsText(f).done(function(data,warehaus){
            var repos   = [];

            data.split("\n").forEach(function(line){
                var actualRemote = line.match(remote),
                    parsedRepo   =  line.match(repoMatcher);

                if(actualRemote
                   && actualRemote.length
                   && actualRemote[1]){
                    lastRemote = actualRemote[1];
                } else if (lastRemote
                           && parsedRepo
                           && parsedRepo.length
                           && parsedRepo[2]) {
                    repos.push({
                        name: lastRemote,
                        url : myUrl + parsedRepo[2]
                    });
                    lastRemote = undefined;
                }
            });
            repos.forEach(function(elem){
                response.push({
                    type:"Github",
                    data: elem,
                    handler: self
                });
            })
        }).fail(function(jqXhr){
            response.push({
                type : "Github",
                handler: self,
                error: jqXhr
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
        var url         = params.url,
            credentials = self.allCredentials.githubCloud,
            page        = params.page,
            repoContext = self._getUrlContext(url),
            repoApiUrl  = self.apiUrl + repoContext,
            requestUrl  = repoApiUrl + "/issues?state=all&per_page=100";

        if(credentials.accessToken){
            requestUrl += "&access_token=" + credentials.accessToken;
        } else {
            console.warn("Github integrator: The user doesn't have any acces token!");
        }

        return $.getJSON(requestUrl).then(function(response){
            return response.map(self._normalizeIssue)
        });
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
    */
    self.issueDetail = function(params) {
        var number      = params.number,
            url         = params.url,
            credentials = self.allCredentials.githubCloud,
            done        = params.done,
            fail        = params.fail,
            repoContext = self._getUrlContext(url),
            repoApiUrl  = self.apiUrl + repoContext,
            requestUrl  = repoApiUrl + "/issues/"+number+"/comments?per_page=100";

        if(credentials.accessToken){
            requestUrl += "&access_token=" + credentials.accessToken;
        } else {
            console.warn("Github integrator: The user doesn't have any acces token!");
        }

        return $.getJSON(requestUrl).then(function(data){
            return data.map(self._normalizeIssueComments);
        });
    };

    self.viewConfig = {
        validate    : function(){
        },
        setEvents : function(){
        },
        data: function(repository) {
            var data = {
                    remote      : "[" + repository.data.name + "]",
                    accessToken : self.allCredentials.githubCloud.accessToken,
                    url         : repository.data.url
                };

            return {
                img : "http://180016988.r.cdn77.net/wp-content/uploads/2014/03/Redmine.png",
                title : "Github",
                body  : Mustache.render(self.html, data)
            };
        }
    };

    exports.name                        = "Github";
    exports.isValidUrl                  = self.isValidUrl;
    exports.getProjectValidRepositories = self.getProjectValidRepositories;
    exports.getIssues                   = self.getIssues;
    exports.issueDetail                 = self.issueDetail;
    exports.filterBy                    = self.filterBy;
    exports.viewConfig                  = self.viewConfig
})
