'use strict';

require('./util/report-errors');
require('./util/notifications');

var Router = require('react-router'),
    Route = Router.Route,
    DefaultRoute = Router.DefaultRoute,
    RouteHandler = Router.RouteHandler,
    // components
    React = require('react'),
    Debug = require('./components/debug/panel'),
    IdentifyLogin = require('./components/login/identify'),
    AuthenticateLogin = require('./components/login/authenticate'),
    ChatClient = require('./components/chat/loading-wrapper'),
    ConvoEditor = require('./components/chat/convo-editor'),
    FileSearch = require('./components/search/explorer'),
    Profile = require('./components/profile'),
    Settings = require('./components/settings'),
    // utilities
    SettingsStore = require('./stores/settings'),
    i18n = window.i18n = require('./util/i18n'),
    _ = require('lodash');

var App = React.createClass({
    render: function () {
        var shouldShowRawXmpp = SettingsStore.get('debug/showRawXmpp') === 'true';
        return shouldShowRawXmpp ? (
            <div id="app">
                <RouteHandler />
                <Debug />
            </div>
        ) : (
            <div id="app">
                <RouteHandler />
            </div>
        );
    }
});

var routes = (
    <Route name="App" handler={ App } path={ '/' }>
        <Route name="IdentifyLogin" handler={ IdentifyLogin } />
        <Route name="AuthenticateLogin" handler={ AuthenticateLogin } />
        <Route name="Chat" handler={ ChatClient } />
        <Route name="Search" handler={ FileSearch } />
        <Route name="Profile" handler={ Profile } />
        <Route name="Settings" handler={ Settings } />
        <Route name="ConvoCreator" handler={ ConvoEditor } />
        <Route name="ConvoEditor" path="ConvoEditor/:id" handler={ ConvoEditor } />
        <DefaultRoute name="AeroFS" handler={ ChatClient } />
    </Route>
);

Router.run(routes, Router.HashLocation, function (Handler, state) {
    React.render(<Handler />, document.body);
});
