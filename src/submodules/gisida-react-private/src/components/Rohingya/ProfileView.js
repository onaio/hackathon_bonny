import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import IndicatorRow from './IndicatorRow';
import { buildLayersObj } from '../utils';

require('./ProfileView.scss');

const mapStateToProps = (state, ownProps) => {
  const MAP = state['map-1'] || { layers: {}, timeseries: {} };
  let timeLayer;
  buildLayersObj(MAP.layers).forEach((layer) => {
    if (layer && layer.visible && layer.aggregate && layer.aggregate.timeseries) {
      timeLayer = layer.id;
    }
  });
  timeLayer = MAP.timeseries[MAP.primaryLayer] ? MAP.primaryLayer : timeLayer;

  return {
    ...state,
    facility: { ...ownProps.parentstate },
    timeseries: state['map-1'].timeseries,
    timeSeriesObj: state['map-1'].timeseries[timeLayer],
  };
}

class ProfileView extends React.Component {
  static educationFacilityDataBuilder(Facility, timeseries) {
    if (!Facility || !timeseries) {
      return null;
    }

    const { UID, layerObj } = Facility;
    const timeSeriesObj = timeseries[layerObj.id];
    if (!timeSeriesObj) {
      return null;
    }
    const facilityData = timeSeriesObj.data.find((d) => {
      if (d.properties && d.geometry) {
        return d.properties['submission/hc_loc'] === UID;
      } else {
        return d['submission/rc_loc'] === UID || d['Union_1'] === UID;
      }
    });

    if (!facilityData) {
      return null;
    }
    
    const parsedData = facilityData.properties
      ? ProfileView.educationIndicatorBuilder(facilityData.properties, layerObj)
      : ProfileView.educationIndicatorBuilder(facilityData, layerObj);

    return parsedData;
  }

  static parseStringVals(data, indicator) {
    let val;
    if (!data[indicator]) {
      return null;
    }
    if (Number.isNaN(Number(data[indicator]))) {
      val = Number(data[indicator].split(',').join(''));
    } else {
      val = Number(data[indicator]);
    }
    return val;
  }

