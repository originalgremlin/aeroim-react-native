'use strict';

var EventEmitter = require('events').EventEmitter,
    Actions = require('../constants').Actions,
    Events = require('../constants').Events,
    Dispatcher = require('../dispatcher'),
    _ = require('lodash');

/**
 * id -> Array[{
 *  - id
 *  - affiliation
 * }]
 */
var data = {};

var Store = _.assign({}, EventEmitter.prototype, {
    emitChange: function () {
        this.emit(Events.UPDATE_GROUP_MEMBERS);
    },

    addChangeListener: function (cb) {
        this.on(Events.UPDATE_GROUP_MEMBERS, cb);
    },

    removeChangeListener: function (cb) {
        this.removeListener(Events.UPDATE_GROUP_MEMBERS, cb);
    },

    getAll: function () {
        return data;
    },

    get: function (id) {
        return data[id];
    }
});

Store.dispatchToken = Dispatcher.register(function (action) {
    switch (action.type) {

        case Actions.LOAD_ROOM_MEMBERS:
            data[action.id] = action.members;
            break;

        case Actions.LOAD_JOINED_ROOMS:
            // FIXME: this should be Actions.CREATE_NEW_GROUP
            _.forEach(action.rooms, (room) => {
                if (_.has(room, 'members')) {
                    data[room.id] = room.members
                }
            });
            break;

        case Actions.ROOM_EDITED:
            var groupId = action.id;
            // remove members
            _.remove(data[groupId], (member) => {
                return _.contains(action.membersRemoved, member.id);
            });
            // add members
            _.forEach(action.membersAdded, (memberId) => {
                data[groupId].push({
                    id: memberId,
                    affiliation: 'member'
                });
            });
            break;

        default:
            // don't emit change event
            return;
    }
    Store.emitChange();
});

module.exports = Store;