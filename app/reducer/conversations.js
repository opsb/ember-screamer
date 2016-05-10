import Immutable from 'npm:immutable';

function updateInMessages(messages, message) {
  let index = messages.findIndex(candidate => candidate.id === message.id);

  if (index !== -1) {
    return messages.update(index, () => message);
  } else {
    return messages.push(message);
  }
}

function addMessage(state, conversationId, { topic, id, body, status }) {
  let path = [conversationId, 'messages'];
  let message = { id, body, status };

  return state.updateIn(path, messages => updateInMessages(messages, message));
}

function joinConversationRequested(state, conversationId) {
  let path = [conversationId, 'status'];
  return state.updateIn(path, () => 'requested');
}

function joinConversation(state, conversationId, { topic, payload }) {
  return state.mergeDeep({
    [conversationId]: {
      status: 'succeeded',
      messages: payload
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

function addConversation(state, action) {
  return state.mergeDeep({
    [action.id]: {
      id: action.id,
      name: action.name
    }
  });
}

function isHandled(action) {
  return ['join', 'addConversation', 'addMessage'].indexOf(action.type) !== -1;
}

export default function reduce(state = Immutable.fromJS({}), action) {
  let { type, status, topic } = action;

  if (!isHandled(action)) return state;

  if (topic === 'conversations:index' && type === 'join') return joinConversationsIndex(state, action);
  if (topic === 'conversations:index' && type === 'addConversation') return addConversation(state, action);

  let conversationId = action.topic.split(':')[1];

  if (type === 'addMessage') return addMessage(state, conversationId, action);
  if (type === 'join' && status === 'requested') return joinConversationRequested(state, conversationId);
  if (type === 'join' && status === 'succeeded') return joinConversation(state, conversationId, action);
  return state;
}
