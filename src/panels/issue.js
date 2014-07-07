define(function (require, exports, module) {

    var PanelView = require("src/panelView"),
        i18n = require("src/i18n").i18n,
        filters = require("src/utils").filters,
        panelHTML = require("text!templates/panels/issuePanel.html"),
        clazz = this,
        panelButtons = {
        BTN_SHOW_BUGS   : "nullpo-alice-btn-bugs",
        BTN_SHOW_OPENED : "nullpo-alice-btn-open",
        BTN_SHOW_CLOSED : "nullpo-alice-btn-closed",
        BTN_SHOW_ALL    : "nullpo-alice-btn-all"
    }

    var IssuePanel = function(model){
        var self = this;
        self.html = panelHTML;
        self.$panelHTML = $(panelHTML);

        self.contentManager = undefined;
        self.model = model;

        self._showDetail = function(title,number){
            var issue = self.model.data.issues.filter(filters.issues.byNumber(number))[0],
                detailHTML = self.$panelHTML.filter("#bottom-alice-issuedetail-tpl").html();

            Mustache.parse(detailHTML);
            self.contentManager.changeTo("loading");
            self.model.issueDetail(number,function(data){
                var obj = {issue:issue, comments:data, number: number};
                $("#bottom-alice-issues > .alice-bottom-content"
                    ).html(Mustache.render(detailHTML,obj));
            });
        };

        self.show = function(number){
            self._showDetail(i18n.BTN_ISSUE_DETAIL,number)
        }

        self.beforeHide = function(){
            return true;
        }

        return self;
    };

    exports.create = function(props){
        return new IssuePanel(props);
    }
});
