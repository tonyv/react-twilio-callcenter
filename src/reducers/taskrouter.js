
const taskrouter = (state = {
  isRegistering: false,
  channels: [],
}, action) => {
  console.log(action.type)
  switch (action.type) {
    case 'CHANNELS_UPDATED':
      return Object.assign({}, state, {
        channels: action.channels
      });
    default:
      return state;
  }
}

export default taskrouter;
