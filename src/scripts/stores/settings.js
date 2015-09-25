"use strict";

var EventEmitter = require('events').EventEmitter,
    Dispatcher = require('../dispatcher'),
    Constants = require('../constants'),
    util = require('util'),
    Actions = Constants.Actions,
    Events = Constants.Events,
    _ = require('lodash');

var data = {
    "auth/accessToken": "e9ea20fcdb514074aad6b88a7626ec2a",
    "auth/accessTokenExpiration": "1445452549003",
    "auth/deviceId": "2694459065",
    "auth/domain": "aeroim",
    "auth/email": "barry@aerofs.com",
    "auth/firstName": "Barry",
    "auth/lastName": "Shapira",
    "auth/refreshToken": "935916da5f944ba6bf25bf3f1e803246",
    "auth/userId": "b9fcb7e5e1cc43dcb0042f145ed8cc43",
    "debug/showRawXmpp": "false",
    "hostname": "staging.arrowfs.org",
    "lastConversationId": "cordova-demo@muc.aeroim",
    "length": 17,
    "notification/popup": "false",
    "notification/sound": "false",
    "notification/unreadMessageSound": "beer_can_opening",
    "opentok_client_id": "4b248902-66c6-4701-a82d-856145c96304",
    "url/video": "http://localhost:8080/token"
};

var Store = _.assign({}, EventEmitter.prototype, {
    // events
    emitChange: function (keys) {
        this.emit(Events.CHANGE_SETTINGS, keys);
    },

    addChangeListener: function (callback) {
        this.on(Events.CHANGE_SETTINGS, callback);
    },

    removeChangeListener: function (callback) {
        this.removeListener(Events.CHANGE_SETTINGS, callback);
    },

    // access
    get: function (key, defaultValue) {
        return _.get(data, key, defaultValue);
    },

    has: function (key) {
        return _.has(data, key);
    },

    getHostname: function () {
        return this.get('hostname', location.hostname);
    },

    getXmppUrl: function () {
        var def = util.format('https://%s/http-bind/', this.getHostname());
        return this.get('url/xmpp', def);
    },

    getLoginVerifyUrl: function () {
        var def = util.format('https://%s/api/v1.0/user/verify', this.getHostname());
        return this.get('url/auth', def);
    },

    getLoginRequestUrl: function () {
        var def = util.format('https://%s/api/v1.0/user', this.getHostname());
        return this.get('url/identify', def);
    },

    getBlurbUrl: function (type, id) {
        var def = util.format('https://%s/blurb', this.getHostname()),
            path = this.get('url/blurb', def),
            url = util.format('%s/%s?id=%s', path, type, id);
        return url;
    },

    getCredentials: function () {
        var userId = this.get('auth/userId'),
            domain = this.get('auth/domain'),
            jid = util.format('%s@%s', userId, domain),
            password = this.get('auth/accessToken'),
            server = this.getXmppUrl();
        return {
            jid: jid,
            password: password,
            server: server
        };
    }
});

Store.dispatchToken = Dispatcher.register(function (action) {
    switch (action.type) {
        case Actions.UPDATE_SETTINGS:
            _.forEach(action.settings, function (value, key) {
                data[key] = value;
            });
            Store.emitChange(_.keys(action.settings));
            break;

        case Actions.UNSET_SETTINGS:
            action.keys.forEach(function (key) {
                delete data[key];
            });
            Store.emitChange(action.keys);
            break;

        case Actions.LOGOUT:
            var keys = [
                'auth/accessToken',
                'auth/accessTokenExpiration',
                'auth/deviceId',
                'auth/domain',
                'auth/refreshToken',
                'auth/userId'
            ];
            _.forEach(keys, function (key) {
                delete data[key];
            });
            Store.emitChange(keys);
            break;

        default:
            break;
    }
});

module.exports = Store;
