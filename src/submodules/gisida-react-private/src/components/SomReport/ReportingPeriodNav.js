import React from 'react';
import PropTypes from 'prop-types';
import { LineChart } from 'gisida-react';

class ReportingPeriodNav extends React.Component {
  static buildSeries(indicator, profileData) {
    const { rpIndex, services } = profileData;
    const reportingPeriods = profileData.reportingPeriods.reportingPeriods;
    const servicesKeys = [];
    let i; // iterator for reporting periods
    let k; // iterator for service keys
    let sKeys; // array of service keys
    let rp; // map of services per reporting period
    // let rpService; // service item within rp
    const categories = []; // reporting periods

    // loop through all reporting periods and define all services offered throughout
    if (services && reportingPeriods) {
      for (i = 0; i < reportingPeriods.length; i += 1) {
        rp = Object.assign({}, services[reportingPeriods[i]]);
        // add the reporting period to the categories array
        categories.push(reportingPeriods[i].replace(/_/g, ' '));
        sKeys = Object.keys(rp);
    // loop through the reporting period's service keys
        for (k = 0; k < sKeys.length; k += 1) {
          // if a service key doesn't exist in the array, add it
          if (servicesKeys.indexOf(sKeys[k]) === -1) {
            servicesKeys.push(sKeys[k]);
          }
        }
      }
    }

    const seriesDataMap = {};
    let sKey; // string for iterating upon the service keys
    let datum; // object for series data points

    // loop through all reporting periods
    if (reportingPeriods) {
      for (i = 0; i < reportingPeriods.length; i += 1) {
        rp = Object.assign({}, services[reportingPeriods[i]]);

        // loop through all service keys
        for (k = 0; k < servicesKeys.length; k += 1) {
          sKey = servicesKeys[k];
          // if service key isn't on the map, add it
          if (!seriesDataMap[sKey]) {
            seriesDataMap[sKey] = {
              name: `${sKey} ${indicator}`,
              data: [],
            };
          }

          // if this reporting period is missing this service key add null
          if (!rp[sKey]) {
            datum = null;
          // otherwise define the data point using the indicator total
          } else {
            datum = {
              y: Number(rp[sKey][indicator].total),
              marker: { enabled: true },
            };
            // if this reporting period is the active reporting period
            if (i === rpIndex) {
              // style the marker differently
              datum.marker.radius = 7;
            }
          }
          // push null or the data point to the correct seires array
          seriesDataMap[sKey].data.push(datum);
        }
      }
    }

    // return an array of series and an array of categories
    return {
      series: Object.keys(seriesDataMap).map(series => seriesDataMap[series]),
      categories,
    };
  }

  constructor(props) {
    super(props);
    const {
      reportingPeriods,
      rpIndex,
      services,
    } = this.props;

    this.state = {
      reportingPeriods: reportingPeriods.reportingPeriods,
      rpIndex,
      services,
      indicator: 'Admitted',
      seriesData: ReportingPeriodNav.buildSeries('Admitted', this.props),
    };
  }

  componentWillReceiveProps(nextProps) {
    const { reportingPeriods, rpIndex, services } = nextProps;

    this.setState({
      reportingPeriods: reportingPeriods.reportingPeriods,
      rpIndex,
      services,
      seriesData: ReportingPeriodNav.buildSeries(this.state.indicator, nextProps),
    });
  }


  render() {
    const { seriesData, indicator, rpIndex, reportingPeriods } = this.state;
    const rpOptions = reportingPeriods ? reportingPeriods.map((rp, i) => (
      <option value={i} key={i} selected={i === rpIndex} >
        {rp.replace(/_/g, ' ')}
      </option>
    )) : '';

    return (
      <div className="indicators-section-header">
        <span>Reporting Period:</span>
        <i
          className={`rpNav glyphicon glyphicon-triangle-left
            ${rpIndex === 0 ? ' disabled' : ''}`}
          onClick={(e) => { this.props.rpNavClick(e, 'prev'); }}
          role="button"
          tabIndex="-1"
        />
        <select className="rpSelect" onChange={(e) => { this.props.rpNavClick(e); }} role="button">
          {rpOptions}
        </select>
        <i
          className={`rpNav glyphicon glyphicon-triangle-right
            ${reportingPeriods && rpIndex === reportingPeriods.length - 1 ? ' disabled' : ''}`}
          onClick={(e) => { this.props.rpNavClick(e, 'next'); }}
          role="button"
          tabIndex="-1"
        />
        <LineChart
          categories={{ categories: seriesData.categories }}
          series={{ series: seriesData.series }}
          indicator={indicator}
          verticalMark={reportingPeriods[rpIndex] ? reportingPeriods[rpIndex].replace(/_/g, ' ') : ''}
          pointClickCallback={this.props.updateReportingPeriod}
          chartTitle={""}
        />
      </div>
    );
  }
}

ReportingPeriodNav.propTypes = {
  reportingPeriods: PropTypes.objectOf(PropTypes.array).isRequired,
  rpIndex: PropTypes.number.isRequired,
  rpNavClick: PropTypes.func.isRequired,
  services: PropTypes.objectOf(PropTypes.any).isRequired,
  updateReportingPeriod: PropTypes.func.isRequired,
};

export default ReportingPeriodNav;
