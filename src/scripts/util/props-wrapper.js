"use strict";

var React = require('react');

var PropsWrapper = function (ReactClass, props) {
    return React.createClass({
        render: function () {
            return <ReactClass { ...props } />
        }
    });
};

module.exports = PropsWrapper;
