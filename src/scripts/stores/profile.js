'use strict';

var EventEmitter = require('events').EventEmitter,
    Actions = require('../constants').Actions,
    Events = require('../constants').Events,
    Dispatcher = require('../dispatcher'),
    Chat = require('../actions/chat'),
    _ = require('lodash');

// TODO: document keys
var data = {};

var Store = _.assign({}, EventEmitter.prototype, {
    emitChange: function () {
        this.emit(Events.UPDATE_PROFILE);
    },

    addChangeListener: function (cb) {
        this.on(Events.UPDATE_PROFILE, cb);
    },

    removeChangeListener: function (cb) {
        this.removeListener(Events.UPDATE_PROFILE, cb);
    },

    getAll: function () {
        return data;
    },

    get: function (id) {
        return data[id];
    },

    getMyProfile: function () {
        return data[Chat.getId()];
    }
});

Store.dispatchToken = Dispatcher.register(function (action) {
    switch (action.type) {

        case Actions.LOAD_PROFILE:
            data[action.id] = _.omit(action.profile, 'photo');
            data[action.id].displayName = getDisplayName(data[action.id]);
            break;

        case Actions.DELETE_PROFILE:
            delete data[action.id];
            break;

        default:
            // don't emit change event
            return;
    }
    Store.emitChange();
});

function getDisplayName(profile) {
    return profile.name.given + ' ' + profile.name.family;
}

module.exports = Store;