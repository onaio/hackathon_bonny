import React from 'react';
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
import { Actions } from 'gisida';
import { resetMapView } from '../../store/actions';

const mapStateToProps = (state, ownProps) => {
  return {
    GLOBAL: state,
  }
}

class MapToggle extends React.Component {
  onHomeBtnClick(e) {
    e.preventDefault();
    const currentMap = this.props.GLOBAL['map-2'];
    if (currentMap) {
        const activeLayerIds = Object.keys(currentMap.layers).filter(l => currentMap.layers[l].visible && !currentMap.layers[l].parent);
        activeLayerIds.forEach((id) => {
          if (currentMap.defaultLayers && currentMap.defaultLayers.length && !currentMap.defaultLayers.includes(id)) {
            this.props.dispatch(Actions.toggleLayer('map-2', id));
          }
        });
      }
    this.props.dispatch(resetMapView(false));
  }

  render() {
    return (
      <li>
        <a
          href="#"
          onClick={e => this.onHomeBtnClick(e)}
        >
          <span className="glyphicon glyphicon-home" />
        </a>
      </li>
    );
  }
}

MapToggle.propTypes = {
};

export default connect(mapStateToProps)(MapToggle);
