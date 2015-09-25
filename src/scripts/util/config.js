"use strict";

var atomArgs = require('./arguments'),
    _ = require('lodash');

var environment = atomArgs['--environment'] || 'production',
    prefix = 'npm_package_config_' + environment + '_',
    prefixLength = prefix.length;

var props = _.keys(process.env).filter(function (fullKey) {
    return _.startsWith(fullKey, prefix);
}).map(function (fullKey) {
    var key = fullKey.substr(prefixLength),
        val = JSON.parse(process.env[fullKey]);
    return [key, val];
});

module.exports = _.zipObject(props);
