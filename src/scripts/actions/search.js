"use strict";

var Dispatcher = require('../dispatcher'),
    Constants = require('../constants'),
    Actions = Constants.Actions;

module.exports = {
    query: function (query) {
        Dispatcher.dispatch({
            type: Actions.SEARCH_QUERY,
            query: query
        });
    },

    clickResult: function (result) {
        Dispatcher.dispatch({
            type: Actions.CLICK_SEARCH_RESULT,
            result: result
        });
    }
};
