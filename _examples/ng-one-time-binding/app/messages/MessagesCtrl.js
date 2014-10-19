import messageStore from './messageStore';


class MessagesCtrl {
  constructor() {
    this.messages = [];

    messageStore.addChangeListener(() => this.resetMessages());
  }

  resetMessages() {
    this.messages = messageStore.getAll();
  }
}

export default MessagesCtrl;
