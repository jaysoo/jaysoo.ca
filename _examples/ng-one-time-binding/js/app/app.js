// import EventEmitter from '~/events';
import { Dispatcher } from '~/flux/dist/Flux';
import angular from 'angular';

class EventEmitter {
  constructor() {
    this.listeners = [];
  }

  emit(event) {
    this.listeners.forEach((listener) => {
      listener(event);
    });
  }

  addListener(listener) {
    this.listeners.push(listener);
    return this.listeners.length - 1;
  }
};

var m = angular.module('app', []);


// DISPATCHER
m.service('dispatcher', Dispatcher);


// CONTROLLERS

class MessagesCtrl {
  constructor(messageStore) {
    this.store = messageStore;
    this.messages = [];
  }

  resetMessages() {
    this.messages = this.store.getMessages();
  }
}
m.controller('MessagesCtrl', MessagesCtrl);


// STORES

var CHANGE_EVENT = 'CHANGE';

class MessageStore extends EventEmitter {
  emitChange() {
    this.emit(CHANGE_EVENT);
  }

  getMessages() {
  }
}
m.service('messageStore', MessageStore);


// ACTIONS

var RECEIVE_MESSAGES = 'RECEIVE_MESSAGES';

class ServerActionCreators {
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
  }

  receiveAll(messages) {
    dispatcher.handleAction({
      type: RECEIVE_MESSAGES,
      messages: messages
    });
  }
}
m.service('serverActionCreators', ServerActionCreators);


class MessageActionCreators {
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
  }
}
m.service('messageActionCreators', MessageActionCreators)

export { m };
