'use strict';

var _ = require('lodash'),
    none = {};

module.exports = {
    assert: require('assert/'),
    buffer: require('buffer/'),
    child_process: none,
    cluster: none,
    console: require('console-browserify'),
    constants: require('constants-browserify'),
    // crypto: require('crypto-browserify'),
    dgram: none,
    dns: none,
    domain: require('domain-browser'),
    events: require('events/'),
    fs: none,
    http: require('http'),
    https: require('https-browserify'),
    module: none,
    net: none,
    os: require('os-browserify/browser.js'),
    path: require('path-browserify'),
    punycode: require('punycode/'),
    querystring: require('querystring-es3/'),
    readline: none,
    repl: none,
    stream: require('./stream'),
    _stream_duplex: require('readable-stream/duplex.js'),
    _stream_passthrough: require('readable-stream/passthrough.js'),
    _stream_readable: require('./_stream_readable'),
    _stream_transform: require('./_stream_transform'),
    _stream_writable: require('readable-stream/writable.js'),
    string_decoder: require('string_decoder/'),
    sys: require('util/util.js'),
    timers: require('timers-browserify'),
    tls: none,
    tty: require('tty-browserify'),
    url: require('url/'),
    util: require('util/util.js'),
    vm: require('vm-browserify'),
    zlib: require('browserify-zlib'),
    _process: require('process/browser')
};

//require.cache[require.resolve('underscore')] = require.cache[require.resolve('lodash')]