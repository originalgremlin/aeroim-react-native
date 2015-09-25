'use strict';

var EventEmitter = require('events').EventEmitter,
    Dispatcher = require('../dispatcher'),
    Constants = require('../constants'),
    LastViewedStore = require('./last-viewed'),
    GroupInfoStore = require('./group-info'),
    ProfileStore = require('./profile'),
    Settings = require('../actions/settings'),
    SettingsStore = require('./settings'),
    Actions = Constants.Actions,
    Events = Constants.Events,
    _ = require('lodash');

var data = {
    currentConversationId: SettingsStore.get('lastConversationId'),
    conversation: {}
};

var utility = {
    createMessage: function (conversationId, message) {
        if (!data.conversation.hasOwnProperty(conversationId)) {
            data.conversation[conversationId] = {};
        }
        data.conversation[conversationId][message.id] = message;
    },

    markAsRead: function (conversationId) {
        var conversation = data.conversation[conversationId];
        _.forEach(conversation, function (message) {
            message.read = true;
        });
    }
};

var Store = _.assign({}, EventEmitter.prototype, {
    // events
    emitNewMessage: function (conversationId, messageId) {
        this.emit(Events.NEW_MESSAGE, conversationId, messageId);
    },

    addNewMessageListener: function (callback) {
        this.on(Events.NEW_MESSAGE, callback);
    },

    removeNewMessageListener: function (callback) {
        this.removeListener(Events.NEW_MESSAGE, callback);
    },

    emitChangeConversation: function (conversationId) {
        this.emit(Events.CHANGE_CONVERSATION, conversationId);
    },

    addChangeConversationListener: function (callback) {
        this.on(Events.CHANGE_CONVERSATION, callback);
    },

    removeChangeConversationListener: function (callback) {
        this.removeListener(Events.CHANGE_CONVERSATION, callback);
    },

    emitChangeUnreadCount: function (conversationId) {
        this.emit(Events.UNREAD_COUNT, conversationId);
    },

    addChangeUnreadCountListener: function (callback) {
        this.on(Events.UNREAD_COUNT, callback);
    },

    removeChangeUnreadCountListener: function (callback) {
        this.removeListener(Events.UNREAD_COUNT, callback);
    },

    // access
    getConversation: function (id) {
        var messages = _.values(data.conversation[id]);
        messages.sort(function (a, b) {
            return a.date - b.date;
        });
        return messages;
    },

    getCurrentConversation: function () {
        return this.getConversation(this.getCurrentConversationId());
    },

    getCurrentConversationId: function () {
        return data.currentConversationId;
    },

    getMessage: function (conversationId, messageId) {
        return data.conversation[conversationId][messageId];
    },

    getUnreadMessages: function (id) {
        return _.filter(data.conversation[id], { read: false }) || {};
    },

    getAllUnreadMessageCounts: function () {
        var ids = _.keys(data.conversation),
            counts = _.map(ids, this.getUnreadMessageCount, this);
        return _.zipObject(ids, counts) || {};
    },

    getUnreadMessageCount: function (id) {
        return _.size(this.getUnreadMessages(id));
    }
});

Store.dispatchToken = Dispatcher.register(function (action) {

    Dispatcher.waitFor([
        LastViewedStore.dispatchToken,
        GroupInfoStore.dispatchToken,
        ProfileStore.dispatchToken
    ]);

    switch (action.type) {
        case Actions.CHANGE_CONVERSATION:
            data.currentConversationId = action.id;
            //Settings.update('lastConversationId', action.id);
            utility.markAsRead(action.id);
            Store.emitChangeConversation(action.id);
            Store.emitChangeUnreadCount(conversationId);
            break;

        case Actions.CREATE_INCOMING_MESSAGE:
            var { type, ...message } = action,
                conversationId = message.from;
            message.read = (conversationId === data.currentConversationId);
            utility.createMessage(conversationId, message);
            Store.emitNewMessage(conversationId, message.id);
            Store.emitChangeUnreadCount(conversationId);
            break;

        case Actions.CREATE_OUTGOING_MESSAGE:
            var { type, ...message } = action,
                conversationId = message.to;
            message.read = true;
            utility.createMessage(conversationId, message);
            Store.emitNewMessage(conversationId, message.id);
            Store.emitChangeUnreadCount(conversationId);
            break;

        case Actions.CREATE_GROUP_MESSAGE:
            var { type, ...message } = action,
                conversationId = message.to;
            message.outgoing = (message.from === Chat.getId());
            message.read = (conversationId === data.currentConversationId || isRead(conversationId, message));
            utility.createMessage(conversationId, message);
            Store.emitNewMessage(conversationId, message.id);
            Store.emitChangeUnreadCount(conversationId);
            break;

        case Actions.LEAVE_ROOM:
            delete data.conversation[action.room];
            if (data.currentConversationId === action.room) {
                data.currentConversationId = null;
                Store.emitChangeConversation(null);
            }
            break;

        case Actions.LOAD_ARCHIVED_MESSAGES:
            _.forEach(action.messages, function (message) {
                var conversationId = message.outgoing ? message.to : message.from;
                message.read = (conversationId === data.currentConversationId || isRead(conversationId, message));
                utility.createMessage(conversationId, message);
            });
            break;

        case Actions.LOAD_LAST_VIEWED_TIMES:
            // FIXME: this is slow and bad.
            _.forEach(action.lastViewed, function (convo) {
                data[convo.id] = convo.date;
                _.forEach(data.conversation[convo.id], function (message) {
                    message.read = isRead(convo.id, message);
                });
            });
            break;

        default:
            break;
    }
});

function isRead(conversationId, message) {
    return _.has(data, conversationId) && message.date < data[conversationId];
}

module.exports = Store;
