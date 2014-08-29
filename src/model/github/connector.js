/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $ */
define(function (require, exports, module) {

    var self            = this;
    var AliceUtils      = require("src/view/aliceUtils");
    self._getUrlContext = function(url){
        return url.match(/^\s*https:\/\/github\.com\/([^\/\s]+\/[^\/\s]+)\s*$/)[1];
    };

    self._normalizeLabel = function(label) {
        return {
            name:label.name,
            color: AliceUtils.colors.isTooLightYIQ(label.color)?"#333":"white",
            background : "#" + label.color
        };
    };

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
            createdDate : data.created_at,
            updatedDate : data.updated_at,
            body        : data.body,
            creator     : creator
        };
    };

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
            original    : data,
            body        : data.body,
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
    };

    /** Get all the issues from a github project.
        @example
        github.getIssues({
            url         : "https://github.com/Nullpo/Alice",
            page        : 1
            done        : function(data){alert("Recieved data:" + done)},
            fail        : function(url, errCode){alert("Error code:" + errCode)}
        })
    */
    self.getIssues = function(issueTracker, location){
        var page        = 0,
            repoApiUrl  = location.api + issueTracker.context,
            requestUrl  = repoApiUrl + "/issues?state=all&per_page=100";

        if(location.credential){
            requestUrl += "&access_token=" + location.credential;
        } else {
            console.warn("[Github connector] The user doesn't have any acces token!");
        }

        return $.getJSON(requestUrl).then(function(response){
            return response.map(self._normalizeIssue);
        });
    };

    /** Get the details for an issue from a github project.
    */
    self.issueDetail = function(issueTracker, server, number) {
        var repoApiUrl  = server.api + issueTracker.context,
            requestUrl  = repoApiUrl + "/issues/"+number+"/comments?per_page=100";

        if(server.credential){
            requestUrl += "&access_token=" + server.credential;
        } else {
            console.warn("[Github connector] The user doesn't have any acces token!");
        }

        return $.getJSON(requestUrl).then(function(response){
            return response.map(self._normalizeIssueComments);
        });
    };
    /**
        number: number,
        text: text,
        server: server,
        issueTracker: it
    */
    self.addComment = function(args){
         var repoApiUrl  = args.server.api + args.issueTracker.context,
            requestUrl  = repoApiUrl + "/issues/"+args.number+"/comments";
            args.text.replace(/\"/g,"\\\"");
            if(args.server.credential){
                requestUrl += "?access_token=" + args.server.credential;
            } else {
                console.warn("[Github connector] The user doesn't have any acces token!");
            }

        var tengoladata = {
            body: args.text
        };
         return $.ajax
              ({
                type: "POST",
                url: requestUrl,
                data: JSON.stringify(tengoladata),
                dataType: 'json',
                async: true,
            }).done(function(response){
                console.log("Comment created sucessfully");
                console.log(response);
            });
    };

    exports.name                        = "Github";
    exports.getIssues                   = self.getIssues;
    exports.issueDetail                 = self.issueDetail;
});
