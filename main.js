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
        DetailIssuePanel = require("src/panels/issue");

    ExtensionUtils.loadStyleSheet(module,"main.css");

    // Constants

    var panel,
        visible = false,
        baseUrl = "http://github.com/nullpo/Alice",
        realVisibility=false,
        filters = AliceUtils.filters;

    var ids = {
        MNU_TRACKING      : "nullpo.alice",
        CMD_SHOW_PANEL    : "nullpo.alice.showPanel"
    }

    var initPanel = InitPanel.create(Model);
    var detailIssuePanel = DetailIssuePanel.create(Model);

    var contentManager = new PanelContentManager.create({
        name: "alice-panel",
        minWidth : 200
    });

    contentManager.addPanel("init",initPanel);
    contentManager.addPanel("detailIssue",detailIssuePanel);

    CommandManager.register(i18n.MNU_GITHUB, ids.CMD_SHOW_PANEL, contentManager.toggle);

    var $icon = $("<a id='alice-toolbar-button' href='#'>T</a>")
        .attr("title", i18n.BTN_TOGGLE)
        .appendTo($("#main-toolbar .buttons"));

    $icon.on("click", contentManager.toggle);

});
