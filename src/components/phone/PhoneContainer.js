'use strict';

import React from 'react';
import Phone from './phone';
import {phoneMute, phoneHangup, phoneButtonPushed, phoneHold, phoneTransfer, phoneCall, dialPadUpdated} from '../../actions'
import { connect } from 'react-redux'


const mapStateToProps = (state) => {
  const { phone, taskrouter } = state
  let conf = ""
  let caller = ""
  if (taskrouter.conference) {
    conf = taskrouter.conference.sid
    caller = taskrouter.conference.participants.customer
  }
  const reservation = taskrouter.reservations[0]
  console.log(phone.currentCall)
  return {
    status: phone.currentCall._status,
    muted: phone.muted,
    callSid: caller,
    confSid: conf,
    callOnHold: phone.callOnHold,
    reservation: reservation,
    warning: phone.warning
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onMuteClick: () => {
      dispatch(phoneMute())
    },
    onHangupClick: () => {
      dispatch(phoneHangup())
    },
    onHoldClick: (confSid, callSid) => {
      dispatch(phoneHold(confSid, callSid))
    },
    onTransferClick: (confSid) => {
      dispatch(phoneTransfer(confSid))
    },
    onCallClick: () => {
      dispatch(phoneCall())
    },
    onNumberEntryChange: (number) => {
      dispatch(dialPadUpdated(number))
    },
    onKeyPadNumberClick: (key) => {
      dispatch(phoneButtonPushed(key))
    }
  }
}


const PhoneContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Phone)

export default PhoneContainer
