'use strict';

// https://developer.mozilla.org/en-US/docs/Web/API/notification
// TODO: check back for sound and vibrate properties

var Constants = require('../constants'),
    ConversationStore = require('../stores/chat-conversations'),
    AvatarStore = require('../stores/avatar'),
    ProfileStore = require('../stores/profile'),
    GroupInfoStore = require('../stores/group-info'),
    SettingsStore = require('../stores/settings'),
    sound = (require('ion-sound') && window.ion.sound),
    _ = require('lodash');

var Notifications = function() {
    ConversationStore.addNewMessageListener(handleNewMessage.bind(this));
    SettingsStore.addChangeListener(handleSettingsChange.bind(this));
    // popups
    Notification.requestPermission();
    // sounds
    sound({
        sounds: getSounds(),
        multiplay: true,
        path: './assets/sounds/',
        preload: true,
        volume: 0.5
    });
};

Notifications.prototype.notifyByPopup = function (type, info) {
    var id, title, body, icon;
    switch (type) {
        case Constants.Notifications.NEW_UNREAD_MESSAGE:
            id = info.from;
            title = _.get(ProfileStore.get(id), 'displayName') || _.get(GroupInfoStore.get(id), 'name', '');
            body = info.body;
            icon = AvatarStore.get(id);
            break;
        case Constants.Notifications.NEW_GROUP_CONVERSATION:
        case Constants.Notifications.NEW_INDIVIDUAL_CONVERSATION:
        case Constants.Notifications.UPDATE_PRESENCE:
        default:
            break;
    }
    var notification = new Notification(title, {
        body: body,
        icon: icon
    });
    window.setInterval(function () {
        notification.close();
    }, Constants.Properties.NOTIFICATION_TIMEOUT);
};

Notifications.prototype.notifyBySound = function (type, info) {
    sound.play(type);
};

var getSounds = function () {
    return [{
        alias: Constants.Notifications.NEW_UNREAD_MESSAGE,
        name: SettingsStore.get('notification/unreadMessageSound', 'beer_can_opening')
    }, {
        alias: Constants.Notifications.NEW_INDIVIDUAL_CONVERSATION,
        name: SettingsStore.get('notification/newIndividualConversationSound', 'bell_ring')
    }, {
        alias: Constants.Notifications.NEW_GROUP_CONVERSATION,
        name: SettingsStore.get('notification/newGroupConversationSound', 'branch_break')
    }];
};

var handleNewMessage = function (conversationId, messageId) {
    var message = ConversationStore.getMessage(conversationId, messageId),
        type = Constants.Notifications.NEW_UNREAD_MESSAGE,
        shouldPopup = SettingsStore.get('notification/popup') === 'true',
        shouldSound = SettingsStore.get('notification/sound') === 'true';
    if (!message.read) {
        if (shouldPopup) {
            this.notifyByPopup(type, message);
        }
        if (shouldSound) {
            this.notifyBySound(type, message);
        }
    }
};

var handleSettingsChange = function (keys) {
    sound.destroy(Constants.Notifications.NEW_UNREAD_MESSAGE);
    sound.destroy(Constants.Notifications.NEW_INDIVIDUAL_CONVERSATION);
    sound.destroy(Constants.Notifications.NEW_GROUP_CONVERSATION);
    sound({ sounds: getSounds() });
};

module.exports = new Notifications();
