"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vsls = require("vsls");
const utils_1 = require("./utils");
const base_1 = require("./base");
const strings_1 = require("../strings");
class VslsHostService extends base_1.VslsBaseService {
    constructor(sharedService, peerNumber) {
        super();
        this.sharedService = sharedService;
        this.peerNumber = peerNumber;
        this.messages = {};
        this.cachedPeers = [];
        sharedService.onRequest(utils_1.REQUEST_NAME.message, payload => {
            if (!!payload) {
                const message = payload[0];
                const { userId, text } = message;
                return this.broadcastMessage(userId, text);
            }
        });
        sharedService.onRequest(utils_1.REQUEST_NAME.fetchUsers, () => {
            return this.fetchUsers();
        });
        sharedService.onRequest(utils_1.REQUEST_NAME.fetchUserInfo, payload => {
            if (!!payload) {
                const userId = payload[0];
                return this.fetchUserInfo(userId);
            }
        });
        sharedService.onRequest(utils_1.REQUEST_NAME.fetchMessages, () => {
            return this.fetchMessagesHistory();
        });
        sharedService.onRequest(utils_1.REQUEST_NAME.registerGuest, payload => {
            if (!!payload) {
                const { peer } = payload[0];
                return this.updateCachedPeers([peer], []);
            }
        });
    }
    isConnected() {
        return !!this.sharedService ? this.sharedService.isServiceAvailable : false;
    }
    sendStartedMessage() {
        return this.broadcastMessage(this.peerNumber.toString(), strings_1.LIVE_SHARE_INFO_MESSAGES.started);
    }
    sendEndedMessage() {
        return this.broadcastMessage(this.peerNumber.toString(), strings_1.LIVE_SHARE_INFO_MESSAGES.ended);
    }
    sendJoinedMessages(peers) {
        peers.forEach(({ peerNumber }) => {
            this.broadcastMessage(peerNumber.toString(), strings_1.LIVE_SHARE_INFO_MESSAGES.joined);
        });
    }
    sendLeavingMessages(peers) {
        peers.forEach(({ peerNumber }) => {
            this.broadcastMessage(peerNumber.toString(), strings_1.LIVE_SHARE_INFO_MESSAGES.left);
        });
    }
    async fetchUsers() {
        const users = {};
        const liveshare = await vsls.getApi();
        const { peerNumber: userId, user } = liveshare.session;
        if (!!user) {
            const currentUser = utils_1.toBaseUser(userId, user);
            users[currentUser.id] = currentUser;
        }
        liveshare.peers.map(peer => {
            const { peerNumber: peerId, user: peerUser } = peer;
            if (!!peerUser) {
                const user = utils_1.toBaseUser(peerId, peerUser);
                users[user.id] = user;
            }
        });
        return users;
    }
    async fetchUserInfo(userId) {
        // userId could be current user or one of the peers
        const liveshare = await vsls.getApi();
        const { peerNumber, user } = liveshare.session;
        if (peerNumber.toString() === userId && !!user) {
            return Promise.resolve(utils_1.toBaseUser(peerNumber, user));
        }
        const peer = liveshare.peers.find(peer => peer.peerNumber.toString() === userId);
        if (!!peer) {
            const { peerNumber: peerId, user: peerUser } = peer;
            if (!!peerUser) {
                return Promise.resolve(utils_1.toBaseUser(peerId, peerUser));
            }
        }
        // Finally, let's check cached peers
        // In some cases, vsls seems to be returning stale data, and
        // so we cache whatever we know locally.
        const cachedPeer = this.cachedPeers.find(peer => peer.peerNumber.toString() === userId);
        if (!!cachedPeer) {
            const { peerNumber: peerId, user: peerUser } = cachedPeer;
            if (!!peerUser) {
                return Promise.resolve(utils_1.toBaseUser(peerId, peerUser));
            }
        }
    }
    fetchMessagesHistory() {
        const result = {};
        Object.keys(this.messages).forEach(key => {
            result[key] = utils_1.toBaseMessage(this.messages[key]);
        });
        return Promise.resolve(result);
    }
    broadcastMessage(userId, text) {
        const timestamp = (+new Date() / 1000.0).toString();
        const message = {
            userId,
            text,
            timestamp
        };
        this.sharedService.notify(utils_1.NOTIFICATION_NAME.message, message);
        this.updateMessages(message);
        this.messages[timestamp] = message;
    }
    sendMessage(text, userId, channelId) {
        this.broadcastMessage(userId, text);
        return Promise.resolve();
    }
    updateCachedPeers(addedPeers, removedPeers) {
        const updated = [...this.cachedPeers, ...addedPeers, ...removedPeers];
        const uniquePeers = updated.filter((peer, index, self) => index === self.findIndex(t => t.peerNumber === peer.peerNumber));
        this.cachedPeers = uniquePeers;
    }
}
exports.VslsHostService = VslsHostService;
//# sourceMappingURL=host.js.map