"use strict";

var EventEmitter = require('events').EventEmitter,
    Dispatcher = require('../dispatcher'),
    Chat = require('../actions/chat'),
    Constants = require('../constants'),
    Actions = Constants.Actions,
    Events = Constants.Events,
    _ = require('lodash');

var data = {},
    keys = ['availability', 'show', 'state', 'status'];

var Store = _.assign({}, EventEmitter.prototype, {
    // events
    emitChange: function (id) {
        this.emit(Events.UPDATE_PRESENCE, id);
    },

    addChangeListener: function (callback) {
        this.on(Events.UPDATE_PRESENCE, callback);
    },

    removeChangeListener: function (callback) {
        this.removeListener(Events.UPDATE_PRESENCE, callback);
    },

    // access
    getPresence: function (id) {
        return _.isUndefined(id) ? data : data[id];
    },

    getMyPresence: function () {
        return this.getPresence(Chat.getId());
    }
});

Store.dispatchToken = Dispatcher.register(function (action) {
    switch (action.type) {
        case Actions.UPDATE_PRESENCE:
            var id = action.id;
            if (!data.hasOwnProperty(id)) {
                data[id] = {};
            }
            // clear show and state on availablity change, as they are refinements
            if (!_.isUndefined(action.availability)) {
                delete data[id].show;
                delete data[id].state;
            }
            // set all new presence info
            keys.forEach(function (key) {
                if (!_.isUndefined(action[key])) {
                    data[id][key] = action[key];
                }
            });
            Store.emitChange(id);
            break;

        default:
            break;
    }
});

module.exports = Store;
