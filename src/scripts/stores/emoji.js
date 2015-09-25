"use strict";

var EventEmitter = require('events').EventEmitter,
    _ = require('lodash');

var byGroup = require('../../../assets/json/emoji.json');

var byName = {};
_.forEach(byGroup, function (group) {
    _.forEach(group, function (value, name) {
        byName[name] = value;
    })
});

var byAlias = {};
_.forEach(byName, function (value, name) {
    byAlias[name] = name;
    _.forEach(value.aliases, function (alias) {
        byAlias[alias] = name;
    });
});

var Store = _.assign({}, EventEmitter.prototype, {
    getByGroup: function (group) {
        return _.isUndefined(group) ? byGroup : byGroup[group];
    },

    getByName: function (name) {
        return _.isUndefined(name) ? byName : byName[name];
    },

    getByAlias: function (alias) {
        if (_.isUndefined(alias)) {
            return byAlias;
        } else if (this.has(alias)) {
            return this.getByName(byAlias[alias]);
        } else {
            return null;
        }
    },

    get: function (alias) {
        return this.getByAlias(alias);
    },

    has: function (alias) {
        return byAlias.hasOwnProperty(alias);
    },

    search: function (query) {
        var re = new RegExp(query, 'i'),
            results = {};
        _.forEach(byName, function (value, name) {
            var aliases = value.aliases.concat(name),
                isMatch = _.some(aliases, function (alias) { return re.test(alias); });
            if (isMatch) {
                results[name] = value;
            }
        });
        return results;
    }
});

module.exports = Store;
