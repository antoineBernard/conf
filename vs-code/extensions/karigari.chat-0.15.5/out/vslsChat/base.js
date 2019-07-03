"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("../constants");
const utils_1 = require("./utils");
class VslsBaseService {
    updateMessages(message) {
        const { timestamp } = message;
        let newMessages = {};
        newMessages[timestamp] = utils_1.toBaseMessage(message);
        vscode.commands.executeCommand(constants_1.SelfCommands.UPDATE_MESSAGES, {
            channelId: utils_1.VSLS_CHAT_CHANNEL.id,
            messages: newMessages,
            provider: "vsls"
        });
    }
}
exports.VslsBaseService = VslsBaseService;
//# sourceMappingURL=base.js.map