  static educationIndicatorBuilder(data, layerObj) {
    if (!data) {
      return null;
    }

    const indicators = {};
    const { rohingyaIndicators } = layerObj;

    const rcTotals = ProfileView.parseStringVals(data, rohingyaIndicators.rc_total) || 0;
    const rcTotalBoys = data[rohingyaIndicators.rc_boys || rohingyaIndicators.rc_total_boys] || 0;
    const rcTotalGirls = data[rohingyaIndicators.rc_girls || rohingyaIndicators.rc_total_girls] || 0;
    const hcTotals = ProfileView.parseStringVals(data, rohingyaIndicators.hc_total) || 0;
    const hcTotalBoys = data[rohingyaIndicators.hc_boys || rohingyaIndicators.hc_total_boys] || 0;
    const hcTotalGirls = data[rohingyaIndicators.hc_girls || rohingyaIndicators.hc_total_girls] || 0;
    const campTotals = [rcTotals, hcTotals].reduce((a, b) => a + b, 0);
    indicators.camps = {
      type: 'Camps',
      isOpen: true,
      totals: campTotals,
    };
    const caseVar = Array.isArray(layerObj.source.join[1]) ? 'Union' : data[rohingyaIndicators.location_type];
    switch (caseVar) {
      case 'rc': {
        indicators.camps.rc = {
          locationType: "RC camps",
          type: 'rc',
          color: '#2ECC40',
          campLabel: "Refugee Camps (RC)",
          isOpen: true,
          percentage: Math.round(rcTotals / campTotals * 100),
          total: rcTotals,
          boys: {
            color: '#48ae51',
            label: 'Male Children',
            icon: '/assets/img/icon-boy-rc.svg',
            count: rcTotalBoys,
            percent: Math.round(rcTotalBoys / rcTotals * 100)
          },
          girls: {
            color: '#84c686',
            label: 'Female Children',
            icon: '/assets/img/icon-girl-rc.svg',
            count: rcTotalGirls,
            percent: Math.round(rcTotalGirls / rcTotals * 100)
          }
        };
        break;
      }

      case 'hc': {
        indicators.camps.hc = {
          locationType: "HC",
          type: 'hc',
          color: '#FFDC00',
          campLabel: "Host Community (HC)",
          isOpen: true,
          percentage: Math.round(hcTotals / campTotals * 100),
          total: hcTotals,
          boys: {
            color: '#f1b600',
            label: 'Male Children',
            icon: '/assets/img/icon-boy-hc.svg',
            count: hcTotalBoys,
            percent: (hcTotalBoys / hcTotals * 100).toFixed(2)
          },
          girls: {
            color: '#f2cc51',
            label: 'Female Children',
            icon: '/assets/img/icon-girl-hc.svg',
            count: hcTotalGirls,
            percent: (hcTotalGirls / hcTotals * 100).toFixed(2)
          }
        };
        break;
      }

      case 'Union': {
        indicators.camps.rc = {
          locationType: "RC camps",
          type: 'rc',
          color: '#2ECC40',
          campLabel: "Refugee Camps (RC)",
          isOpen: true,
          percentage: Math.round(rcTotals / campTotals * 100),
          total: rcTotals,
          boys: {
            color: '#48ae51',
            label: 'Male Children',
            icon: '/assets/img/icon-boy-rc.svg',
            count: rcTotalBoys,
            percent: Math.round(rcTotalBoys / rcTotals * 100)
          },
          girls: {
            color: '#84c686',
            label: 'Female Children',
            icon: '/assets/img/icon-girl-rc.svg',
            count: rcTotalGirls,
            percent: Math.round(rcTotalGirls / rcTotals * 100)
          }
        };
        indicators.camps.hc = {
          locationType: "HC",
          type: 'hc',
          color: '#FFDC00',
          campLabel: "Host Community (HC)",
          isOpen: true,
          percentage: Math.round(hcTotals / campTotals * 100),
          total: hcTotals,
          boys: {
            color: '#f1b600',
            label: 'Male Children',
            icon: '/assets/img/icon-boy-hc.svg',
            count: hcTotalBoys,
            percent: (hcTotalBoys / hcTotals * 100).toFixed(2)
          },
          girls: {
            color: '#f2cc51',
            label: 'Female Children',
            icon: '/assets/img/icon-girl-hc.svg',
            count: hcTotalGirls,
            percent: (hcTotalGirls / hcTotals * 100).toFixed(2)
          }
        }
        break;
      }
    }
    return indicators;
  }

  constructor(props) {
    super(props);
    const { facility, timeseries } = this.props;
    const { layerObj } = facility;
    if (!layerObj || !layerObj.rohingyaIndicators) {
      return false;
    }

    const facilityData = ProfileView.educationFacilityDataBuilder(facility, timeseries);
    this.state = Object.assign({}, facilityData);

    this.state = {
      facilityData,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { layerObj } = nextProps.facility;

    if (!layerObj || !layerObj.rohingyaIndicators) {
      return false;
    }

    const facilityData = ProfileView.educationFacilityDataBuilder(nextProps.facility, nextProps.timeseries);
    this.setState({
      facilityData,
    });
    return true;
  }

  render() {
    if (!this.state || !this.state.facilityData) {
      return null;
    }


    const indicatorComponents = [];

    Object.keys(this.state.facilityData).map((indicator, i) => {
      indicatorComponents.push((
        <IndicatorRow
          services={this.state.facilityData[indicator]}
          index={i}
          key={i}
        />
      ));
    });

    return (
      <div>
        <div className="profile-indicators">
          <ul>
            { indicatorComponents }
          </ul>
        </div>
      </div>
    );
  }
}

ProfileView.propTypes = {
  facility: PropTypes.objectOf(PropTypes.any).isRequired,
  parentstate: PropTypes.objectOf(PropTypes.any).isRequired,
  parentProps: PropTypes.objectOf(PropTypes.any).isRequired,
  timeseries: PropTypes.objectOf(PropTypes.any).isRequired,
  timeSeriesObj: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default connect(mapStateToProps)(ProfileView);



