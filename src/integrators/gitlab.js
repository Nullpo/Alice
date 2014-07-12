define(function (require, exports, module) {

    var FileUtils       = brackets.getModule("file/FileUtils"),
        FileSystem      = brackets.getModule("filesystem/FileSystem"),
        ProjectManager  = brackets.getModule("project/ProjectManager"),
        Preferences     = require("src/preferences"),
        templateFile    = require("text!templates/integrators/gitlab.html"),
        self            = this;

    self.apiUrl     = "https://gitlab.com/api/v3/";
    self.htmlUrl    = "https://gitlab.com/"
    self.html       = $(templateFile).filter("#alice-config-github-body-tpl").html();
    self.allCredentials = Preferences.get("credentials");

    Mustache.parse(self.html);

    self._normalizeLabel = function(labelName) {
        var label = labelName.toLocaleLowerCase();
        var labelColors = {}

        labelColors["bug"] = labelColors["critical"] = labelColors["confirmed"] = "#d9534f";
        labelColors["documentation"] = labelColors["support"] = "#f0ad4e";
        labelColors["discussion"] = labelColors["suggestion"] = "#428bca";
        labelColors["feature"] = labelColors["enhancement"] = "#5cb85c";

        var myColor = labelColors[labelName] || "#5bc0de";

        return {
            name:labelName,
            color: "white",
            background : myColor
        }
    }
    self._normalizeIssueComments = function(project,issueNumber){
        return function(data){
            var creator = null;

            if (data.author) {
                creator = {};
                creator.title = data.author.username;
                creator.avatarUrl = data.author.avatar_url;
                creator.htmlUrl = self.htmlUrl + "u/" + data.author.username;
            }

            return {
                htmlUrl     : self.htmlUrl + project + "/issues/" + issueNumber + "#nore_" + data.iid,
                user        : data.user,
                createdDate : data.created_at,
                updatedDate : data.updated_at,
                body        : data.body,
                creator     : creator
            }
        }
    }

    self._normalizeIssue = function(projectUrl) {
        return function(data){
            var milestone   = null,
                creator     = null,
                assignee    = null;

            if(data.milestone){
                milestone = {};
                milestone.title = data.milestone.title;
                milestone.openIssues = data.milestone.open_issues;
                milestone.closedIssues = data.milestone.closed_issues;
            }

            if (data.author) {
                creator = {};
                creator.title       = data.author.username;
                creator.avatarUrl   = data.author.avatar_url;
                creator.status      = data.author.state;
                creator.htmlUrl     = self.htmlUrl + "u/" + data.author.username;
            }

            if(data.assignee) {
                assignee = {};
                assignee.title      = data.assignee.username;
                assignee.avatarUrl  = data.assignee.avatar_url;
                assignee.status     = data.assignee.state;
                assignee.htmlUrl    = self.htmlUrl + "u/" +data.assignee.username;
            }

            return {
                number      : data.iid,
                id          : data.id,
                apiId       : data.id,
                htmlUrl     : projectUrl + "/issues/" +data.iid,
                title       : data.title,
                labels      : data.labels.map(self._normalizeLabel),
                state       : data.state,
                createdDate : data.created_at,
                body        : data.description,
                milestone   : milestone,
                creator     : creator,
                assignee    : assignee
            };
        }
    }

    self._getUrlContext = function(url){
        return url.match(/^\s*https:\/\/gitlab\.com\/([^\/\s]+\/[^\/\s]+)\s*$/)[1];
    }

    self.isValidUrl = function(url){
        return url.match(/^\s*https:\/\/gitlab\.com\/[^\/\s]+\/[^\/\s]+\s*$/);
    };


    self.getProjectValidRepositories = function(response){
        var path        = ProjectManager.getProjectRoot().fullPath + ".git/config",
            repoMatcher = /(gitlab\.com:|https:\/\/gitlab\.com\/)([^\/]+\/[^\/]+)\.git$/,
            remote      = /^\s*\[\s*remote\s*"([^"]+)"\s*\]\s*$/,
            myUrl       = "https://gitlab.com/",
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
                    type:"Gitlab",
                    data: elem,
                    handler: self
                });
            })
        }).fail(function(jqXhr){
            response.push({
                type : "Gitlab",
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
            credentials = self.allCredentials.gitlabCloud,
            page        = params.page,
            repoContext = self._getUrlContext(url),
            repoApiUrl  = self.apiUrl + "projects/" + repoContext.replace("/","%2F"),
            requestUrl  = repoApiUrl + "/issues?state=all&per_page=100";

        if(credentials.accessToken){
            requestUrl += "&private_token=" + credentials.privateToken;
        } else {
            console.warn("Gitlab integrator: The user doesn't have any acces token!");
        }

        return $.getJSON(requestUrl).then(function(data){
            return data.map(self._normalizeIssue(self.htmlUrl + repoContext));
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
            credentials = self.allCredentials.gitlabCloud,
            done        = params.done,
            fail        = params.fail,
            repoContext = self._getUrlContext(url),
            repoApiUrl  = self.apiUrl + "projects/" + repoContext.replace("/","%2F"),
            requestUrl  = repoApiUrl + "/issues/"+number+"/notes?per_page=100";

        if(credentials.accessToken){
            requestUrl += "&private_token=" + credentials.privateToken;
        } else {
            console.warn("Gitlab integrator: The user doesn't have any acces token!");
        }

        return $.getJSON(requestUrl).then(function(data){
            return data.map(self._normalizeIssueComments(repoContext,number));
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
                    accessToken : self.allCredentials.gitlabCloud.privateToken,
                    url         : repository.data.url,
                    serverUrl   : self.htmlUrl
                };

            return {
                img   : "https://assets.digitalocean.com/blog/gitlab-logo.png",
                title : "Gitlab",
                body  : Mustache.render(self.html, data)
            };
        }
    };

    exports.name                        = "Gitlab";
    exports.isValidUrl                  = self.isValidUrl;
    exports.getProjectValidRepositories = self.getProjectValidRepositories;
    exports.getIssues                   = self.getIssues;
    exports.issueDetail                 = self.issueDetail;
    exports.filterBy                    = self.filterBy;
    exports.viewConfig                  = self.viewConfig
})
