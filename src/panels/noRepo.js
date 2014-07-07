define(function (require, exports, module) {

     var Panel = function(model){
        var self = this;
        self.contentManager = undefined;
        self.model = model;
        self.show = function(props){
            var $panelContainer = $("#bottom-alice-issues > .alice-bottom-content"),
                status          = props.status,
                url             = props.url,
                fileError       = props.fileError;

            var resp = "<h3> Error: ";
             //+ status + "</h3>"
            if(fileError=="NotGithub"){
                resp += "[origin] is not in Github</h3><p>This project doesn't have in [origin] a github repository. Anyway, you can explore the issues for any other Github Repository</p>";
            } else if(fileError=="NotFound"){
                resp += "Not a git project</h3><p>This project isn't a git project. Anyway, you can explore the issues for any other Github Repository</p>";
            } else if(status == 401){
                resp += status + " - Bad credentials</h3><p>Please, check if the configured Public access token its valid and try again.</p>";
            } else if(status == 403){
                resp += status + " - Forbidden</h3><p>Please, check if the configured Public access token its valid and try again.</p>";
            } else if(status == 404) {
                resp += status + " - Not found</h3><p><a href='" + url + "'>Repository</a> not found. Check the repository url and try again</p><p>If its a private repository, please configure your access token and try again.";
            } else if(status == 410) {
                resp += status + " - Gone</h3><p>Probably the configured <a href='" + model.rawUrl + "'>repository</a> don't have the Issues feature configured in Github. Please, <a href='" + model.rawUrl + "/settings'>configure it</a> and try again."
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
