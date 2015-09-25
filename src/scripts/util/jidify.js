'use strict';

var i18n = window.i18n = require('./i18n');

var JIDify = {
  to: function(id) {
    if (id && id.indexOf('@') !== -1) {
      console.warn('Are you sure you want to use JIDify.to? Received: ', id);
    }
    if (id && id.toString) {
      return id.toString() + '@muc.aeroim';
    } else {
      console.warn('JIDify did not receive a valid ID. Received: ', id);
      return '';
    }
  },
  from: function(jid) {
    if (jid && jid.indexOf('@') === -1) {
      console.warn('Are you sure you want to use JIDify.from? Received: ', jid);
    }
    if (jid && jid.split) {
      return jid.split('@')[0];
    } else {
      console.warn('JIDify did not receive a valid JID. Received: ', jid);
      return i18n.t('anonymous');
    }
  }
};

module.exports = JIDify;
