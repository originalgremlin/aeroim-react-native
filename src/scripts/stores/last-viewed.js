'use strict';

var EventEmitter = require('events').EventEmitter,
    Actions = require('../constants').Actions,
    Events = require('../constants').Events,
    Dispatcher = require('../dispatcher'),
    _ = require('lodash');

var data = {
    lastViewed: {},
    currentConversationId: null
};

var Store = _.assign({}, EventEmitter.prototype, {
    emitChange: function () {
        this.emit(Events.UPDATE_LAST_VIEWED);
    },

    addChangeListener: function (cb) {
        this.on(Events.UPDATE_LAST_VIEWED, cb);
    },

    removeChangeListener: function (cb) {
        this.removeListener(Events.UPDATE_LAST_VIEWED, cb);
    },

    getAll: function () {
        return data.lastViewed;
    },

    get: function (id) {
        return data.lastViewed[id];
    }
});

Store.dispatchToken = Dispatcher.register(function (action) {
    switch (action.type) {
        case Actions.LOAD_LAST_VIEWED_TIMES:
            _.forEach(action.lastViewed, (convo) => {
                data.lastViewed[convo.id] = convo.date;
            });
            break;

        case Actions.CHANGE_CONVERSATION:
            var oldConversationId = data.currentConversationId;
            data.currentConversationId = action.id;

            _.forEach([oldConversationId, data.currentConversationId], (id) => {
                if (!id) {
                    return;
                }

                // optimistically change value
                var oldVal = data.lastViewed[id];
                data.lastViewed[id] = new Date();

                // change value to the server-provided one when it comes in, or revert on err
                Chat.updateLastViewed(id)
                    .then((res) => {
                        data.lastViewed[res.id] = res.date;
                        Store.emitChange();
                    })
                    .catch((err) => {
                        console.error('failed to update last viewed for', id, err);
                        data.lastViewed[id] = oldVal;
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