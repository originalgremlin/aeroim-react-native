'use strict';

var React = require('react-native'),
    { Text, View } = React,
    Composer = require('./composer'),
    Messages = require('./messages'),
    _ = require('lodash');

var Conversation = React.createClass({
    propTypes: {
        conversationId: React.PropTypes.string.isRequired,
        messages: React.PropTypes.array.isRequired,
        groupInfo: React.PropTypes.object.isRequired,
        profiles: React.PropTypes.object.isRequired,
        avatars: React.PropTypes.object.isRequired
    },

    render: function () {
        return (
            <View>
                <Messages
                    avatars={ this.props.avatars }
                    messages={ this.props.messages }
                    profiles={ this.props.profiles } />
                <Composer
                    group={ this.isGroupConvo() }
                    to={ this.props.conversationId } />
            </View>
        );
    },

    isGroupConvo: function () {
        return _.has(this.props.groupInfo, this.props.conversationId);
    }
});

module.exports = Conversation;
