'use strict';

require.extensions['.css'] = function (module, filename) {
    module.exports = require('fs').readFileSync(filename, 'utf8');
};

var css = require('css'),
    util = require('util'),
    styles = require('../styles/bundle.css'),
    ast = css.parse(styles);

console.log(util.inspect(ast, { depth: null }));
