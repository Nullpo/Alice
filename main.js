/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

define(function (require, exports, module) {
    "use strict";

    var Menus          = brackets.getModule("command/Menus"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        PanelManager   = brackets.getModule("view/PanelManager"),
        CommandManager = brackets.getModule("command/CommandManager");

    // Local modules
    var AliceUtils  = require("src/utils"),
        i18n = require("src/i18n").i18n,
        PanelContentManager = require("src/panels/panelContentManager"),
        InitPanel = require("src/panels/init"),
        Model = require("src/model"),
        DetailIssuePanel = require("src/panels/issue"),
        Toolbar = require("src/toolbar");

    ExtensionUtils.loadStyleSheet(module,"main.css");

    // Constants

    var panel,
        visible = false,
        realVisibility=false,
        filters = AliceUtils.filters,
        self = this;

    var ids = {
        MNU_TRACKING      : "nullpo.alice",
        CMD_SHOW_PANEL    : "nullpo.alice.showPanel"
    }


    self.icon = Toolbar.ToolbarIcon.createIcon({
        defaultCssClass:"alice-icon",
        title: i18n.BTN_TOGGLE,
        id: "alice-toolbar-button"
    });

    self.icon.addState("open","alice-toolbar-open");
    self.icon.addState("busy","alice-toolbar-loading");
    self.icon.putInToolbar();
    self.state = "default";
    self.isBusy = false;

    Model.onStartRequest(function(){
        self.isBusy = true;
        self.icon.changeState("busy");
        return true;
    });

    Model.onSuccessRequest(function(){
        self.isBusy = false;
        self.icon.changeState(self.state);
        return true;
    });

    var initPanel = InitPanel.create(Model);
    var detailIssuePanel = DetailIssuePanel.create(Model);

    var contentManager = new PanelContentManager.create({
        name: "alice-panel",
        minWidth : 200
    });




    contentManager.addPanel("init",initPanel);
    contentManager.addPanel("detailIssue",detailIssuePanel);

    CommandManager.register(i18n.MNU_GITHUB, ids.CMD_SHOW_PANEL, contentManager.toggle);

    contentManager.onToggle(function(isVisible){

        if(isVisible){
            self.state = "open";
        } else {
            self.state = "default";
        }

        if(!self.isBusy){
            self.icon.changeState(self.state);
        }
    });

    self.icon.on("click", contentManager.toggle);

});
