import React, { PropTypes } from 'react';
import Button from '../common/Button';

const SimpleAgentStatusControls = ({ available, status, warning }) => (
  <div className="clearfix" >
    <div className="clearfix"> { status } </div>
    <div className="clearfix"> { warning } </div>
  </div>
)

SimpleAgentStatusControls.propTypes = {

}

SimpleAgentStatusControls.defaultProps = {
}


export default SimpleAgentStatusControls;
