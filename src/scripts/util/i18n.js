"use strict";

var path = require('path'),
    util = require('util'),
    Polyglot = require('node-polyglot'),
    _ = require('lodash');

// Note: This can't be merged into another var statement due to the way brfs "works".
var fs = require('fs');

var warn = function (message) {
    // XXX: turn off warnings until i18n works in browsers
    // console.warn(util.format('I18N WARNING (%s): %s', locale, message));
};

var getLocale = function (defaultLocale) {
    if (typeof navigator !== 'undefined') {
        return navigator.language;
    } else if (typeof process !== 'undefined') {
        return process.env.LANG.replace('_', '-').split('.')[0];
    } else {
        return defaultLocale;
    }
};

var getLocales = function (locale, defaultLocale) {
    return _.uniq([defaultLocale, locale.split('-')[0], locale]);
};

var getTranslations = function () {
    var dirname = path.join(__dirname, 'assets/i18n'),
        translations = {};
    /*
     * XXX: in theory this should work for browsers and Electron
     * XXX: in practice watchify/brfs isn't working
     *
    fs.readdirSync(dirname).filter(function (filename) {
        return path.extname(filename) === '.json';
    }).forEach(function (filename) {
        var locale = path.basename(filename, '.json'),
            contents = fs.readFileSync(filename, 'utf8'),
            translation = JSON.parse(contents);
        translations[locale] = translation;
    });
    */
    return translations;
};

var defaultLocale = 'en',
    locale = getLocale(defaultLocale),
    locales = getLocales(locale, defaultLocale),
    polyglot = new Polyglot({ locale: locale, warn: warn }),
    translations = getTranslations();

// XXX: temporary until we get brfs working
polyglot.extend(require('../../../assets/i18n/en-US.json'));

locales.forEach(function (locale) {
    if (translations.hasOwnProperty(locale)) {
        polyglot.extend(translations[locale]);
    }
});

module.exports = polyglot;
