'use strict';

import React from 'react';
import Phone from './phone';
import {phoneMute, phoneHangup, phoneButtonPushed, phoneTransfer, phoneCall, dialPadUpdated} from '../../actions'
import { connect } from 'react-redux'

const mapStateToProps = (state) => {
  const { phone, taskrouter } = state
  let conf = ""
  let caller = ""
  if (taskrouter.conference) {
    conf = taskrouter.conference.sid
    caller = taskrouter.conference.participants.customer
  }
  console.log(phone.currentCall)
  return {
    status: phone.currentCall._status,
    muted: phone.muted,
    callSid: caller,
    confSid: conf,
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
