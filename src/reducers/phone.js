const phone = (state = {
  currentCall: false,
  device: {},
  muted: false,
  callOnHold: false,
  warning: "",
  isRegistered: false,
  dialPadNumber: "",
}, action) => {
  console.log(action.type)
  switch (action.type) {
    case 'REGISTER_PHONE':
      return Object.assign({}, state, {
        isRegistered: false
      });
    case 'PHONE_DEVICE_UPDATED':
      return Object.assign({}, state, {
        isRegistered: true,
        device: action.device
      });
    case 'DIAL_PAD_UPDATED':
      return Object.assign({}, state, {
        dialPadNumber: action.number
      });
    case 'PHONE_CONN_UPDATED':
      return Object.assign({}, state, {
        currentCall: action.connection || false
      });
    case 'PHONE_MUTED':
      return Object.assign({}, state, {
        muted: action.boolean
      });
    case 'CALL_ON_HOLD':
      console.log('action.boolean ->', action.boolean)
      return Object.assign({}, state, {
        callOnHold: action.boolean
      });
    case 'PHONE_WARNING':
      return Object.assign({}, state, {
        warning: action.warning
      });
    default:
      return state;
  }
}

export default phone;
