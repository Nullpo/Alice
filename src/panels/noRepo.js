define(function (require, exports, module) {

     var Panel = function(model){
        var self = this;
        self.contentManager = undefined;
        self.show = function(props){
            var $panelContainer = $("#bottom-alice-issues > .alice-bottom-content"),
                status          = props.status,
                url             = props.url,
                fileError           = props.fileError;

            var resp = "<h3> Error: ";
             //+ status + "</h3>"
            if(fileError=="NotGithub"){
                resp += "[origin] is not in Github</h3><p>This project doesn't have in [origin] a github repository. Anyway, you can explore the issues for any other Github Repository</p>";
            } else if(fileError=="NotFound"){
                resp += "Not a git project</h3><p>Tis project isn't a git project. Anyway, you can explore the issues for any other Github Repository</p>";
            } if(status == 403){
                resp += status + "</h3><p>Add a github</p>";
            } else if(status == 404) {
                resp += status + "</h3><p><a href='" + url + "'>Repository</a> not found. Check the repository url and try again</p><p>If its a private repository, please configure your access token and try again.";
            }

            $panelContainer.html("<div class='row'><div class='span11 offset1'>"
                                 + resp + "</div></div>");

            $(".alice-background-logo").removeClass("busy more-transparent");
            $(".alice-background-logo").addClass("error");
        }

        self.beforeHide = function(){
            return true;
        }

        return self;
    }
    exports.create = function(props){
        return new Panel(props);
    }
});
