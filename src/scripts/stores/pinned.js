'use strict';

var EventEmitter = require('events').EventEmitter,
    Actions = require('../constants').Actions,
    Events = require('../constants').Events,
    Dispatcher = require('../dispatcher'),
    Set = require('collections/set'),
    _ = require('lodash');

var data = new Set();

var Store = _.assign({}, EventEmitter.prototype, {
    emitChange: function () {
        this.emit(Events.UPDATE_PINNED);
    },

    addChangeListener: function (cb) {
        this.on(Events.UPDATE_PINNED, cb);
    },

    removeChangeListener: function (cb) {
        this.removeListener(Events.UPDATE_PINNED, cb);
    },

    getAll: function () {
        return data;
    },

    get: function (id) {
        return data.has(id);
    }
});

Store.dispatchToken = Dispatcher.register(function (action) {
    switch (action.type) {
        case Actions.LOAD_PINNED_CONVERSATIONS:
            _.forEach(action.pinned, (convo) => {
                data.add(convo.id);
            });
            break;

        case Actions.PIN_CONVERSATION:
            data.add(action.id);
            break;

        case Actions.UNPIN_CONVERSATION:
            data.delete(action.id);
            break;

        default:
            // don't emit change event
            return;
    }
    Store.emitChange();
});

module.exports = Store;