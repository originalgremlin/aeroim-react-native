"use strict";

var app = null,
    noop = function () { };

try {
    // app reference when running in Electron
    app = window.require('remoted').require('app');
} catch (e) {
    // no-op stubs when running in the browser
    app = {
        on: noop,
        quit: noop,
        terminate: noop,
        getPath: noop,
        setPath: noop,
        getVersion: noop,
        getName: noop,
        resolveProxy: noop,
        addRecentDocument: noop,
        clearRecentDocuments: noop,
        setUserTasks: noop,
        commandLine: {
            appendSwitch: noop,
            appendArgument: noop
        },
        dock: {
            bounce: noop,
            cancelBounce: noop,
            setBadge: noop,
            getBadge: noop,
            hide: noop,
            show: noop,
            setMenu: noop
        }
    };
}

module.exports = app;
