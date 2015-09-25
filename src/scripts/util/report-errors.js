"use strict";

window.onerror = function (msg, url, lineNumber, colNumber, err) {
    console.error(arguments);

    // TODO: forward to central server

    // prevent firing of the default event handler
    return true;
};
