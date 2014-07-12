define(function (require, exports, module) {

    this.User = function(user) {
        this.id = user.id;
        this.name = user.name;
        this.url = user.url;
    }

    this.Label = function(label) {
        this.id         = label.id;
        this.iid        = label.iid;
        this.text       = label.text;
        this.background = label.background;
        this.color      = label.color;
    }

    this.Milestone = function(milestone) {
        this.id         = label.id;
        this.iid        = label.iid;
        this.text       = label.title;
        this.openIssues = label.openIssues;
    }

    this.Issue = function(issue){
        this.id = issue.id;
        this.iid = label.iid;
        this.creator = issue.creator;
        this.asignee = issue.asignee;
        this.name = issue.name;
        this.description = issue.description;
        this.status = issue.status;
        this.labels = issue.labels;
        this.milestone = issue.milestone;
    }

    exports.toIssueList = function(arr) {
        return arr.map(this.toIssue);
    }

    exports.toIssue = function(issue){
        return new this.Issue(issue);
    }

    exports.toUser = function(user){
        return new this.User(user);
    }

    exports.toLabel = function(label) {
        return new Label(label);
    }

});
