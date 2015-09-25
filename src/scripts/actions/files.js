"use strict";

var Dispatcher = require('../dispatcher'),
    Constants = require('../constants'),
    Actions = Constants.Actions;

module.exports = {
    clickFile: function (path) {
        Dispatcher.dispatch({
            type: Actions.CLICK_FILE,
            path: path
        });
    },

    clickFolder: function (path) {
        Dispatcher.dispatch({
            type: Actions.CLICK_FOLDER,
            path: path
        });
    }
};
