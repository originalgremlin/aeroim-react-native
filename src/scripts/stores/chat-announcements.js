"use strict";

var EventEmitter = require('events').EventEmitter,
    Dispatcher = require('../dispatcher'),
    Constants = require('../constants'),
    Actions = Constants.Actions,
    Events = Constants.Events,
    util = require('util'),
    _ = require('lodash');

var data = {};

// store
var Store = _.assign({}, EventEmitter.prototype, {
    // events
    emitChange: function (id) {
        this.emit(Events.ANNOUNCEMENT, id);
    },

    addChangeListener: function (callback) {
        this.on(Events.ANNOUNCEMENT, callback);
    },

    removeChangeListener: function (callback) {
        this.removeListener(Events.ANNOUNCEMENT, callback);
    },

    // access
    getAnnouncement: function (id) {
        return data[id];
    },

    getAnnouncements: function () {
        return data;
    },

    getOrderedAnnouncements: function () {
        var announcements = _.values(data);
        announcements.sort(function (a, b) {
            return a.date - b.date;
        });
        return announcements;
    }
});

// action handlers
Store.dispatchToken = Dispatcher.register(function (action) {
    switch (action.type) {
        // profiles
        case Actions.ANNOUNCEMENT:
            var id = action.id;
            data[id] = action;
            Store.emitChange(id);
            break;

        default:
            break;
    }
});

module.exports = Store;
