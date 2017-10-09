import NumberEntry from './NumberEntry';
import KeyPad from './KeyPad';
import CallControl from './CallControl';

import React, { PropTypes } from 'react';

const Phone = ({status, onMuteClick, onKeyPadNumberClick, onNumberEntryChange, onHangupClick, onCallClick, onTransferClick, onExternalTransferClick, onHoldClick, muted, callOnHold, callSid, confSid, reservation}) => (
  <div id="dialer">
    <NumberEntry entry={onNumberEntryChange} />
    <KeyPad buttonPress={onKeyPadNumberClick} />
    <CallControl call={onCallClick} status={status} hangup={onHangupClick} muted={ muted } mute={ onMuteClick } transfer={ onTransferClick } externalTransfer={ onExternalTransferClick } callOnHold={ callOnHold } hold={ onHoldClick } callSid={callSid} confSid={confSid} reservation={reservation}/>
  </div>
)

Phone.propTypes = {

}

export default Phone;
