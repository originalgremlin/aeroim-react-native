"use strict";

var Dispatcher = require('../dispatcher'),
    Constants = require('../constants'),
    Actions = Constants.Actions,
    _ = require('lodash');

module.exports = {
    load: function () {
        Dispatcher.dispatch({
            type: Actions.LOAD_SETTINGS
        });
    },

    save: function () {
        Dispatcher.dispatch({
            type: Actions.SAVE_SETTINGS
        });
    },

    update: function (key, value) {
        var settings;
        if (_.isString(key)) {
            settings = {};
            settings[key] = value;
        } else if (_.isObject(key)) {
            settings = key;
        } else {
            settings = {};
        }
        Dispatcher.dispatch({
            type: Actions.UPDATE_SETTINGS,
            settings: settings
        });
    },

    unset: function (key) {
        var keys;
        if (_.isString(key)) {
            keys = [key];
        } else if (_.isArray(key)) {
            keys = key;
        } else {
            keys = [];
        }
        Dispatcher.dispatch({
            type: Actions.UNSET_SETTINGS,
            keys: keys
        });
    },

    logout: function () {
        Dispatcher.dispatch({
            type: Actions.LOGOUT
        });
    }
};
