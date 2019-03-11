import React from 'react';
import { connect } from 'react-redux'
import { Actions, lngLat } from 'gisida';


const mapStateToProps = (state, ownProps) => {
  return {
    GLOBAL: state,
  }
}

class RefreshToggle extends React.Component {
  onRefreshBtnClick = (e) => {
    e.preventDefault();
    const availableMaps = ['map-1', 'map-2'];
    availableMaps.forEach((m) => {
      const currentMap = this.props.GLOBAL[m];
      if (currentMap) {
        const activeLayerIds = Object.keys(currentMap.layers).filter(l => currentMap.layers[l].visible && !currentMap.layers[l].parent);
        activeLayerIds.forEach((id) => {
          if (currentMap.defaultLayers && currentMap.defaultLayers.length && !currentMap.defaultLayers.includes(id)) {
            this.props.dispatch(Actions.toggleLayer(m, id));
          }
        });
       const { LOC, APP } = this.props.GLOBAL;
       const { center, zoom } = lngLat(LOC, APP);
        window.maps.forEach((e) => {
          e.easeTo({
            center,
            zoom
          });
        });
      }
    });
  }

  render() {
    return (
      <li>
        <a
          href="#"
          onClick={(e) => this.onRefreshBtnClick(e)}
        >
          <span className="glyphicon glyphicon-refresh" />
        </a>
      </li>
    );
  }
}

RefreshToggle.propTypes = {
};

export default connect(mapStateToProps)(RefreshToggle);
