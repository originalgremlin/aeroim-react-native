"use strict";

module.exports = function (client, stanza) {
    var types = stanza.utils;

    // 1. Create and register our custom `mystanza` stanza type
    var JoinedRooms = stanza.define({
        namespace: 'http://jabber.org/protocol/muc#joinedrooms',
        name: 'joinedrooms',
        element: 'query'
    });

    var JoinedRoom = stanza.define({
        name: '_rosterItem',
        namespace: 'http://jabber.org/protocol/muc#joinedroom',
        element: 'item',
        fields: {
            jid: types.jidAttribute('jid', true),
            name: types.attribute('name')
        }
    });

    stanza.extend(JoinedRooms, JoinedRoom, 'items');

    stanza.withIq(function (Iq) {
        stanza.extend(Iq, JoinedRooms);
    });

    // 2. Add API to the stanza.io client
    client.getJoinedRooms = function (cb) {
        return this.sendIq({
            from: this.jid.bare,
            to: this.jid.bare,
            type: 'get',
            joinedrooms: true
        }, cb);
    };
};
