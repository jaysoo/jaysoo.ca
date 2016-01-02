import React from 'react';
import R from 'ramda';
import moment from 'moment';
import Model from './model';

const pad = t => t < 10 ? `0${t}` : `${t}`;

// formatMoment :: Moment -> String
const formatMoment = m => `${pad(m.minutes())}:${pad(m.seconds())}`;

// formatTime :: Number -> String
const formatTime = R.compose(formatMoment, moment.duration);

// getMilliseconds :: Model -> Number
const getMilliseconds = R.compose(R.multiply(1000), R.prop('seconds'));

// getFormattedTime :: Model -> String
const getFormattedTime = R.compose(formatTime, getMilliseconds);

// getStatus :: Model -> String
const getStatus = state =>
  state.cata(
    { Active: () => 'Started'
    , Inactive: () => 'Stopped'
    }
  );

export const Countdown = (
    { start
    , stop
    , state
    }
  ) => (
    <div>
      <p>
        { getFormattedTime(state) } ({ getStatus(state) })
      </p>
      <button onClick={() => start( 25 * 60 )}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );

