import Model from './model';

export default (state = Model.Inactive, action = null) => {
  switch (action.type) {
    case 'START':
      return Model.Active(action.seconds);
    case 'TICK':
      return Model.Active(state.seconds - 1);
    case 'STOP':
      return Model.Inactive;
    default:
      return state;
  }
};

