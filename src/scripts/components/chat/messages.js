"use strict";

var React = require('react-native'),
    { ScrollView } = React,
    MessageDay = require('./message-day'),
    moment = require('moment'),
    util = require('util'),
    _ = require('lodash');

var Messages = React.createClass({
    propTypes: {
        messages: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        avatars: React.PropTypes.object.isRequired,
        profiles: React.PropTypes.object.isRequired
    },

    render: function () {
        // each group is a list of consecutive messages with the same date
        var groups = [];
        _.forEach(this.props.messages, function (message, index, messages) {
            if (index === 0 || !moment(message.date).isSame(messages[index - 1].date, 'day')) {
                groups.push([]);
            }
            _.last(groups).push(message);
        });
        // map each same-date message group to a MessageDay
        var messageDays = _.map(groups, function (group) {
            return <MessageDay key={ group[0].id }
                               messages={ group }
                               date={ group[0].date }
                               avatars={ this.props.avatars }
                               profiles={ this.props.profiles }
                />;
        }, this);
        return (
            <ScrollView style={{ height: 500 }}>{ messageDays }</ScrollView>
        );
    }
});

module.exports = Messages;
