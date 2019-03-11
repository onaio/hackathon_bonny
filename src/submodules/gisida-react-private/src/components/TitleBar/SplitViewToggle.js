import React from 'react';
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
import { reducerRegistry, createMapReducer, loadLayers } from 'gisida';
import { toggleSplitScreen } from '../../store/actions'

const mapStateToProps = (state, ownProps) => {
  return {
    LAYERS: state.LAYERS.layers,
  }
}

class SplitViewToggle extends React.Component {
  toggleSplitView = (e) => {
    e.preventDefault();
    if (!reducerRegistry.getReducers()['map-2']) {
      reducerRegistry.register('map-2', createMapReducer('map-2'));
      loadLayers('map-2', this.props.dispatch, this.props.LAYERS);
    }
   
    this.props.dispatch(toggleSplitScreen())
  }
  
  render() {
    return (
      <li>
        <a href='#' onClick={this.toggleSplitView}><span className="glyphicon glyphicon-th-large"/></a>
      </li>
    );
  }
}

SplitViewToggle.propTypes = {
};

export default connect(mapStateToProps)(SplitViewToggle);
