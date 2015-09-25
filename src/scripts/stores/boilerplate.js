'use strict';

var EventEmitter = require('events').EventEmitter,
    Actions = require('../constants').Actions,
    Events = require('../constants').Events,
    Dispatcher = require('../dispatcher'),
    _ = require('lodash');

var data = {};

var Store = _.assign({}, EventEmitter.prototype, {
    emitChange: function () {
        this.emit(Events.UPDATE___STORE_NAME__);
    },

    addChangeListener: function (cb) {
        this.on(Events.UPDATE___STORE_NAME__, cb);
    },

    removeChangeListener: function (cb) {
        this.removeListener(Events.UPDATE___STORE_NAME__, cb);
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

        /*
         * case Action.SOMETHING:
         *     do something
         *     break;
         */

        default:
            // don't emit change event
            return;
    }
    Store.emitChange();
});

module.exports = Store;