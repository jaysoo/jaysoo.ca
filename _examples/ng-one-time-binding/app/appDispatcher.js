import Flux from 'npm:flux';


var SERVER_ACTION = 'server';
var VIEW_ACTION = 'view';

class AppDispatcher extends Flux.Dispatcher {
  handleServerEvent(action) {
    var payload = {
      source: SERVER_ACTION,
      action: action
    };
    this.dispatch(payload);
  }

  handleViewAction(action) {
    var payload = {
      source: VIEW_ACTION,
      action: action
    };
    this.dispatch(payload);
  }
}

export default new AppDispatcher();
