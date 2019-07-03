"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EmojiConvertor = require("emoji-js");
const str = require("../strings");
const MarkdownIt = require("markdown-it");
const markdownItSlack = require("markdown-it-slack");
exports.parseUsernames = (uiMessage) => {
    // Find and replace names like <@UBCQ8LF28>
    const { messages, users } = uiMessage;
    let newMessages = {};
    Object.keys(messages).map(ts => {
        const message = messages[ts];
        let { text } = message;
        const matched = text.match(/<@([A-Z0-9]+)>/);
        if (matched && matched.length > 0) {
            const userId = matched[1];
            if (userId in users) {
                const { name } = users[userId];
                text = text.replace(matched[0], `@${name}`);
            }
        }
        newMessages[ts] = Object.assign({}, message, { text });
    });
    return Object.assign({}, uiMessage, { messages: newMessages });
};
exports.emojify = (messages) => {
    // Even though we are using markdown-it-slack, it does not support
    // emoji skin tones. If that changes, we can remove this method.
    const emoji = new EmojiConvertor();
    emoji.allow_native = true;
    // We have added node_modules/emoji-datasource to vscodeignore since we use
    // allow_native. If this changes, we might have to emoji sheeets (through CDN?)
    emoji.replace_mode = "unified";
    let emojifiedMessages = {};
    Object.keys(messages).forEach(key => {
        const message = messages[key];
        const { text, reactions } = message;
        emojifiedMessages[key] = Object.assign({}, message, { reactions: reactions
                ? reactions.map(reaction => (Object.assign({}, reaction, { name: emoji.replace_colons(reaction.name) })))
                : [], text: emoji.replace_colons(text ? text : "") });
    });
    return emojifiedMessages;
};
exports.parseLinks = (messages) => {
    // Looks for <url|title> pattern, and replaces them with normal markdown
    // The |pattern can be optional
    let parsed = {};
    Object.keys(messages).forEach(key => {
        const { content, text } = messages[key];
        let newContent = undefined;
        const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=;\^]*)/;
        const SLACK_MODIFIER = /(|.[^><]+)/;
        const re = new RegExp(`<(${URL_REGEX.source})(${SLACK_MODIFIER.source})>`, "g");
        if (!!content) {
            newContent = Object.assign({}, content, { text: content.text
                    ? content.text.replace(re, function (a, b, c, d, e) {
                        return e ? `[${e.substr(1)}](${b})` : `[${b}](${b})`;
                    })
                    : "", footer: content.footer
                    ? content.footer.replace(re, function (a, b, c, d, e) {
                        return e ? `[${e.substr(1)}](${b})` : `[${b}](${b})`;
                    })
                    : "" });
        }
        parsed[key] = Object.assign({}, messages[key], { text: text
                ? text.replace(re, function (a, b, c, d, e) {
                    return e ? `[${e.substr(1)}](${b})` : `[${b}](${b})`;
                })
                : "", content: newContent });
    });
    return parsed;
};
const getAttachmentLink = (name, permalink) => {
    return `[${name}](${permalink})`;
};
exports.markdownify = (messages) => {
    let markdowned = {};
    const md = new MarkdownIt({ breaks: true }).use(markdownItSlack);
    // Override renderer for link_open --> this adds an onclick attribute
    // on links, so that we can open them via message passing. This relies
    // on method `openLink` inside src/ui/static.js
    var defaultRender = md.renderer.rules.link_open ||
        function (tokens, idx, options, env, self) {
            return self.renderToken(tokens, idx, options);
        };
    md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
        const index = tokens[idx].attrIndex("href");
        const value = tokens[idx].attrs[index][1];
        // To suppress the default click handling behaviour of VS Code, we make
        // the href URI invalid. See: https://github.com/karigari/vscode-chat/issues/24
        tokens[idx].attrSet("href", `unparseable-href-${value}`);
        tokens[idx].attrPush(["onclick", `openLink('${value}'); return false;`]);
        // Add -1 tabindex so that pressing the `tab` key goes straight to the input field
        tokens[idx].attrPush(["tabindex", "-1"]);
        return defaultRender(tokens, idx, options, env, self);
    };
    const replyParser = (reply) => {
        const { attachment: replyAttachment, text: replyText } = reply;
        // Replies might not have both attachment and text
        if (!!replyAttachment) {
            const { name, permalink } = replyAttachment;
            const attachmentLink = getAttachmentLink(name, permalink);
            return Object.assign({}, reply, { textHTML: md.renderInline(str.UPLOADED_FILE(attachmentLink)) });
        }
        else if (!!replyText) {
            return Object.assign({}, reply, { textHTML: md.renderInline(replyText) });
        }
        else {
            return reply;
        }
    };
    Object.keys(messages).forEach(key => {
        const { content, attachment, text, replies } = messages[key];
        let parsedReplies = {};
        let link = "";
        let newContent = undefined;
        Object.keys(replies).forEach(replyTs => {
            const reply = replies[replyTs];
            parsedReplies[replyTs] = replyParser(reply);
        });
        if (!!attachment) {
            const { name, permalink } = attachment;
            link = getAttachmentLink(name, permalink);
        }
        if (!!content) {
            newContent = Object.assign({}, content, { textHTML: content.text ? md.render(content.text) : ``, footerHTML: content.footer ? md.renderInline(content.footer) : `` });
        }
        markdowned[key] = Object.assign({}, messages[key], { replies: parsedReplies, textHTML: attachment
                ? md.render(str.UPLOADED_FILE(link))
                : md.render(text), content: newContent });
    });
    return markdowned;
};
const transformChain = (uiMessage) => {
    const { messages } = exports.parseUsernames(uiMessage);
    return Object.assign({}, uiMessage, { messages: exports.markdownify(exports.parseLinks(exports.emojify(messages))) });
};
exports.default = transformChain;
//# sourceMappingURL=markdowner.js.map