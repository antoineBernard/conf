"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("../constants");
const utils_1 = require("../vslsChat/utils");
const CHAT_OCTICON = "$(comment-discussion)";
class BaseStatusItem {
    constructor(baseCommand, commandArgs, commandModifier) {
        this.unreadCount = 0;
        this.isVisible = false;
        this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        // We construct a new command to send args with base command
        // From: https://github.com/Microsoft/vscode/issues/22353#issuecomment-325293438
        const compound = `${baseCommand}.${commandModifier}.status`;
        this.disposableCommand = vscode.commands.registerCommand(compound, () => {
            return vscode.commands.executeCommand(baseCommand, commandArgs);
        });
        this.item.command = compound;
    }
    show() {
        if (!this.isVisible) {
            this.item.show();
            this.isVisible = true;
        }
    }
    hide() {
        if (this.isVisible) {
            this.item.hide();
            this.isVisible = false;
        }
    }
    dispose() {
        this.item.dispose();
        this.disposableCommand.dispose();
    }
}
exports.BaseStatusItem = BaseStatusItem;
class UnreadsStatusItem extends BaseStatusItem {
    constructor(providerName, team, isVslsChat) {
        // Status bar item for vsls chat does not have any channels,
        // hence we will not trigger the the change_channel command
        const baseCommand = isVslsChat
            ? constants_1.SelfCommands.OPEN_WEBVIEW
            : constants_1.SelfCommands.CHANGE_CHANNEL;
        let chatArgs = {
            providerName,
            source: "status_item" /* status */
        };
        if (isVslsChat) {
            chatArgs = Object.assign({}, chatArgs, { channelId: utils_1.VSLS_CHAT_CHANNEL.id });
        }
        const modifier = `${providerName}.${team.id}`; // This ensures discord teams have separate items
        super(baseCommand, chatArgs, modifier);
        this.providerName = providerName;
        this.teamName = team.name;
    }
    updateCount(unreads) {
        this.unreadCount = unreads;
        this.item.text = `${CHAT_OCTICON} ${this.teamName}: ${unreads} new`;
        return this.unreadCount > 0 ? this.show() : this.hide();
    }
}
exports.UnreadsStatusItem = UnreadsStatusItem;
//# sourceMappingURL=index.js.map