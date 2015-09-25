"use strict";

var XMPP = require('stanza.io'),
    _ = require('lodash');

module.exports = function (client, stanza) {
    var types = stanza.utils;

    // 1. Create and register our custom `mystanza` stanza type
    var Viewed = stanza.define({
        name: 'viewed',
        namespace: 'aero:viewed',
        element: 'viewed'
    });

    var Conversation = stanza.define({
        name: '_conversation',
        namespace: 'aero:viewed',
        element: 'conversation',
        fields: {
            jid: types.jidAttribute('jid', true),
            date: types.dateAttribute('date')
        }
    });

    stanza.extend(Viewed, Conversation, 'conversations');

    stanza.withDefinition('query', 'jabber:iq:private', function (PrivateStorage) {
        stanza.extend(PrivateStorage, Viewed);
    });

    // 2. Add API to the stanza.io client
    client.getViewedConversations = function (cb) {
        return this.getPrivateData({ viewed: true }, cb);
    };

    client.setViewedConversations = function (opts, cb) {
        return this.setPrivateData({ viewed: opts }, cb);
    };

    client.viewConversation = function (conversationJid, cb) {
        return client.getViewedConversations()
            .then(function (res) {
                var conversations = _.reject(res.privateStorage.viewed.conversations || [], function (conversation) {
                    return conversation.jid.bare === conversationJid;
                });
                var data = {
                    jid: new XMPP.JID(conversationJid),
                    date: new Date()
                };
                conversations.push(data);
                client.setViewedConversations({ conversations: conversations });
                return {
                    id: data.jid.bare,
                    date: data.date
                }
            })
            .catch(function (err) {
                console.error(err);
            })
            .nodeify(cb);
    };

    client.unviewConversation = function (conversationJid, cb) {
        return client.getViewedConversations()
            .then(function (res) {
                var conversations = _.reject(res.privateStorage.viewed.conversations || [], function (conversation) {
                    return conversation.jid.bare === conversationJid;
                });
                client.setViewedConversations({ conversations: conversations });
            })
            .catch(function (err) {
                console.error(err);
            })
            .nodeify(cb);
    };
};
