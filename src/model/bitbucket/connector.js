/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $ */
define(function (require, exports) {

    var self            = this;
    var AliceUtils      = require("src/view/aliceUtils");

    self._getUrlContext = function(url){
        return url.match(/^\s*https:\/\/github\.com\/([^\/\s]+\/[^\/\s]+)\s*$/)[1];
    };

    self._normalizeIssueComments = function(data){
        var creator = null;

        if (data.author_info) {
            creator = {};
            creator.title = data.author_info.display_name + "( @" + data.author_info.username + " )";
            creator.avatarUrl = data.author_info.avatar;
            creator.htmlUrl = data.author_info.resource_uri;
        }

        return {
            htmlUrl     : "",
            createdDate : data.utc_created_on,
            updatedDate : data.utc_updated_on,
            body        : data.content,
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

        if (data.reported_by) {
            creator = {};
            creator.title = data.reported_by.display_name;
            creator.avatarUrl = data.reported_by.avatar;
            creator.htmlUrl = "";
        }

        if(data.responsible) {
            assignee = {};
            assignee.title = data.responsible.display_name;
            assignee.avatarUrl = data.responsible.avatar;
            assignee.htmlUrl = "";
        }

        var label = [];
        if(data.metadata.kind){
            label.push ({
                name:data.metadata.kind,
                color: "black",
                background : "#BBF"
            });
        }
        if(data.metadata.component){
            label.push ({
                name:data.metadata.component,
                color: "black",
                background : "#BFB"
            });
        }
        if(data.metadata.version){
            label.push ({
                name:data.metadata.version,
                color: "black",
                background : "#FBB"
            });
        }

        if (data.priority){
            label.push ({
                name: "<img src='" + AliceUtils.images.priorities[data.priority] + "' style='width:12px'>",
                color: "black",
                background : "#BBB"
            });
        }

        return {
            original    : data,
            body        : data.content,
            number      : data.local_id,
            id          : data.local_id,
            apiId       : data.local_id,
            htmlUrl     : data.html_url,
            title       : data.title,
            labels      : label,
            state       : data.status,
            createdDate : data.utc_created_on,
            milestone   : data.metadata.milestone,
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
        var repoApiUrl  = location.api + issueTracker.context,
            requestUrl  = repoApiUrl + "/issues";

        return $.ajax
              ({
                type: "GET",
                url: requestUrl,
                dataType: 'json',
                async: false,
                beforeSend: function (xhr){
                    xhr.setRequestHeader('Authorization', "Basic " + location.credential);
                }
            }).then(function(response){
                return response.issues.map(self._normalizeIssue);
            });
    };

    /** Get the details for an issue from a github project.
    */
    self.issueDetail = function(issueTracker, location, number) {
        var repoApiUrl  = location.api + issueTracker.context,
            requestUrl  = repoApiUrl + "/issues/"+number+ "/comments";

       return $.ajax
              ({
                type: "GET",
                url: requestUrl,
                dataType: 'json',
                async: false,
                beforeSend: function (xhr){
                    xhr.setRequestHeader('Authorization', "Basic " + location.credential);
                }
            }).then(function(response){
                return response.map(self._normalizeIssueComments);
            });
    };

    exports.name                        = "Github";
    exports.getIssues                   = self.getIssues;
    exports.issueDetail                 = self.issueDetail;
});
