"use strict";

var React = require('react-native'),
    { Text, View } = React;

var Actions = require('../../actions/chat');

var IndividualRosterItem = React.createClass({
    propTypes: {
        current: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired,
        name: React.PropTypes.string.isRequired,
        presence: React.PropTypes.shape({
            availability: React.PropTypes.string.isRequired,
            show: React.PropTypes.string,
            state: React.PropTypes.string
        }).isRequired,
        unread: React.PropTypes.number.isRequired,
        filter: React.PropTypes.string.isRequired,
        selected: React.PropTypes.bool.isRequired,
        pinned: React.PropTypes.bool.isRequired
    },

    render: function () {
        return (
            <Text onPress={ this.handlePress }>{ this.props.name }</Text>
        );
    },

    handlePress: function () {
        Actions.changeConversation(this.props.id);
    },

    getPresenceString: function () {
        // Text description of presence
        var rv;
        if (this.props.presence.availability) {
            if (this.props.presence.show === 'xa' || this.props.presence.show === 'away') {
                rv = i18n.t('Away');
            } else if (this.props.presence.show === 'dnd') {
                rv = i18n.t('Do Not Disturb');
            } else {
                rv = i18n.t('Available');
            }
        } else {
            rv = i18n.t('Offline');
        }
        return rv;
    }
});

module.exports = IndividualRosterItem;
