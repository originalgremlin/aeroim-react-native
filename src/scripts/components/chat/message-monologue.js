"use strict";

var React = require('react-native'),
    { Image, Text, View } = React,
    Message = require('./message'),
    moment = require('moment'),
    _ = require('lodash');

var Monologue = React.createClass({
    propTypes: {
        messages: React.PropTypes.arrayOf(
            React.PropTypes.object.isRequired
        ).isRequired,
        outgoing: React.PropTypes.bool.isRequired,
        avatar: React.PropTypes.string.isRequired,
        displayName: React.PropTypes.string.isRequired
    },

    render: function () {
        var messages = _.map(this.props.messages, function (message, index, messages) {
            var curr = message,
                prev = messages[index - 1],
                firstOfMinute = !(prev && moment(curr.date).isSame(prev.date, 'minute'));
            return <Message key={ message.id } message={ message } firstOfMinute={ firstOfMinute } />;
        });
        return (
            <View>
                <Image source={{ uri: this.props.avatar }} style={{ width: 48, height: 48 }}/>
                <View>
                    <Text>{ this.props.displayName }</Text>
                    <View>{ messages }</View>
                </View>
            </View>
        );
    }
});

module.exports = Monologue;
