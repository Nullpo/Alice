/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $ */
define(function (require, exports) {
    var AliceUtils = require("src/view/aliceUtils");
    var self       = this;

    self._normalizeLabel = function(labelName) {
        var labelColors = {};

        labelColors.bug = labelColors.critical = labelColors.confirmed = "#d9534f";
        labelColors.documentation = labelColors.support = "#f0ad4e";
        labelColors.discussion = labelColors.suggestion = "#428bca";
        labelColors.feature = labelColors.enhancement = "#5cb85c";

        var myColor = labelColors[labelName] || "#5bc0de";

        return {
            name:labelName,
            color: AliceUtils.colors.isTooLightYIQ(myColor)?"#333":"white",
            background : myColor
        };
    };

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
            };
        };
    };

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
        };
    };

    /** Get all the issues from a github project.
        @return promise
        @example
        github.getIssues({
            url         : "https://github.com/Nullpo/Alice",
            page        : 1
        })
    */
    self.getIssues = function(issueTracker, location){
        console.log("Getting issues");
        var page        = 0,
            repoApiUrl  = location.api + issueTracker.context.replace("/","%2F"),
            requestUrl  = repoApiUrl + "/issues?state=all&per_page=100";

        if(location.credential){
            requestUrl += "&private_token=" + location.credential;
        } else {
            console.warn("[Gitlab connector] The user doesn't have any acces token!");
        }
        console.debug("[Gitlab connector] Sent request to " + requestUrl);
        return $.getJSON(requestUrl).then(function(response){
            return response.map(self._normalizeIssue(issueTracker.context));
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
    self.issueDetail = function(issueTracker, location, number) {
        var repoApiUrl  = location.api + issueTracker.context.replace("/","%2F"),
            requestUrl  = repoApiUrl + "/issues/"+number+"/notes?per_page=100";

        if(location.credential){
            requestUrl += "&private_token=" + location.credential;
        } else {
            console.warn("[Gitlab connector] The user doesn't have any acces token!");
        }

        return $.getJSON(requestUrl).then(function(data){
            return data.sort(function(a,b){
                if(a.id < b.id)
                    return -1;
                if(a.id > b.id)
                    return 1;
                return 0;
            }).map(self._normalizeIssueComments(issueTracker.context,number));
        });
    };

    /**
        number: number,
        text: text,
        server: server,
        issueTracker: it
    */
    self.addComment = function(args){
         var repoApiUrl  = args.server.api + args.issueTracker.context.replace("/","%2F"),
            requestUrl  = repoApiUrl + "/issues/"+args.number+"/notes";

            if(args.server.credential){
                requestUrl += "?private_token=" + args.server.credential;
            } else {
                console.warn("[Gitlab connector] The user doesn't have any acces token!");
            }

        var tengoladata = {
            body: args.text
        };
         return $.ajax
              ({
                type: "POST",
                url: requestUrl,
                data: {body:args.text},
                async: true,
            }).done(function(response){
                console.log("Comment created sucessfully");
                console.log(response);
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

    exports.name                        = "Gitlab(Remote)";
    exports.getIssues                   = self.getIssues;
    exports.issueDetail                 = self.issueDetail;
});
