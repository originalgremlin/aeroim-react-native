"use strict";

var util = require('util'),
    _ = require('lodash');

var mirror = function (arr) {
    return _.zipObject(_.zip(arr, arr));
};

module.exports = {
    Properties: {
        AVATAR_SIZE: {
            HEIGHT: 96,
            WIDTH: 96
        },
        DEBUG_STANZA_LIMIT: 100,
        NOTIFICATION_TIMEOUT: 5000,
        ROSTER_LIMIT: 1000,
        XMPP_TIMEOUT: 5
    },
    Actions: mirror([
        'ANNOUNCEMENT',
        'JOIN_ROOM',
        'LEAVE_ROOM',
        'LOAD_JOINED_ROOMS',
        'LOAD_PUBLIC_ROOMS',
        'LOAD_PROFILE',
        'LOAD_ROOM_CONFIGURATION',
        'LOAD_ROSTER',
        'LOAD_ARCHIVED_MESSAGES',
        'LOAD_PINNED_CONVERSATIONS',
        'LOAD_LAST_VIEWED_TIMES',
        'UPDATE_PRESENCE',
        'CHANGE_CONVERSATION',
        'CLICK_FILE',
        'CLICK_FOLDER',
        'CLICK_SEARCH_RESULT',
        'CREATE_GROUP_MESSAGE',
        'CREATE_INCOMING_MESSAGE',
        'CREATE_OUTGOING_MESSAGE',
        'LOAD_ROOM_MEMBERS',
        'RECEIVE_DEBUG_STANZA',
        'SEND_DEBUG_STANZA',
        'CREATE_GROUP_MESSAGE',
        'SEARCH_QUERY',
        'UNSET_SETTINGS',
        'UPDATE_SETTINGS',
        'LOGOUT',
        'PIN_CONVERSATION',
        'UNPIN_CONVERSATION',
        'ROOM_EDITED',
        'DELETE_PROFILE'
    ]),
    Events: mirror([
        'ANNOUNCEMENT',
        'CHANGE_CONVERSATION',
        'CHANGE_SETTINGS',
        'CLICK_FILE',
        'CLICK_FOLDER',
        'CLICK_SEARCH_RESULT',
        'LOAD_PROFILE',
        'LOADING_COMPLETE',
        'NEW_MESSAGE',
        'NEW_DEBUG_STANZA',
        'SEARCH_RESULTS',
        'UNREAD_COUNT',
        'UPDATE_IDENTITY',
        'UPDATE_PRESENCE',
        'UPDATE_ROSTER',
        'UPDATE_LAST_VIEWED'
    ]),
    Notifications: mirror([
        'NEW_GROUP_CONVERSATION',
        'NEW_INDIVIDUAL_CONVERSATION',
        'NEW_UNREAD_MESSAGE',
        'UPDATE_PRESENCE'
    ]),
    Presence: {
        Availability: mirror([
            'AVAILABLE',
            'UNAVAILABLE'
        ]),
        Show: mirror([
            'AWAY',
            'CHAT',
            'DND',
            'XA'
        ]),
        State: mirror([
            'ACTIVE',
            'COMPOSING',
            'PAUSED',
            'INACTIVE',
            'GONE'
        ])
    }
};
