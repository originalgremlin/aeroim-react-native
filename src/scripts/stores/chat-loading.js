"use strict";

var EventEmitter = require('events').EventEmitter,
    Chat = require('../actions/chat'),
    Constants = require('../constants'),
    Dispatcher = require('../dispatcher'),
    SettingsStore = require('./settings'),
    AvatarStore = require('./avatar'),
    ProfileStore = require('./profile'),
    GroupInfoStore = require('./group-info'),
    GroupMembersStore = require('./group-members'),
    Actions = Constants.Actions,
    Events = Constants.Events,
    Set = require('collections/set'),
    _ = require('lodash');

var data = {
    expected: {
        individuals: null,
        joinedGroups: null,
        publicGroups: null
    },
    loaded: {
        avatars: false,
        groupInfo: false,
        groupMembers: false,
        lastViewed: false,
        messageArchive: false,
        pinned: false,
        profiles: false
    },
    loadingCompleteFired: false
};

_.delay(function () {
    if (!data.loadingCompleteFired) {
        console.warn('loading still not complete.', data.loaded);
    }
}, 10000);

var Store = _.assign({}, EventEmitter.prototype, {

    addChangeListener: function (callback) {
        this.on(Events.LOADING_COMPLETE, callback);
    },

    removeChangeListener: function (callback) {
        this.removeListener(Events.LOADING_COMPLETE, callback);
    },

    isLoadingComplete: function () {
        if (data.loadingCompleteFired) {
            return true;
        }

        if (_.any(_.map(data.expected, _.isNull))) {
            return false;
        }

        var expectedIndividuals = new Set(data.expected.individuals),
            expectedJoinedGroups = new Set(data.expected.joinedGroups),
            expectedGroups = expectedJoinedGroups.union(data.expected.publicGroups);

        data.loaded.avatars = expectedIndividuals.difference(_.keys(AvatarStore.getAll())).length === 0;
        data.loaded.groupInfo = expectedGroups.difference(_.keys(GroupInfoStore.getAll())).length === 0;
        data.loaded.groupMembers = expectedJoinedGroups.difference(_.keys(GroupMembersStore.getAll())).length === 0;
        data.loaded.profiles = expectedIndividuals.difference(_.keys(ProfileStore.getAll())).length === 0;

        return _.all(_.values(data.loaded));
    }
});


Store.dispatchToken = Dispatcher.register(function (action) {

    if (action.type === Actions.LOGOUT) {
        data.loadingCompleteFired = false;
        data.messageArchiveLoaded = false;
        data.rosterLoaded = false;
        Store.emit(Events.LOADING_COMPLETE, false);
        return;
    }

    if (data.loadingCompleteFired) {
        return;
    }

    Dispatcher.waitFor([
        AvatarStore.dispatchToken,
        ProfileStore.dispatchToken,
        GroupInfoStore.dispatchToken,
        GroupMembersStore.dispatchToken
    ]);

    switch (action.type) {
        case Actions.LOAD_ROSTER:
            data.expected.individuals = _.pluck(action.roster, 'id');
            data.expected.individuals.push(Chat.getId());
            break;

        case Actions.LOAD_ARCHIVED_MESSAGES:
            data.loaded.messageArchive = true;
            break;

        case Actions.LOAD_PINNED_CONVERSATIONS:
            data.loaded.pinned = true;
            break;

        case Actions.LOAD_LAST_VIEWED_TIMES:
            data.loaded.lastViewed = true;
            break;

        case Actions.LOAD_PUBLIC_ROOMS:
            data.expected.publicGroups = _.pluck(action.rooms, 'id');
            break;

        case Actions.LOAD_JOINED_ROOMS:
            data.expected.joinedGroups = _.pluck(action.rooms, 'id');
            break;

        case Actions.DELETE_PROFILE:
            _.remove(data.expected.individuals, (id) => { return id === action.id });
            break;
    }

    if (Store.isLoadingComplete()) {
        console.log('LOADING COMPLETE');
        Store.emit(Events.LOADING_COMPLETE, true);
        data.loadingCompleteFired = true;
    }
});

module.exports = Store;
