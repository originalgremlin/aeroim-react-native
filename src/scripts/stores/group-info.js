'use strict';

var EventEmitter = require('events').EventEmitter,
    Actions = require('../constants').Actions,
    Events = require('../constants').Events,
    Dispatcher = require('../dispatcher'),
    _ = require('lodash');

/**
 * id -> {
 * - isJoined
 * - isPublic
 * - name
 * - description
 * - creationDate
 * }
 */
var data = {};

var Store = _.assign({}, EventEmitter.prototype, {
    emitChange: function () {
        this.emit(Events.UPDATE_GROUP_INFO);
    },

    addChangeListener: function (cb) {
        this.on(Events.UPDATE_GROUP_INFO, cb);
    },

    removeChangeListener: function (cb) {
        this.removeListener(Events.UPDATE_GROUP_INFO, cb);
    },

    getAll: function () {
        return data;
    },

    get: function (id) {
        return data[id];
    },

    getAllJoined: function () {
        return _.pick(data, (v) => { return v.isJoined });
    }
});

Store.dispatchToken = Dispatcher.register(function (action) {
    switch (action.type) {

        case Actions.LOAD_ROOM_CONFIGURATION:
            data[action.id] = _.extend({}, data[action.id], action.info);
            break;

        case Actions.LOAD_JOINED_ROOMS:
            _.forEach(action.rooms, (room) => {
                data[room.id] = _.extend({}, data[room.id], {
                    name: room.name,
                    isJoined: true,
                    creationDate: room.creationDate
                });
            });
            break;

        case Actions.LOAD_PUBLIC_ROOMS:
            _.forEach(action.rooms, (room) => {
                data[room.id] = _.extend({}, data[room.id], {
                    name: room.name
                });
            });
            break;

        case Actions.JOIN_ROOM:
            data[action.id] = _.extend({}, data[action.id], {
                isJoined: true
            });
            break;

        case Actions.ROOM_EDITED:
            data[action.id] = _.extend(data[action.id], {
                name: action.name,
                isPublic: action.isPublic
            });
            break;

        default:
            // don't emit change event
            return;
    }
    Store.emitChange();
});

module.exports = Store;