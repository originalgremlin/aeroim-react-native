'use strict';

var Dispatcher = require('../dispatcher'),
    Constants = require('../constants'),
    Actions = Constants.Actions,
    Promise = require('promise'),
    SettingsStore = require('../stores/settings'),
    XMPP = require('stanza.io'),
    util = require('util'),
    uuid = require('uuid'),
    moment = require('moment'),
    _ = require('lodash');

// custom xmpp plugins
var plugins = {
    joinedRooms: require('../components/chat/plugins/joined-rooms'),
    pinnedConversations: require('../components/chat/plugins/pinned-conversations'),
    viewedConversations: require('../components/chat/plugins/viewed-conversations')
};

var client = null,
    delayedExecutions = [];

//--- XMPP client connection ---//
var createClient = function (credentials) {
    var client = XMPP.createClient(_.startsWith(credentials.server, 'ws') ?
        {
            jid: credentials.jid,
            password: credentials.password,
            transports: ['websocket'],
            websocketURL: credentials.server,
            useStreamManagement: true,
            timeout: Constants.Properties.XMPP_TIMEOUT
        } :
        {
            jid: credentials.jid,
            password: credentials.password,
            transports: ['bosh'],
            boshURL: credentials.server,
            useStreamManagement: true,
            timeout: Constants.Properties.XMPP_TIMEOUT
        }
    );

    // plugins
    _.forEach(plugins, client.use.bind(client));

    // events
    _.forEach({
        '*': function (star, event, obj) {
            console.log(arguments);
            var isOff = SettingsStore.get('debug/showRawXmpp') !== 'true',
                isStanza = _.get(obj, 'constructor.name') === 'Stanza',
                isRaw = event === 'raw:outgoing';
            if (isOff) {
                return;
            } else if (isStanza) {
                Dispatcher.dispatch({
                    type: Constants.Actions.RECEIVE_DEBUG_STANZA,
                    stanza: obj.toString()
                });
            } else if (isRaw) {
                var parsed = client.stanzas.parse(obj),
                    stanza = _.first(parsed.xml.children);
                if (stanza) {
                    Dispatcher.dispatch({
                        type: Constants.Actions.RECEIVE_DEBUG_STANZA,
                        stanza: stanza.toString()
                    });
                }
            }
        },

        'chat': function (event, message) {
            Dispatcher.dispatch({
                type:  Actions.CREATE_INCOMING_MESSAGE,
                id: message.id,
                from: message.from.bare,
                to: message.to.bare,
                body: message.body,
                date: new Date(),
                individual: true,
                group: false,
                incoming: true,
                outgoing: false
            });
        },

        'chat:state': function (event, state) {
            Dispatcher.dispatch({
                type: Actions.UPDATE_PRESENCE,
                id: state.from.bare,
                state: state.chatState
            });
        },

        'groupchat': function (event, message) {
            var resource = message.from.resource,
                from = _.endsWith(resource, '@aeroim') ? resource : resource + '@aeroim';
            Dispatcher.dispatch({
                type:  Actions.CREATE_GROUP_MESSAGE,
                id: message.id || util.format('aeroim-%s', uuid.v4()),
                from: from,
                to: message.from.bare,
                body: message.body,
                date: _.get(message, "delay.stamp", new Date()),
                individual: false,
                group: true,
                incoming: true,
                outgoing: false
            });
        },

        'mam:result:*': function (event, id, results) {
            Dispatcher.dispatch({
                type: Actions.LOAD_ARCHIVED_MESSAGES,
                messages: _.map(results.mamResult.items, function (m) {
                    return {
                        id: m.forwarded.message.id,
                        from: m.forwarded.message.from.bare,
                        to: m.forwarded.message.to.bare,
                        body: m.forwarded.message.body,
                        date: m.forwarded.delay.stamp,
                        individual: true,
                        group: false,
                        incoming: client.jid.bare === m.forwarded.message.to.bare,
                        outgoing: client.jid.bare === m.forwarded.message.from.bare
                    }
                })
            });
        },

        'muc:load': function (event, items) {
            // join group chat rooms
            items = items || [];
            items.forEach(function (item) {
                item.id = item.jid.bare;
                client.joinRoom(item.id, Chat.getId());
                Chat.getRoomInfo(item.id);
                Chat.getRoomMembers(item.id);
            });
            // add jids to the store
            Dispatcher.dispatch({
                type: Actions.LOAD_JOINED_ROOMS,
                rooms: items
            });
        },

        'muc:public:load': function (event, rooms) {
            _.forEach(rooms, function (room) {
                room.id = room.jid.bare;
                room.name = room.jid.local;
                Chat.getRoomInfo(room.id);
            });
            Dispatcher.dispatch({
                type: Actions.LOAD_PUBLIC_ROOMS,
                rooms: rooms
            });
        },

        'muc:invite': function (event, item) {
            client.joinRoom(item.room.bare, Chat.getId());
            Dispatcher.dispatch({
                type: Actions.LOAD_JOINED_ROOMS,
                rooms: [{
                    id: item.room.bare,
                    name: item.room.local,
                    type: 'group'
                }]
            });
        },

        'muc:unavailable': function (event, response) {
            if (response.muc.affiliation === 'none') {
                Dispatcher.dispatch({
                    type: Actions.LEAVE_ROOM,
                    room: response.from.bare
                });
            }
        },

        'presence': function (event, state) {
            Dispatcher.dispatch({
                type: Actions.UPDATE_PRESENCE,
                id: state.from.bare,
                availability: state.type,
                show: state.show,
                status: state.status
            });
        },

        'pubsub:event': function (event, message) {
            // ignore node purge, deletion, etc.
            if (!message.event.updated) {
                return;
            }
            var type = message.event.updated.node,
                data = message.event.updated.published;
            switch (type) {
                case 'announcement':
                    Dispatcher.dispatch({
                        type: Actions.ANNOUNCEMENT,
                        date: new Date(),
                        message: message
                    });
                    break;
                case 'update-profile':
                    Chat.getProfile(data[0].json.id);
                    break;
                default:
                    break;
            }
        },

        'roster:load': function (event, items) {
            items = items || [];
            items.forEach(function (item) {
                item.id = item.jid.bare;
                // download profiles
                Chat.getProfile(item.id);
            });
            // add jids to the store
            Dispatcher.dispatch({
                type: Actions.LOAD_ROSTER,
                roster: items
            });
        },

        'session:started': function () {
            var me = this.jid.bare,
                execution;
            client.isSessionStarted = true;
            // client
            this.enableCarbons();
            this.updateCaps();
            // preloaded methods
            while (execution = delayedExecutions.shift()) {
                execution();
            }
            // pubsub
            Chat.subscribeToPubSubNode('update-profile');
            Chat.subscribeToPubSubNode('announcement');
            // me
            this.sendPresence({ caps: this.disco.caps });
            Chat.getProfile(me);
            // individual roster
            this.getRoster(function (err, res) {
                if (err) {
                    console.error(err);
                } else {
                    client.emit('roster:load', res.roster.items);
                }
            });
            // group roster
            this.getJoinedRooms(function (err, res) {
                if (err) {
                    console.error(err);
                } else {
                    client.emit('muc:load', res.joinedrooms.items);
                }
            });
            // publicly available rooms
            client.getDiscoItems('muc.aeroim', null, function (err, res) {
                if (err) {
                    console.error('error getting public rooms:', err);
                } else {
                    client.emit('muc:public:load', res.discoItems.items);
                }
            });
            // pinned conversations
            client.getPinnedConversations()
                .then(function (res) {
                    var pinned = _.get(res, 'privateStorage.pinned.conversations', []);
                    _.forEach(pinned, function (convo) { convo.id = convo.jid.bare; });
                    Dispatcher.dispatch({
                        type: Actions.LOAD_PINNED_CONVERSATIONS,
                        pinned: pinned
                    });
                })
                .catch(function (err) {
                    console.error(err);
                });
            // message archive
            client.searchHistory({ with: client.jid.bare });
            // last viewed times
            client.getViewedConversations().then(function (res) {
                var lastViewed = _.map(res.privateStorage.viewed.conversations, function (convo) {
                    return _.extend(convo, {id: convo.jid.bare});
                });
                Dispatcher.dispatch({
                    type: Actions.LOAD_LAST_VIEWED_TIMES,
                    lastViewed: lastViewed
                });
            }).catch(console.error.bind(console));
        },

        'session:end': function () {
            client.isSessionStarted = false;
        },

        'stream:error': function () {
            Chat.disconnect();
            Chat.connect();
        }
    }, function (callback, event) {
        client.on(event, callback.bind(client, event));
    });

    return client;
};

