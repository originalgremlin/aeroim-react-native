'use strict';

var EventEmitter = require('events').EventEmitter,
    Actions = require('../constants').Actions,
    Events = require('../constants').Events,
    Dispatcher = require('../dispatcher'),
    md5 = require('blueimp-md5').md5,
    util = require('util'),
    _ = require('lodash');

var data = {};

var Store = _.assign({}, EventEmitter.prototype, {
    emitChange: function () {
        this.emit(Events.UPDATE_AVATAR);
    },

    addChangeListener: function (cb) {
        this.on(Events.UPDATE_AVATAR, cb);
    },

    removeChangeListener: function (cb) {
        this.removeListener(Events.UPDATE_AVATAR, cb);
    },

    getAll: function () {
        return data;
    },

    get: function (id) {
        return data[id];
    }
});

Store.dispatchToken = Dispatcher.register(function (action) {
    switch (action.type) {

        case Actions.LOAD_PROFILE:
            var photoType = _.get(action.profile, 'photo.type'),
                photoData = _.get(action.profile, 'photo.data');
            if (!_.get(action, 'profile.name.given')) {
                console.warn('no given name in', action);
            }
            data[action.id] = (photoType && photoData) ?
                util.format('data:%s;base64,%s', photoType, photoData) :
                generateDefaultAvatar(action.id, action.profile.name.given);
            break;

        default:
            // don't emit change event
            return;
    }
    Store.emitChange();
});

var generateDefaultAvatar = function (id, name) {
    var generateText = function (name) {
        return name[0].toUpperCase();
    };

    var generateColor = function (id) {
        var numToHex = function numToHex(num) {
            return typeof num === 'number' ? num.toString(16) : num;
        };

        var hexToNum = function hexToNum(s) {
            return typeof s === 'string' ? parseInt(s, 16) : s;
        };

        var colorString = md5(id).slice(0, 6),
            redNum =  hexToNum(colorString.slice(0,2)),
            greenNum = hexToNum(colorString.slice(2,4)),
            blueNum = hexToNum(colorString.slice(4,6)),
            avgLightnessNum = _.floor(_.sum([redNum, greenNum, blueNum]) / 3),
            MIN_LIGHTNESS = hexToNum('88');
        // if darker than certain value, make lighter
        if (avgLightnessNum < MIN_LIGHTNESS) {
            var lightnessDiff = MIN_LIGHTNESS - avgLightnessNum;
            redNum = Math.min(redNum + lightnessDiff, 255);
            greenNum = Math.min(greenNum + lightnessDiff, 255);
            blueNum = Math.min(blueNum + lightnessDiff, 255);
            colorString = numToHex(redNum) + numToHex(greenNum) + numToHex(blueNum);
        }
        colorString = colorString.toLowerCase() === 'ffffff' ? 'f9f9f9' : colorString;
        return util.format('#%s', colorString);
    };
    var color = generateColor(id),
        text = generateText(name),
        canvas = document.createElement('canvas'),
        context = canvas.getContext('2d');
    canvas.height = canvas.width = 48;
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = util.format('%dpx sans-serif', 36);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#333333';
    context.fillText(text, canvas.width / 2, canvas.height / 2 + 2);
    return canvas.toDataURL('image/png');
};

module.exports = Store;