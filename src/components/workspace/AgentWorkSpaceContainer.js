import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import AgentWorkSpace from './AgentWorkSpace'


class AgentWorkSpaceContainer extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // When this top level component loads get the worker sid from the URL
    const { dispatch } = this.props
  }

  componentWillUnmount() {
    console.log("UNMOUNTING")
  }

  render() {
    const { channels, reservations, participant } = this.props
    let current = "default"
    if (reservations.length > 0){
      current = reservations[0].task.taskChannelUniqueName
    }
    return (
    	<AgentWorkSpace channels={channels} currInteraction={current} participant={participant}/>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    channels: state.taskrouter.channels,
    reservations: state.taskrouter.reservations,
    participant: state.chat.videoParticipant
  }
}


export default connect(mapStateToProps)(AgentWorkSpaceContainer)
