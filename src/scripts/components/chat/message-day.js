'use strict';

var React = require('react-native'),
    { Text, View } = React,
    Monologue = require('./message-monologue'),
    moment = require('moment'),
    i18n = require('../../util/i18n'),
    _ = require('lodash');

moment.locale(navigator.language, {
    calendar: {
        lastDay: i18n.t('[Yesterday]'),
        sameDay: i18n.t('[Today]'),
        lastWeek: i18n.t('[Last] dddd'),
        sameElse: 'LL'
    }
});

var MessageDay = React.createClass({
    propTypes: {
        messages: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        date: React.PropTypes.instanceOf(Date).isRequired,
        avatars: React.PropTypes.object.isRequired,
        profiles: React.PropTypes.object.isRequired
    },

    render: function () {
        // each group is a list of consecutive messages with the same sender
        var groups = [];
        _.forEach(this.props.messages, function (message, index, messages) {
            if (index === 0 || message.from !== messages[index - 1].from) {
                groups.push([]);
            }
            _.last(groups).push(message);
        });
        // map each same-sender message group to a Monologue
        var monologues = _.map(groups, function (group) {
            var from = group[0].from;
            return <Monologue key={ group[0].id }
                              messages={ group }
                              displayName={ _.get(this.props.profiles[from], 'displayName', 'Anonymous') }
                              avatar={ this.props.avatars[from] }
                              outgoing= { group[0].outgoing } />;
        }, this);
        return (
            <View>
                <Text>{ moment(this.props.date).calendar() }</Text>
                <View>{ monologues }</View>
            </View>
        );
    }
});

module.exports = MessageDay;
