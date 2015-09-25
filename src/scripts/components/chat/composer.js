'use strict';

var React = require('react-native'),
    { TextInput } = React,
    Actions = require('../../actions/chat'),
    _ = require('lodash');

var Composer = React.createClass({
    propTypes: {
        group: React.PropTypes.bool.isRequired,
        to: React.PropTypes.string.isRequired
    },

    getInitialState: function () {
        return {
            body: ''
        };
    },

    render: function () {
        return (
            <TextInput
                style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                onChangeText={ this.handleChange }
                onSubmitEditing={ this.handleSubmit }
                value={ this.state.body } />
        );
    },

    handleChange: function (body) {
        // TODO: set status to 'composing'
        // TODO: timer to switch status to 'paused' (after 5 seconds), 'away', etc.
        // TODO: state machine!
        this.setState({
            body: body
        });
    },

    handleSubmit: function (evt) {
        var body = this.state.body.trim();
        if (!_.isEmpty(body)) {
            if (this.props.group) {
                Actions.createOutgoingGroupMessage(this.props.to, body);
            } else {
                Actions.createOutgoingMessage(this.props.to, body);
            }
        }
        this.setState(this.getInitialState());
    }
});

module.exports = Composer;
