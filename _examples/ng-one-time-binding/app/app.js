import EventEmitter from 'npm:events';
import angular from 'angular';

import MessagesCtrl from './messages/MessagesCtrl';
import ServerActionCreators from './messages/ServerActionCreators';
import MessageActionCreators from './messages/MessageActionCreators';


var app = angular.module('app', []);

app.controller('MessagesCtrl', MessagesCtrl);

app.service('serverActionCreators', ServerActionCreators);
app.service('messageActionCreators', MessageActionCreators)

app.run(($timeout, serverActionCreators) =>
  $timeout(() =>
    serverActionCreators.receiveAll([{title: 'test'}])
  )
);

export { app };
