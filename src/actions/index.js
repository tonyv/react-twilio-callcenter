import fetch from 'isomorphic-fetch'
var config = require('../../twilio.config');

export function workerUpdated(worker) {
  return {
    type: 'WORKER_UPDATED',
    worker: worker
  }
}

function channelsUpdated(channels) {
  return {
    type: 'CHANNELS_UPDATED',
    channels: channels
  }
}

export function dialPadUpdated(number) {
  return {
    type: 'DIAL_PAD_UPDATED',
    number: number
  }
}

function phoneMuted(boolean) {
  return {
    type: 'PHONE_MUTED',
    boolean: boolean
  }
}

function phoneWarning(warning) {
  return {
    type: 'PHONE_WARNING',
    warning: warning
  }
}

export function phoneDeviceUpdated(device) {
  return {
    type: 'PHONE_DEVICE_UPDATED',
    device: device
  }
}

export function phoneConnectionUpdated(conn) {
  return {
    type: "PHONE_CONN_UPDATED",
    connection: conn
  }
}

// export function requestHold(callSid) {
//   return(dispatch, getState) => {
//     return fetch(`/api/calls/hold/${callSid}`)
//       .then(response => response.json())
//       .then( json => {
//         console.log(json)
//       })
//   }
// }

export function phoneHold(confSid, callSid) {
  console.log('fetching phoneHold endpoint')

  return(dispatch, getState) => {
    const { phone } = getState()
    dispatch(callOnHold(!phone.callOnHold))

    return fetch(`/api/calls/conference/${confSid}/hold/${callSid}/${!phone.callOnHold}`,{method: "POST"})
      .then(response => response.json())
      .then( json => {
        console.log(json)
      })
  }
}

export function phoneMute() {
  return (dispatch, getState) => {
    const { phone } = getState()
    console.log("mute clicked")
    console.log("Current call is muted? " + phone.currentCall.isMuted())

    phone.currentCall.mute(!phone.currentCall.isMuted())
  }
}

export function phoneButtonPushed(digit) {
  return (dispatch, getState) => {
    const { phone } = getState()
    console.log("dial pad clicked ", digit)

    phone.currentCall.sendDigits()
  }
}

export function phoneCall() {
  return (dispatch, getState) => {
    const { phone } = getState()
    console.log("call clicked to " + phone.dialPadNumber)
    const agent_call = phone.device.connect({To: phone.dialPadNumber})
    /*
    return fetch(`/api/calls/outbound/dial`,
      {
        method: "POST",
        body: { "to": phone.dialPadNumber}
      })
      .then(response => response.json())
      .then( json => {
        console.log(json)
      })
    */
  }
}

export function phoneDialCustomer(number) {
  return(dispatch, getState) => {
    //return fetch(`/api/calls/confin/${number}`)
    return fetch(`/api/calls/confin`)
      .then(response => response.json())
      .then( json => {
        console.log(json)
      })
  }

}

export function phoneHangup() {
  return (dispatch, getState) => {
    const { phone } = getState()
    phone.currentCall.disconnect()
  }
}

export function chatClientUpdated(client) {
  return {
    type: 'CHAT_CLIENT_UPDATED',
    client: client
  }
}

export function requestChat(identity) {
  return (dispatch, getState) => {
    // TODO: Dispatch action that is registering
    return fetch(`/api/tokens/chat/${identity}/browser`)
      .then(response => response.json())
      .then(json => {
        try {
          let chatClient = new Twilio.Chat.Client(json.token, {logLevel: 'debug'})
          dispatch(chatClientUpdated(chatClient))
        }
        catch (e) {
          console.log(e)
        }
      })
    }
}

function chatUpdateChannel(channel) {
  return {
    type: 'CHAT_UPDATE_CHANNEL',
    channel: channel
  }
}

function videoParticipantConnected(participant) {
  return {
    type: 'VIDEO_PARTICIPANT_CONNECTED',
    participant: participant
  }
}

export function chatNewRequest(task) {
  return (dispatch, getState) => {
    const currState = getState()
    console.log(currState)
    currState.chat.client.getChannelBySid('CH33ec0f0f793c4893a5131deff1080bdf')
      .then(channel => dispatch(chatUpdateChannel(channel)))

  }
}

export function videoRequest(task) {
  return (dispatch, getState) => {
    let worker = task.workerName
    return fetch(`/api/tokens/chat/${worker}/browser`)
      .then(response => response.json())
      .then(json => {
        try {
          let videoClient = new Twilio.Video.connect(json.token, {name:'brian-test'})
            .then(room => {
              console.log(room, "VIDEO CREATED")
              let participant = room.participants.values().next().value
              dispatch(videoParticipantConnected(participant))
              room.on('participantConnected', (participant) => {
                console.log('A remote Participant connected: ', participant)
                //dispatch(videoParticipantConnected(participant))
              })
            })

        }
        catch (e) {
          console.log(e)
        }
      })

  }
}
