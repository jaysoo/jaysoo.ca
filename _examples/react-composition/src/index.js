import "babel-polyfill";
import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, createStore } from 'redux';
import sagaMiddleware from 'redux-saga'
import { Provider } from 'react-redux'
import * as Countdown from './countdown';

const createStoreWithMiddleware = applyMiddleware(
  sagaMiddleware(...Countdown.sagas)
)(createStore)

const store = createStoreWithMiddleware(Countdown.reducer);

const Root = () => (
  <Provider store={store}>
    <Countdown.Container/>
  </Provider>
);

ReactDOM.render(<Root/>, document.getElementById('root'));

