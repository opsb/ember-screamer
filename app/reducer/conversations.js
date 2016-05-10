import Immutable from 'npm:immutable';

function updateInMessages(messages, message) {
  let index = messages.findIndex(candidate => candidate.id === message.id);

  if (index !== -1) {
    return messages.update(index, () => message);
  } else {
    return messages.push(message);
  }
}

function joinConversationRequested(state, action) {
  let path = [action.conversationId, 'status'];
  return state.updateIn(path, () => 'requested');
}

function joinConversationSucceeded(state, action) {
  return state.mergeDeep({
    [action.conversationId]: {
      status: 'succeeded',
      messages: action.payload
    }
  });
}

function joinConversationsIndex(state, action) {
  if (!action.payload) return state;

  let conversations = action.payload.reduce((conversations, conversation) => {
    conversations[conversation.id] = conversation;
    return conversations;
  }, {});

  return Immutable.fromJS(conversations);
}

const handlers = {
  joinConversationLobby(state, action) {
    if (!action.payload) return state;

    let conversations = action.payload.reduce((conversations, conversation) => {
      conversations[conversation.id] = conversation;
      return conversations;
    }, {});

    return Immutable.fromJS(conversations);
  },

  addConversation(state, action) {
    return state.mergeDeep({
      [action.payload.id]: Object.assign({status: action.status}, action.payload)
    });
  },

  addMessage(state, action) {
    let path = [action.payload.conversationId, 'messages'];
    let message = Object.assign({status: action.status}, action.payload);

    return state.updateIn(path, messages => updateInMessages(messages, message));
  },

  joinConversation(state, action) {
    if (action.status === 'succeeded') return joinConversationSucceeded(state, action);
    if (action.status === 'requested') return joinConversationRequested(state, action);
  }
}

export default function reduce(state = Immutable.fromJS({}), action) {
  let handler = handlers[action.type.underscore().camelize()];
  return handler ? handler(state, action) : state;
}
