import ReduxOptimist from 'npm:redux-optimist';
import uuid from 'npm:node-uuid';

function asOptimistAction(action, optimistId, type) {
  return Object.assign(
    {
      optimist: {
        type: type,
        id: optimistId
      }
    },
    action
  )
}

export function dispatchChannelActions(channels) {
  return store => next => action => {
    if (!action.channel) return next(action);

    let channel = channels.getChannel(action.channel);
    let optimistId = uuid();

    next(asOptimistAction(action, optimistId, ReduxOptimist.BEGIN));

    return new Ember.RSVP.Promise((resolve, reject) => {
      channel.push(
        action.type.dasherize().camelize(),
        action.payload
      )
      .receive('ok', () => {
        next(
          asOptimistAction(action, optimistId, ReduxOptimist.REVERT)
        );
        resolve(action);
      })
      .receive('error', error => {
        next(
          asOptimistAction(action, optimistId, ReduxOptimist.REVERT)
        );
        reject(error);
      });
    });
  };
}
