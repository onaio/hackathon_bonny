import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import IndicatorRow from './IndicatorRow';

require('./ProfileView.scss');

const mapStateToProps = (state, ownProps) => {
  return {
    ...state,
    facility: { ...ownProps.parentstate },
  };
}

class ProfileView extends React.Component {
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

  static indicatorBuilder(data, layerObj) {
    if (!data) {
      return null;
    }

    const indicators = {};
    const { lotfaIndicators } = layerObj;
    const dataSchema = {};
    let indicator;
    let subIndicator;
    let ssIndicator;
    Object.keys(lotfaIndicators).forEach(i => {
      indicator = lotfaIndicators[i];
      if (!dataSchema[i]) {
        if (typeof indicator !== 'string') {
          dataSchema[i] = {};
        } else {
          dataSchema[i] = data[indicator];
        }
      }
      Object.keys(indicator).forEach(s => {
        subIndicator = indicator[s];
        if (!dataSchema[i][s]) {
          if (typeof subIndicator !== 'string') {
            dataSchema[i][s] = {};
            Object.keys(subIndicator).forEach(ss => {
              ssIndicator = subIndicator[ss];
              if (!dataSchema[i][s][ss]) {
                dataSchema[i][s][ss] = data[ssIndicator];
              }
            });
          } else {
            dataSchema[i][s] = data[subIndicator]
          }
        }
      });
    });

    const schemaKeys = Object.keys(dataSchema);
    let indicatorKey;
    let indicatorsSchema = {};
    let subIndicatorTotals;
    const chartTypes = ['pie', 'column'];
    for (let x = 0; x < schemaKeys.length; x += 1) {
      indicatorKey = schemaKeys[x];
      indicator = dataSchema[indicatorKey];
      indicators[indicatorKey] = {
        type: indicatorKey,
        isOpen: true,
        totals: 0,
        chartType: chartTypes[x],
        UID: data[layerObj.source.join[1]]
      };
        let vehicleVal;
        indicatorsSchema = {};
        subIndicatorTotals = Object.values(indicator).reduce((a, b) => a + Number(b), 0);
        Object.keys(indicator).forEach(i => {
          vehicleVal = indicator[i] === '' ? undefined : (
            Number.isNaN(Number(indicator[i])) ? indicator[i] : Number(indicator[i])
          );
          if (!indicatorsSchema[i]) {
            indicatorsSchema[i] = {
              count: vehicleVal,
              label: i,
              color: indicator.color || '#0000ff',
              percent: Math.round((Number(vehicleVal) / subIndicatorTotals) * 100)
            };
          }
        });
        indicators[indicatorKey] = {
          ...indicators[indicatorKey],
          ...indicatorsSchema,
        };
    }
    return indicators;
  }

  static indicatorDataBuilder(facility) {
    if (!facility) {
      return null
    }

    const { UID, layerObj } = facility;
    const facilityData = layerObj.source.data.features.find(d => d.properties[layerObj.source.join[1]] === UID);

    if (!facilityData) {
      return null;
    }

    let parsedData;
    if (facilityData) {
      parsedData = ProfileView.indicatorBuilder(facilityData.properties, layerObj);
    }
    return parsedData;
  }

  constructor(props) {
    super(props);
    const { facility } = this.props;
    const { layerObj } = facility;
    if (!layerObj || !layerObj.lotfaIndicators) {
      return false;
    }

    const facilityData = ProfileView.indicatorDataBuilder(facility);
    this.state = Object.assign({}, facilityData);

    this.state = {
      facilityData,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { layerObj } = nextProps.facility;

    const facilityData = ProfileView.indicatorDataBuilder(nextProps.facility);
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



