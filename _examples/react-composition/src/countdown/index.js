import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'

import { Countdown } from './components';
import actions from './actions';
import reducer from './reducer';
import sagas from './sagas';

const mapStateToProps = state => ({ state });

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

const Container = connect(mapStateToProps, mapDispatchToProps)(Countdown);

export { actions
       , reducer
       , sagas
       , Container
       };

