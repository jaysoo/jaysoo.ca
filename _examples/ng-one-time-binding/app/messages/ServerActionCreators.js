import appDispatcher from '../appDispatcher';


var RECEIVE_MESSAGES = 'RECEIVE_MESSAGES';

class ServerActionCreators {
  receiveAll(messages) {
    appDispatcher.handleServerEvent({
      type: RECEIVE_MESSAGES,
      messages: messages
    });
  }
}

export default ServerActionCreators;
