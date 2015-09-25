"use strict";

var Constants = require('../constants'),
    Deque = require("collections/deque"),
    Dispatcher = require('../dispatcher'),
    EventEmitter = require('events').EventEmitter,
    hljs = require('highlight.js'),
    uuid = require('uuid'),
    vkbeautify = require('../third-party/vkbeautify'),
    _ = require('lodash');

var data = new Deque();

var push = function (obj) {
    data.push(obj);
    while (data.length >= Constants.Properties.DEBUG_STANZA_LIMIT) {
        data.shift();
    }
};

var Store = _.assign({}, EventEmitter.prototype, {
    // events
    emitChange: function (id) {
        this.emit(Constants.Events.NEW_DEBUG_STANZA, id);
    },

    addChangeListener: function (callback) {
        this.addListener(Constants.Events.NEW_DEBUG_STANZA, callback);
    },

    removeChangeListener: function (callback) {
        this.removeListener(Constants.Events.NEW_DEBUG_STANZA, callback);
    },

    // access
    getStanzas: function () {
        // NOTE: we return the raw Deque here, not an array
        return data;
    }
});

Dispatcher.register(function (action) {
    switch (action.type) {
        case Constants.Actions.RECEIVE_DEBUG_STANZA:
        case Constants.Actions.SEND_DEBUG_STANZA:
            var body = hljs.highlightAuto(vkbeautify.xml(action.stanza), ['xml']).value,
                date = new Date(),
                id = uuid.v4();
            push({ body: body,  date: date,  id: id });
            Store.emitChange(id);
            break;

        default:
            break;
    }
});

module.exports = Store;