//--- publicly accessible actions ---//
var Chat = {
    getId: function () {
        return client.jid.bare;
    },

    connect: _.debounce(
        function (credentials) {
            credentials = credentials || SettingsStore.getCredentials();
            var shouldConnect =
                _.isNull(client) ||
                credentials.jid !== _.get(client, 'config.jid.bare') ||
                credentials.password !== _.get(client, 'config.credentials.password');
            if (shouldConnect) {
                client = createClient(credentials);
                client.enableKeepAlive();
                client.connect();

                // TODO: debug statements.  delete when ready.
                window.client = client;
                window.Chat = Chat;
                // END DEBUG
            }
            return client;
        },
        Constants.Properties.XMPP_TIMEOUT * 1000
    ),

    disconnect: function () {
        if (!_.isNull(client)) {
            client.disconnect();
            window.client = client = null;
        }
    },

    isSessionStarted: function () {
        return client && client.isSessionStarted;
    },

    executeOnConnect: function (func, args) {
        var execution = _.bind(func, this, args);
        if (this.isSessionStarted()) {
            execution();
        } else {
            delayedExecutions.push(execution);
        }
    },

    createOutgoingMessage: function (to, body) {
        var message = {
            type:  Actions.CREATE_OUTGOING_MESSAGE,
            id: util.format('aeroim-%s', uuid.v4()),
            from: client.jid.bare,
            to: to,
            body: body,
            date: new Date(),
            individual: true,
            group: false,
            incoming: false,
            outgoing: true
        };
        Dispatcher.dispatch(message);
        return client.sendMessage({
            type: 'chat',
            id: message.id,
            from: message.from,
            to: message.to,
            body: message.body,
            requestReceipt: true
        });
    },

    createOutgoingGroupMessage: function (to, body) {
        return client.sendMessage({
            type: 'groupchat',
            id: util.format('aeroim-%s', uuid.v4()),
            to: to,
            body: body,
            requestReceipt: false
        });
    },

    editGroup: function (id, name, isPublic, oldMemberJids, newMemberJids) {
        var roomJid = new XMPP.JID(id),
            IDsToAdd = _.difference(newMemberJids, oldMemberJids),
            peopleToAdd = _.map(IDsToAdd, function (jid) {
                return { to: jid };
            }),
            IDsToRemove = _.difference(oldMemberJids, newMemberJids);

        return Promise.all(_.flatten([
            // set isPublic
            client.configureRoom(roomJid, {
                fields: [
                    { name: 'FORM_TYPE',
                      value: 'http://jabber.org/protocol/muc#roomconfig' },
                    { name: 'muc#roomconfig_publicroom', value: isPublic }
                ]
            }),
            // add new members
            client.invite(roomJid, peopleToAdd),
            // remove unwanted members
            _.map(IDsToRemove, function (member) {
                return client.setRoomAffiliation(roomJid, member, 'none', '');
            })
        ])).then(function () {
            Dispatcher.dispatch({
                type: Actions.ROOM_EDITED,
                id: id,
                membersAdded: IDsToAdd,
                membersRemoved: IDsToRemove,
                isPublic: isPublic,
                name: name
            });
        }).catch(
          console.error.bind(console)
      );
    },

    createGroup: function (name, isPublic, memberJids) {
        var roomJid = new XMPP.JID(util.format('%s@muc.aeroim', _.kebabCase(name))),
            members = memberJids.map(function (jid) { return { to: jid }; });
        // create
        client.joinRoom(roomJid.bare, Chat.getId());
        // configure
        return client.configureRoom(roomJid, {
            fields: [
                { name: 'FORM_TYPE', value: 'http://jabber.org/protocol/muc#roomconfig' },
                { name: 'muc#roomconfig_membersonly', value: true },
                { name: 'muc#roomconfig_persistentroom', value: true },
                { name: 'muc#roomconfig_publicroom', value: isPublic }
            ]
        }).then(function (res) {
            // add members
            client.invite(roomJid, members);
            var everyone = _.map(memberJids, function (jid) {
                return {
                    id: jid,
                    affiliation: 'member'
                };
            });
            // add me
            everyone.push({
                id: Chat.getId(),
                affiliation: 'owner'
            });
            Dispatcher.dispatch({
                type: Actions.LOAD_JOINED_ROOMS,
                rooms: [{
                    id: roomJid.bare,
                    name: roomJid.local,
                    jid: roomJid,
                    type: 'group',
                    creationDate: moment(),
                    members: everyone,
                    isPublic: isPublic
                }]
            });
            return roomJid.bare;
        });
    },

    changeConversation: function (id) {
        Dispatcher.dispatch({
            type: Actions.CHANGE_CONVERSATION,
            id: id
        });
    },

    pinConversation: function (id) {
        client.pinConversation(id)
            .then(function (res) {
                Dispatcher.dispatch({
                    type: Actions.PIN_CONVERSATION,
                    id: res.id
                });
            })
            .catch(function (err) {
                console.error(err);
            });
    },

    unpinConversation: function (id) {
        client.unpinConversation(id)
            .then(function (res) {
                Dispatcher.dispatch({
                    type: Actions.UNPIN_CONVERSATION,
                    id: res.id
                });
            })
            .catch(function (err) {
                console.error(err);
            });
    },

    getRoomInfo: function (room) {
        client.getDiscoInfo(room, '').then(function (response) {
            var fields = response.discoInfo.form.fields,
                features = response.discoInfo.features,
                description = _.get(_.findWhere(fields, {name: 'muc#roominfo_description'}), 'value'),
                isPublic = _.contains(features, 'muc_public'),
                rawDate = _.get(_.findWhere(fields, {name: 'x-muc#roominfo_creationdate'}), 'value'),
                momentDate = moment(rawDate, 'YYYYMMDDTHH:mm:ss');
            Dispatcher.dispatch({
                type: Actions.LOAD_ROOM_CONFIGURATION,
                id: room,
                info: {
                    description: description,
                    creationDate: momentDate,
                    isPublic: isPublic
                }
            });
        }).catch(function (err) {
            switch (err.error.condition) {
                case 'timeout':
                    console.warn(util.format('Timeout...retrying room %s.', room));
                    Chat.getRoomInfo(room);
                    break;
                default:
                    console.warn('Failed to get room info.', err);
                    break;
            }
        });
    },

    getRoomMembers: function (room) {
        Promise.all([
            client.getRoomMembers(room, { affiliation: 'owner' }),
            client.getRoomMembers(room, { affiliation: 'admin' }),
            client.getRoomMembers(room, { affiliation: 'member' })
        ]).then(function (response) {
            var owners = _.get(response[0], 'mucAdmin.items', []),
                admins = _.get(response[1], 'mucAdmin.items', []),
                members = _.get(response[2], 'mucAdmin.items', []),
                everyone = _.union(owners, admins, members);
            _.forEach(everyone, function (member) {
                member.id = member.jid.bare;
            });
            Dispatcher.dispatch({
                type: Actions.LOAD_ROOM_MEMBERS,
                id: room,
                members: everyone
            });
        }).catch(console.error.bind(console));
    },

    getProfile: function (id) {
        return client.getVCard(id).then(function (res) {
            if (_.has(res.vCardTemp, 'name')) {
                Dispatcher.dispatch({
                    type: Actions.LOAD_PROFILE,
                    id: id,
                    profile: res.vCardTemp
                });
            } else {
                console.warn('vcard for', id, 'has no name:', res);
                Dispatcher.dispatch({
                    type: Actions.DELETE_PROFILE,
                    id: id
                })
            }
        }).catch(function (err) {
            switch (_.get(err, 'error.condition')) {
                case 'timeout':
                    console.warn(util.format('Timeout...retrying profile for user %s.', id));
                    Chat.getProfile(id);
                    break;
                default:
                    console.warn('Failed to get profile.', err);
                    break;
            }
        });
    },

    isValidXML: function (xml) {
        try {
            return _.get(client.stanzas.parse(xml), 'constructor.name') === 'Stanza';
        } catch (e) {
            return false;
        }
    },

    sendRawXML: function (xml) {
        if (this.isValidXML(xml)) {
            client.send(client.stanzas.parse(xml));
        }
    },

    updatePresence: function (presence) {
        return client.sendPresence({
            show: presence.show,
            status: presence.status,
            type: presence.availability
        });
    },

    updateProfile: function (vcard) {
        var id = Chat.getId();
        return client.getVCard(id)
            // patch the existing profile
            // (publishVCard overwrites the whole thing, hence the getVCard/publishVCard dance)
            .then(function (res) {
                var updatedVCard = _.assign({}, res.vCardTemp, vcard);
                return client.publishVCard(updatedVCard);
            })
            // notify our friends of the profile changes via pubsub
            .then(function (res) {
                Chat.getProfile(id);
                return client.publish('pubsub.aeroim', 'update-profile', { json: { id: id } });
            })
            // handle errors
            .catch(function (err) {
                console.error(err);
            });
    },

    updateState: function (state, to) {
        return client.sendMessage({
            chatState: state,
            to: to,
            type: 'chat'
        });
    },

    joinRoom: function (id) {
        // FIXME: client.joinRoom doesn't have a callback arg. What if this fails or is very slow?
        client.joinRoom(id, Chat.getId());
        Dispatcher.dispatch({
            type: Actions.JOIN_ROOM,
            id: id
        });
    },

    registerWithRoom: function (id) {
        client.updateAccount(id, {
            form: {
                fields: [
                    { name: 'FORM_TYPE', value: 'http://jabber.org/protocol/muc#register' },
                    { name: 'muc#register_first', value: '' },
                    { name: 'muc#register_last', value: '' },
                    { name: 'muc#register_roomnick', value: '' }
                ]
            }
        }).then(function (res) {
            Chat.joinRoom(id);
            Chat.getRoomInfo(id);
            Chat.getRoomMembers(id);
        }).catch(function (err) {
            console.error(err);
        });
    },

    updateLastViewed: function (id) {
        return client.viewConversation(id);
    },

    subscribeToPubSubNode: function (node) {
    	// FIXME(JG) there is a race condition if the first two users get a 404
        // and both try to create the node
        return client.getItem('pubsub.aeroim', node)
            .catch((err) => {
                if (_.get(err, 'error.code') === "404") {
                    console.log('creating pubsub node', node);
                    return client.createNode('pubsub.aeroim', node, {
                        type: 'submit',
                        fields: [
                            {name: 'FORM_TYPE', value: 'http://jabber.org/protocol/pubsub#node_config'},
                            {name: 'pubsub#publish_model', value: 'open'}
                        ]
                    });
                } else {
                    return err;
                }
            })
            .then(() => {
                console.log('subscribing to pubsub node', node);
                return client.subscribeToNode('pubsub.aeroim', node);
            })
            .catch(console.error.bind(console));
    }
};

module.exports = Chat;
