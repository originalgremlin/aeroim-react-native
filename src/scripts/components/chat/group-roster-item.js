"use strict";

var React = require('react-native'),
    { Text, View } = React;

var Actions = require('../../actions/chat');

var GroupRosterItem = React.createClass({
    propTypes: {
        current: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired,
        name: React.PropTypes.string.isRequired,
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
    }
});

module.exports = GroupRosterItem;