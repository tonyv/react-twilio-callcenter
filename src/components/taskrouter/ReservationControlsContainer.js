import { connect } from 'react-redux'
import {requestStateChange} from '../../actions'
import SimpleAgentStatusControls from './SimpleAgentStatusControls'


const mapStateToProps = (state) => {
  const { taskrouter } = state
}

const mapDispatchToProps = (dispatch) => {
}


const SimpleAgentStatusControlsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SimpleAgentStatusControls)

export default SimpleAgentStatusControlsContainer
