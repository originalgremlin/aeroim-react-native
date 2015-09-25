"use strict";

var fs = require('fs'),
    path = require('path'),
    EventEmitter = require('events').EventEmitter,
    Dispatcher = require('../dispatcher'),
    Constants = require('../constants'),
    Actions = Constants.Actions,
    Events = Constants.Events,
    _ = require('lodash');

var data = {
    lastFileClicked: null,
    folders: { }
};

var MAX_AGE = 60 * 1000;

var Store = _.assign({}, EventEmitter.prototype, {
    // events
    emitFileClick: function (path) {
        this.emit(Events.CLICK_FILE, path);
    },

    addFileClickListener: function (callback) {
        this.on(Events.CLICK_FILE, callback);
    },

    removeFileClickListener: function (callback) {
        this.removeListener(Events.CLICK_FILE, callback);
    },

    emitFolderClick: function (path) {
        this.emit(Events.CLICK_FOLDER, path);
    },

    addFolderClickListener: function (callback) {
        this.on(Events.CLICK_FOLDER, callback);
    },

    removeFolderClickListener: function (callback) {
        this.removeListener(Events.CLICK_FOLDER, callback);
    },

    // access
    getLastFileClicked: function () {
        return data.lastFileClicked;
    },

    getFolderItems: function (folderPath) {
        // remove expired data
        var now = new Date();
        _.filter(data.folders, function (value, key) {
            if (now - value.date > MAX_AGE) {
                return key;
            }
        }).forEach(function (value) {
            delete data.folders[value.path];
        });
        // cache folder contents
        if (!_.has(data.folders, folderPath)) {
            var files = fs.readdirSync(folderPath);
            var items = files.map(function (fileName) {
                var filePath = path.join(folderPath, fileName),
                    stats = fs.statSync(filePath);
                return {
                    name: fileName,
                    path: filePath,
                    size: stats.size,
                    isDirectory: stats.isDirectory()
                };
            });
            data.folders[folderPath] = {
                date: new Date(),
                items: items,
                path: folderPath
            };
        }
        // return cached folder contents
        return data.folders[folderPath].items;
    }
});

Store.dispatchToken = Dispatcher.register(function (action) {
    switch (action.type) {
        case Actions.CLICK_FILE:
            data.lastFileClicked = action.path;
            Store.emitFileClick(action.path);
            break;

        case Actions.CLICK_FOLDER:
            Store.emitFolderClick(action.path);
            break;

        default:
            break;
    }
});

module.exports = Store;
