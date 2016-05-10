import conversations from './conversations';

export default function reduce(state = {}, action) {
  return {
    conversations: conversations(state.conversations, action)
  };
}
