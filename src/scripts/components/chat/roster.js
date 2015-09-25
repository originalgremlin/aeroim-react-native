'use strict';

var React = require('react-native'),
    { ScrollView } = React;

var Actions = require('../../actions/chat'),
    ConversationStore = require('../../stores/chat-conversations'),
    PresenceStore = require('../../stores/chat-presence'),
    LastViewedStore = require('../../stores/last-viewed'),
    ProfileStore = require('../../stores/profile'),
    GroupInfoStore = require('../../stores/group-info'),
    PinnedStore = require('../../stores/pinned'),
    IndividualRosterItem = require('./individual-roster-item'),
    GroupRosterItem = require('./group-roster-item'),
    _ = require('lodash');

// store this outside of Component state so that we can update it without a
// call to setState, which triggers a re-render.
var sessionMaxRecent = 10;

var Roster = React.createClass({
    getInitialState: function () {
        return {
            current: ConversationStore.getCurrentConversationId(),
            unread: ConversationStore.getAllUnreadMessageCounts(),
            presence: PresenceStore.getPresence(),
            pinned: PinnedStore.getAll(),
            lastViewed: LastViewedStore.getAll(),
            profiles: ProfileStore.getAll(),
            groupInfo: GroupInfoStore.getAll(),
            filter: '',
            selectedItemId: null
        };
    },

    componentDidMount: function () {
        ConversationStore.addChangeConversationListener(this.handleChangeConversation);
        ConversationStore.addChangeUnreadCountListener(this.handleChangeUnreadCount);
        PresenceStore.addChangeListener(this.handleUpdatePresence);
        PinnedStore.addChangeListener(this.handleUpdatePinned);
        LastViewedStore.addChangeListener(this.handleUpdateLastViewed);
        ProfileStore.addChangeListener(this.handleUpdateProfile);
        GroupInfoStore.addChangeListener(this.handleUpdateGroupInfo);
    },

    componentWillUnmount: function () {
        ConversationStore.removeChangeConversationListener(this.handleChangeConversation);
        ConversationStore.removeChangeUnreadCountListener(this.handleChangeUnreadCount);
        PresenceStore.removeChangeListener(this.handleUpdatePresence);
        PinnedStore.removeChangeListener(this.handleUpdatePinned);
        LastViewedStore.removeChangeListener(this.handleUpdateLastViewed);
        ProfileStore.removeChangeListener(this.handleUpdateProfile);
        GroupInfoStore.removeChangeListener(this.handleUpdateGroupInfo);
    },

    render: function () {
        var rosterItems = _.mapValues(this.getFilteredRoster(), function (ids) {
            return _.map(ids, this.toRosterItem);
        }, this);

        return (
            <ScrollView>{ rosterItems }</ScrollView>
        );
    },
    handleChangeConversation: function () {
        this.setState({
            current: ConversationStore.getCurrentConversationId()
        });
    },

    handleChangeUnreadCount: function () {
        this.setState({
            unread: ConversationStore.getAllUnreadMessageCounts()
        });
    },

    handleUpdatePresence: function () {
        this.setState({
            presence: PresenceStore.getPresence()
        });
    },

    handleUpdatePinned: function () {
        this.setState({
            pinned: PinnedStore.getAll()
        });
    },

    handleUpdateLastViewed: function () {
        this.setState({
            lastViewed: LastViewedStore.getAll()
        });
    },

    handleUpdateProfile: function () {
        this.setState({
            profiles: ProfileStore.getAll()
        });
    },

    handleUpdateGroupInfo: function () {
        this.setState({
            groupInfo: GroupInfoStore.getAll()
        });
    },

    handleFilterChange: function (event) {
        this.setState({
            filter: event.target.value
        });
    },

    handleKeyDown: function (event) {
        switch (event.key) {
            case 'Escape':
                this.handleEscapeKey();
                this.setState({selectedItemId: null});
                break;
            case 'Enter':
                this.handleEnterKey();
                break;
            case 'ArrowUp':
            case 'ArrowDown':
                event.preventDefault();
                this.handleArrowKey(event.key);
                break;
        }
    },

    handleEscapeKey: function () {
        this.setState({selectedItemId: null});
    },

    handleEnterKey: function () {
        if (this.state.selectedItemId) {
            Actions.changeConversation(this.state.selectedItemId);
        }
    },

    //FIXME
    handleArrowKey: function (key) {
        //var orderedRosterItems = _(this.state.filteredRoster).values().flatten().value();
        //if (orderedRosterItems.length === 0) {
        //    return;
        //}
        //var oldSelectedIndex = _.findIndex(orderedRosterItems, function (item) {
        //    return item.id === this.state.selectedItemId;
        //}, this);

        //var newSelectedIndex;
        //if (oldSelectedIndex < 0) {
        //    newSelectedIndex = 0;
        //} else if (key === 'ArrowUp') {
        //    newSelectedIndex = Math.max(oldSelectedIndex - 1, 0);
        //} else if (key === 'ArrowDown') {
        //    newSelectedIndex = Math.min(oldSelectedIndex + 1, orderedRosterItems.length - 1);
        //}
        //this.setState({
        //    selectedItemId: orderedRosterItems[newSelectedIndex].id
        //});
    },

    handleBlur: function () {
        this.setState({selectedItemId: null});
    },

    handleClick: function () {
        document.getElementById('search').focus();
    },

    getFilteredRoster: function () {
        var state = this.state,
            isMe = function (id) {
                return id === Actions.getId();
            },
            isConvoPinned = function (id) {
                return state.pinned.has(id);
            },
            getConvoName = function (id) {
                return _.get(state.profiles[id], 'displayName', '') || _.get(state.groupInfo[id], 'name', '');
            },
            getConvoUnreadCount = function (id) {
                return state.unread[id] || 0;
            },
            getConvoLastViewed = function (id) {
                return _.get(state.lastViewed, id, {getTime: _.constant(0)}).getTime();
            },
            isConvoAllRead = function (id) {
                return getConvoUnreadCount(id) === 0;
            },
            filterFn = function (id) {
                return _.contains(getConvoName(id).toLowerCase(), state.filter.toLowerCase());
            },
            individualIds = _(this.state.profiles).keys().reject(isMe).value(),
            groupIds = _.keys(this.state.groupInfo),
            allIds = _.union(individualIds, groupIds),
            partition = _.partition(allIds, isConvoPinned),
            important = _(partition[0]).filter(filterFn).sortBy(getConvoName).value(),
            unimportant = _.sortByOrder(
                partition[1],
                [getConvoUnreadCount, getConvoLastViewed],
                ['desc', 'desc']),
            unreadCount = _.findIndex(unimportant, isConvoAllRead),
            maxRecent = _.max([sessionMaxRecent, unreadCount]),
            recent = _(unimportant).slice(0, maxRecent).filter(filterFn).sortBy(getConvoName).value(),
            other = _(unimportant).slice(maxRecent).filter(filterFn).sortBy(getConvoName).value();

        sessionMaxRecent = maxRecent;

        return {
            important: important,
            recent: recent,
            other: state.filter === '' ? [] : other
        };
    },

    toRosterItem: function (id) {
        var isGroup = _.has(this.state.groupInfo, id);
        return isGroup ? this.toGroupRosterItem(id) : this.toIndividualRosterItem(id);
    },

    toGroupRosterItem: function (id) {
        return <GroupRosterItem
            key={ id }
            current={ this.state.current }
            id={ id }
            name={ this.state.groupInfo[id].name }
            unread={ this.state.unread[id] || 0 }
            filter={ this.state.filter }
            pinned={ this.state.pinned.has(id) }
            selected={ this.state.selectedItemId === id }
        />;
    },

    toIndividualRosterItem: function (id) {
        var presence = _.assign({
            availability: '',
            show: '',
            state: '',
            status: ''
        }, this.state.presence[id]);
        return <IndividualRosterItem
            key={ id }
            current={ this.state.current }
            id={ id }
            name={ this.state.profiles[id].displayName }
            presence={ presence }
            unread={ this.state.unread[id] || 0 }
            filter={ this.state.filter }
            pinned={ this.state.pinned.has(id) }
            selected={ this.state.selectedItemId === id }
        />;
    }
});

module.exports = Roster;
