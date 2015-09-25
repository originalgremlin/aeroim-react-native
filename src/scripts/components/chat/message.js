"use strict";

var React = require('react-native'),
    { Image, Text, View } = React,
    moment = require('moment'),
    _ = require('lodash');

var Message = React.createClass({
    propTypes: {
        message: React.PropTypes.object.isRequired,
        firstOfMinute: React.PropTypes.bool.isRequired
    },

    shouldComponentUpdate: function (props, state) {
        return this.props.message.id !== props.message.id;
    },

    render: function () {
        var message = this.props.message;
        return (
            <View key={ message.id }>
                <Text>{ moment(message.date).format('LT') }</Text>
                <Text>{ message.body }</Text>
            </View>
        );
    }
});

module.exports = Message;
