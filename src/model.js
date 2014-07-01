/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

define(function (require, exports, module) {
    var self = this;
    self.data = {
        issues: {},
        time: {}
    };

    exports.setGithubRepository = function(repo,callback){
        var regex = /github.com\/(.*)/g,
            githubUrl = regex.exec(repo),
            githubContext,
            url;

        if(!githubUrl || !githubUrl[1]){
            return false
        }

        githubContext = githubUrl[1];
        baseUrl = "https://api.github.com/repos/" + githubContext;
        url = baseUrl + "/issues?state=all";
        $.getJSON(url,function(data){
            self.data.issues = data;
            self.data.time = new Date();
            callback(self.data.issues);
        });

        return baseUrl;
    }

    exports.data = this.data
})
