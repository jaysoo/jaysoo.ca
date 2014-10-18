export class EventEmitter {
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
