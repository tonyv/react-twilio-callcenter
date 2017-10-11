
const taskrouter = (state = {
  isRegistering: false,
  activities: [],
  channels: [],
  reservations: [],
  conference: {sid: "", participants: {customer: ""}},
}, action) => {
  console.log(action.type)
  switch (action.type) {
    case 'CHANNELS_UPDATED':
      return Object.assign({}, state, {
        channels: action.channels
      });
    case 'RESERVATIONS_UPDATED':
      return Object.assign({}, state, {
        reservations: action.reservations
      });
    case 'RESERVATION_CREATED':
      return Object.assign({}, state, {
        reservations: [
          ...state.reservations,
          action.reservation
        ],
        conference: action.reservation.task.attributes.conference
      });
    case 'RESERVATION_ACCEPTED':
      return Object.assign({}, state, {
        conference: action.reservation.task.attributes.conference
      });
    default:
      return state;
  }
}

export default taskrouter;
