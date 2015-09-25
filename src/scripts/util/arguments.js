"use strict";

var _ = require('lodash');

// Command line arguments used to launch Atom Shell.
var props = process.argv.slice(2).map(function (arg) {
    return arg.split('=');
});

module.exports = _.zipObject(props);
