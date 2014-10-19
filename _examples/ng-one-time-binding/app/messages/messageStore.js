import _ from 'npm:lodash';
import EventEmitter from 'npm:events';

import appDispatcher from '../appDispatcher';


var CHANGE_EVENT = 'change';

var _messages = [];

var messageStore = _.extend({
  load(messages) {
    _messages = messages;
  },

  emitChange() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener(cb) {
    this.on(CHANGE_EVENT, cb);
  },

  removeChangeListener(cb) {
    this.off(CHANGE_EVENT, cb);
  },

  getAll() {
    return _messages;
  }
}, EventEmitter.prototype);

messageStore.dispatchToken = appDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {
    case 'RECEIVE_MESSAGES':
      messageStore.load(action.messages);
      messageStore.emitChange();
      break;
    default:
  }
});

export default messageStore;
