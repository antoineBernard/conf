"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gravatar = require("gravatar-api");
exports.VSLS_CHAT_CHANNEL = {
    id: "vsls-channel-id",
    name: "Live Share Chat"
};
exports.toBaseMessage = (raw) => {
    return Object.assign({}, raw, { content: undefined, reactions: [], replies: {} });
};
exports.toBaseUser = (peerNumber, user) => {
    const { displayName, emailAddress } = user;
    const avatar = gravatar.imageUrl({
        email: emailAddress,
        parameters: { size: "200", d: "retro" },
        secure: true
    });
    return {
        id: peerNumber.toString(),
        name: displayName,
        email: !!emailAddress ? emailAddress : undefined,
        fullName: displayName,
        imageUrl: avatar,
        smallImageUrl: avatar,
        presence: "available" /* available */
    };
};
exports.REQUEST_NAME = {
    message: "message",
    fetchUsers: "fetch_users",
    fetchUserInfo: "fetch_user_info",
    fetchMessages: "fetch_messages",
    registerGuest: "register_guest"
};
exports.NOTIFICATION_NAME = {
    message: "message"
};
//# sourceMappingURL=utils.js.map