"use strict";

var XMPP = require('stanza.io'),
    _ = require('lodash');

module.exports = function (client, stanza) {
    var types = stanza.utils;

    // 1. Create and register our custom `mystanza` stanza type
    var Pinned = stanza.define({
        name: 'pinned',
        namespace: 'aero:pinned',
        element: 'pinned'
    });

    var Conversation = stanza.define({
        name: '_conversation',
        namespace: 'aero:pinned',
        element: 'conversation',
        fields: {
            jid: types.jidAttribute('jid', true),
            date: types.dateAttribute('date')
        }
    });

    stanza.extend(Pinned, Conversation, 'conversations');

    stanza.withDefinition('query', 'jabber:iq:private', function (PrivateStorage) {
        stanza.extend(PrivateStorage, Pinned);
    });

    // 2. Add API to the stanza.io client
    client.getPinnedConversations = function (cb) {
        return this.getPrivateData({ pinned: true }, cb);
    };

    client.setPinnedConversations = function (opts, cb) {
        return this.setPrivateData({ pinned: opts }, cb);
    };

    client.pinConversation = function (conversationJid, cb) {
        return client.getPinnedConversations()
            .then(function (res) {
                var conversations = _.reject(res.privateStorage.pinned.conversations || [], function (conversation) {
                    return conversation.jid.bare === conversationJid;
                });
                var data = {
                    jid: new XMPP.JID(conversationJid),
                    date: new Date()
                };
                conversations.push(data);
                client.setPinnedConversations({ conversations: conversations });
                return {
                    id: data.jid.bare,
                    date: data.date
                };
            })
            .catch(function (err) {
                console.error(err);
            })
            .nodeify(cb);
    };

    client.unpinConversation = function (conversationJid, cb) {
        return client.getPinnedConversations()
            .then(function (res) {
                var conversations = _.reject(res.privateStorage.pinned.conversations || [], function (conversation) {
                    return conversation.jid.bare === conversationJid;
                });
                client.setPinnedConversations({ conversations: conversations });
                return {
                    id: conversationJid
                };
            })
            .catch(function (err) {
                console.error(err);
            })
            .nodeify(cb);
    };
};
