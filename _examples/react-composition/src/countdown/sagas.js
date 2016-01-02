import R from 'ramda'
import { call, fork, take, put } from 'redux-saga';
import actions from './actions';
import Model from './model';

const ONE_SECOND = 1000;

// wait :: Number -> Promise
const wait = ms => (
  new Promise(resolve => {
    setTimeout(() => resolve(), ms)
  })
);

// nextTasks :: Model -> [Task]
const nextTasks = (state) =>
  state.cata(
    { Active: (t) => {
        return [
          wait(ONE_SECOND),
          put(actions.tick())
        ];
      }
    , Inactive: () => {
        return [
          put(actions.stop())
        ];
      }
    }
  );

// isStopped :: [Action] => Boolean
const isStopped = R.compose(R.equals('STOP'), R.prop('type'), R.last);

function* countdown(getState) {
  while(yield take('START')) {
    yield wait(ONE_SECOND);

    while(true) {
      const actions = yield nextTasks(getState());
      if (isStopped(actions)) {
        break;
      }
    }
  }
}

export default [countdown];

