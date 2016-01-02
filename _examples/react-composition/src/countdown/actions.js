export default { start: (seconds) => ({ type: 'START', seconds })
               , tick: () => ({ type: 'TICK' })
               , stop: () => ({ type: 'STOP' })
               };

