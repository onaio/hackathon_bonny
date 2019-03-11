import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import IndicatorRow from './IndicatorRow';
import ReportingPeriodNav from './ReportingPeriodNav';

require('./ProfileView.scss');

const mapStateToProps = (state, ownProps) => {
  return {
    ...state,
    facility: { ...ownProps.parentstate }
  };
}

class ProfileView extends React.Component {
  static dynamicFacilityDataBuilder(Facility) {
    const { properties, UID, title, lat, long, layer, feature, layerObj } = Facility;
    const Reports = JSON.parse(properties.reports);

    // Scrub report field names for new group prefixes
    const reports = [];
    let report;
    let reportKeys;
    let newReportKey;
    for (let r = 0; r < Reports.length; r += 1) {
      report = {};
      reportKeys = Object.keys(Reports[r]);
      for (let k = 0; k < reportKeys.length; k += 1) {
        if (Reports[r][reportKeys[k]] !== null && reportKeys[k].indexOf('/') === -1) {
          report[reportKeys[k]] = Reports[r][reportKeys[k]];
        } else if (Reports[r][reportKeys[k]] !== null) {
          newReportKey = reportKeys[k].split('/').pop();
          report[newReportKey] = Reports[r][reportKeys[k]];
        }
      }
      reports.push({ ...report });
    }

    // Sort reports by date
    if (reports.length) {
      reports.sort((A, B) => {
        const a = A.reporting_period.replace(/_/g, ' ').replace('W1 W2', '01').replace('W3 W4', '02');
        const b = B.reporting_period.replace(/_/g, ' ').replace('W1 W2', '01').replace('W3 W4', '02');
        return Date.parse(new Date(a)) - Date.parse(new Date(b));
      });
    }

    let rp;
    const metrics = {
      rpIndex: 0, // pointer for which reporting period is active
      reportingPeriods: [], // list of reporting periods
      services: {}, // map of service/indicator data by reporting period
    };

    if (layerObj.id === 'nutrition-sites-live') {
      // BUILD NITRITION SITE METRIC SCHEMA
      // look at properties.reports array
      reports.forEach((report) => {
        rp = report.reporting_period;
        if (rp) {
          metrics.reportingPeriods.push(rp);
          if (!metrics.services[rp]) {
            metrics.services[rp] = ProfileView.newIndicatorBuilder(report);
          }
        }
      });
    }

    // parse feature properties
    // const parsedProps = ProfileView.parseFeatureData(properties, layerObj);

    const facilityData = {
      UID,
      siteName: Facility.siteName,
      title: title || Facility.siteName,
      layerObj,
      feature,
      properties,
      metrics,
    };
    return facilityData;
  }

  static newIndicatorBuilder(Report) {
    if (!Report) {
      return false;
    }

    const report = { ...Report };
    const indicators = {};
    const serviceTotalReducer = (a, b) => {
      if (b) {
        return a + Number(b);
      }
      return a + 0;
    };

    if (!report.site_activity) {
      report.site_activity = [
        report['site_activity1'],
        report['site_activity2'],
        report['site_activity3'],
        report['site_activity4'],
        report['site_activity5'],
        report['site_activity6'],
        report['site_activity7'],
      ].filter(a => typeof a !== 'undefined' && a !== null);
      if (!report.site_activity.length) {
        return null;
      }
    } else if (typeof report.site_activity === 'string') {
      report.site_activity = report.site_activity.split(', ');
    }
    // report.site_activity = report.site_activity.filter(a => typeof a !== 'undefined');
    for (let r = 0; r < report.site_activity.length; r += 1) {
      switch (report.site_activity[r]) {
        case 'OTP': {
          const optTotalArray = [
            report.calculation_NU102a,
            report.calculation_NU103a,
            report.calculation_NU109a,
            report.calculation_NU104a,
          ];
          const otpTotal = optTotalArray.reduce(serviceTotalReducer, 0);
          indicators.OTP = {
            type: 'OTP',
            isOpen: false,
            totals: otpTotal,
            Admitted: {
              color: '#2ECC40',
              isOpen: false,
              total: Number(report.calculation_NU101a),
              boys: {
                label: 'Male Children',
                icon: '/assets/img/icon-boy-recovered.svg',
                count: Number(report.boys_NU101a_calculate),
                percent:
                  Math.round(report.boys_NU101a_calculate / report.calculation_NU101a * 100),
              },
              girls: {
                label: 'Female Children',
                icon: '/assets/img/icon-girl-recovered.svg',
                count: Number(report.girls_NU101a_calculate),
                percent:
                  Math.round(report.girls_NU101a_calculate / report.calculation_NU101a * 100),
              },
            },
            Recovered: {
              color: '#2ECC40',
              isOpen: true,
              total: Number(report.calculation_NU102a),
              percentage: (Math.round(parseInt(report.calculation_NU102a, 10) / otpTotal * 100)),
              boys: {
                color: '#48ae51',
                label: 'Male Children',
                icon: '/assets/img/icon-boy-recovered.svg',
                count: Number(report.boys_NU102a_calculate),
                percent:
                  Math.round(report.boys_NU102a_calculate / report.calculation_NU102a * 100),
              },
              girls: {
                color: '#84c686',
                label: 'Female Children',
                icon: '/assets/img/icon-girl-recovered.svg',
                count: Number(report.girls_NU102a_calculate),
                percent:
                  Math.round(report.girls_NU102a_calculate / report.calculation_NU102a * 100),
              },
            },
            'Non-recovered': {
              color: '#FFDC00',
              isOpen: true,
              total: Number(report.calculation_NU103a),
              percentage: Math.round(parseInt(report.calculation_NU103a, 10) / otpTotal * 100),
              boys: {
                color: '#f1b600',
                label: 'Male Children',
                icon: '/assets/img/icon-boy-non-recovered.svg',
                count: Number(report.boys_NU103a_calculate),
                percent:
                  Math.round(report.boys_NU103a_calculate / report.calculation_NU103a * 100),
              },
              girls: {
                color: '#f2cc51',
                label: 'Female Children',
                icon: '/assets/img/icon-girl-non-recovered.svg',
                count: Number(report.girls_NU103a_calculate),
                percent:
                  Math.round(report.girls_NU103a_calculate / report.calculation_NU103a * 100),
              },
            },
            Defaulted: {
              color: 'orange',
              isOpen: true,
              total: Number(report.calculation_NU109a),
              percentage: Math.round(parseInt(report.calculation_NU109a, 10) / otpTotal * 100),
              boys: {
                color: '#e47320',
                label: 'Male Children',
                icon: '/assets/img/icon-boy-defaulted.svg',
                count: Number(report.boys_NU109a_calculate),
                percent:
                  Math.round(report.boys_NU109a_calculate / report.calculation_NU109a * 100),
              },
              girls: {
                color: '#eaa066',
                label: 'Female Children',
                icon: '/assets/img/icon-girl-defaulted.svg',
                count: Number(report.girls_NU109a_calculate),
                percent:
                  Math.round(report.girls_NU109a_calculate / report.calculation_NU109a * 100),
              },
            },
            Died: {
              color: 'red',
              isOpen: true,
              total: Number(report.calculation_NU104a),
              percentage: Math.round(parseInt(report.calculation_NU104a, 10) / otpTotal * 100),
              boys: {
                color: '#d1413c',
                label: 'Male Children',
                icon: '/assets/img/icon-boy-died.svg',
                count: Number(report.boys_NU104a_calculate),
                percent:
                  Math.round(report.boys_NU104a_calculate / report.calculation_NU104a * 100),
              },
              girls: {
                color: '#de7f78',
                label: 'Female Children',
                icon: '/assets/img/icon-girl-died.svg',
                count: Number(report.girls_NU104a_calculate),
                percent:
                  Math.round(report.girls_NU104a_calculate / report.calculation_NU104a * 100),
              },
            },
          };
          break;
        }

        case 'SC': {
          const scTotalArr = [
            report.calculation_NU102b,
            report.calculation_NU103b,
            report.calculation_NU109b,
            report.calculation_NU104b,
          ];
          const scTotal = scTotalArr.reduce(serviceTotalReducer, 0);
          indicators.SC = {
            type: 'SC',
            isOpen: false,
            totals: scTotal,
            Admitted: {
              color: '#2ECC40',
              isOpen: false,
              total: Number(report.calculation_NU101b),
              boys: {
                label: 'Male Children',
                icon: '/assets/img/icon-boy-recovered.svg',
                count: Number(report.boys_NU101b_calculate),
                percent:
                  Math.round(report.boys_NU101b_calculate / report.calculation_NU101b * 100),
              },
              girls: {
                label: 'Female Children',
                icon: '/assets/img/icon-girl-recovered.svg',
                count: Number(report.girls_NU101b_calculate),
                percent:
                  Math.round(report.girls_NU101b_calculate / report.calculation_NU101b * 100),
              },
            },
            Recovered: {
              color: '#2ECC40',
              isOpen: true,
              total: Number(report.calculation_NU102b),
              percentage: (Math.round(parseInt(report.calculation_NU102b, 10) / scTotal * 100)),
              boys: {
                color: '#48ae51',
                label: 'Male Children',
                icon: '/assets/img/icon-boy-recovered.svg',
                count: Number(report.boys_NU102b_calculate),
                percent:
                  Math.round(report.boys_NU102b_calculate / report.calculation_NU102b * 100),
              },
              girls: {
                color: '#84c686',
                label: 'Female Children',
                icon: '/assets/img/icon-girl-recovered.svg',
                count: Number(report.girls_NU102b_calculate),
                percent:
                  Math.round(report.girls_NU102b_calculate / report.calculation_NU102b * 100),
              },
            },
            'Non-recovered': {
              color: '#FFDC00',
              isOpen: true,
              total: Number(report.calculation_NU103b),
              percentage: Math.round(parseInt(report.calculation_NU103b, 10) / scTotal * 100),
              boys: {
                color: '#f1b600',
                label: 'Male Children',
                icon: '/assets/img/icon-boy-non-recovered.svg',
                count: Number(report.boys_NU103b_calculate),
                percent:
                  Math.round(report.boys_NU103b_calculate / report.calculation_NU103b * 100),
              },
              girls: {
                color: '#f2cc51',
                label: 'Female Children',
                icon: '/assets/img/icon-girl-non-recovered.svg',
                count: Number(report.girls_NU103b_calculate),
                percent:
                  Math.round(report.girls_NU103b_calculate / report.calculation_NU103b * 100),
              },
            },
            Defaulted: {
              color: 'orange',
              isOpen: true,
              total: Number(report.calculation_NU109b),
              percentage: Math.round(parseInt(report.calculation_NU109b, 10) / scTotal * 100),
              boys: {
                color: '#e47320',
                label: 'Male Children',
                icon: '/assets/img/icon-boy-defaulted.svg',
                count: Number(report.boys_NU109b_calculate),
                percent:
                  Math.round(report.boys_NU109b_calculate / report.calculation_NU109b * 100),
              },
              girls: {
                color: '#eaa066',
                label: 'Female Children',
                icon: '/assets/img/icon-girl-defaulted.svg',
                count: Number(report.girls_NU109b_calculate),
                percent:
                  Math.round(report.girls_NU109b_calculate / report.calculation_NU109b * 100),
              },
            },
            Died: {
              color: 'red',
              isOpen: true,
              total: Number(report.calculation_NU104b),
              percentage: Math.round(parseInt(report.calculation_NU104b, 10) / scTotal * 100),
              boys: {
                color: '#d1413c',
                label: 'Male Children',
                icon: '/assets/img/icon-boy-died.svg',
                count: Number(report.boys_NU104b_calculate),
                percent:
                  Math.round(report.boys_NU104b_calculate / report.calculation_NU104b * 100),
              },
              girls: {
                color: '#de7f78',
                label: 'Female Children',
                icon: '/assets/img/icon-girl-died.svg',
                count: Number(report.girls_NU104b_calculate),
                percent:
                  Math.round(report.girls_NU104b_calculate / report.calculation_NU104b * 100),
              },
            },
          };
          break;
        }
        case 'TSFP': {
          const tsfpTotalArr = [
            report.calculation_NU102c,
            report.calculation_NU103c,
            report.calculation_NU109c,
            report.calculation_NU104c,
          ];
          const tsfpTotal = tsfpTotalArr.reduce(serviceTotalReducer, 0);
          indicators.TSFP = {
            type: 'TSFP',
            isOpen: false,
            totals: tsfpTotal,
            Admitted: {
              color: '#2ECC40',
              isOpen: false,
              total: Number(report.calculation_NU101c),
              boys: {
                label: 'Male Children',
                icon: '/assets/img/icon-boy-recovered.svg',
                count: Number(report.boys_NU101c_calculate),
                percent:
                  Math.round(report.boys_NU101c_calculate / report.calculation_NU101c * 100),
              },
              girls: {
                label: 'Female Children',
                icon: '/assets/img/icon-girl-recovered.svg',
                count: Number(report.girls_NU101c_calculate),
                percent:
                  Math.round(report.girls_NU101c_calculate / report.calculation_NU101c * 100),
              },
              pregnant: {
                label: 'Pregnant or lactating women',
                icon: '/assets/img/icon-pregnant-recovered.svg',
                count: Number(report.plw_NU101c_calculate),
                percent:
                  Math.round(report.plw_NU101c_calculate / report.calculation_NU101c * 100),
              },
            },
            Recovered: {
              color: '#2ECC40',
              isOpen: true,
              total: Number(report.calculation_NU102c),
              percentage: (Math.round(parseInt(report.calculation_NU102c, 10) / tsfpTotal * 100)),
              boys: {
                color: '#48ae51',
                label: 'Male Children',
                icon: '/assets/img/icon-boy-recovered.svg',
                count: Number(report.boys_NU102c_calculate),
                percent:
                  Math.round(report.boys_NU102c_calculate / report.calculation_NU102c * 100),
              },
              girls: {
                color: '#84c686',
                label: 'Female Children',
                icon: '/assets/img/icon-girl-recovered.svg',
                count: Number(report.girls_NU102c_calculate),
                percent:
                  Math.round(report.girls_NU102c_calculate / report.calculation_NU102c * 100),
              },
              pregnant: {
                color: '#b9dcb4',
                label: 'Pregnant or lactating women',
                icon: '/assets/img/icon-pregnant-recovered.svg',
                count: Number(report.plw_NU102c_calculate),
                percent:
                  Math.round(report.plw_NU102c_calculate / report.calculation_NU102c * 100),
              },
            },
            'Non-recovered': {
              color: '#FFDC00',
              isOpen: true,
              total: Number(report.calculation_NU103c),
              percentage: Math.round(parseInt(report.calculation_NU103c, 10) / tsfpTotal * 100),
              boys: {
                color: '#f1b600',
                label: 'Male Children',
                icon: '/assets/img/icon-boy-non-recovered.svg',
                count: Number(report.boys_NU103c_calculate),
                percent:
                  Math.round(report.boys_NU103c_calculate / report.calculation_NU103c * 100),
              },
              girls: {
                color: '#f2cc51',
                label: 'Female Children',
                icon: '/assets/img/icon-girl-non-recovered.svg',
                count: Number(report.girls_NU103c_calculate),
                percent:
                  Math.round(report.girls_NU103c_calculate / report.calculation_NU103c * 100),
              },
              pregnant: {
                color: '#f4de97',
                label: 'Pregnant or lactating women',
                icon: '/assets/img/icon-pregnant-non-recovered.svg',
                count: Number(report.plw_NU103c_calculate),
                percent:
                  Math.round(report.plw_NU103c_calculate / report.calculation_NU103c * 100),
              },
            },
            Defaulted: {
              color: 'orange',
              isOpen: true,
              total: Number(report.calculation_NU109c),
              percentage: Math.round(parseInt(report.calculation_NU109c, 10) / tsfpTotal * 100),
              boys: {
                color: '#e47320',
                label: 'Male Children',
                icon: '/assets/img/icon-boy-defaulted.svg',
                count: Number(report.boys_NU109c_calculate),
                percent:
                  Math.round(report.boys_NU109c_calculate / report.calculation_NU109c * 100),
              },
              girls: {
                color: '#eaa066',
                label: 'Female Children',
                icon: '/assets/img/icon-girl-defaulted.svg',
                count: Number(report.girls_NU109c_calculate),
                percent:
                  Math.round(report.girls_NU109c_calculate / report.calculation_NU109c * 100),
              },
              pregnant: {
                color: '#ebc4a5',
                label: 'Pregnant or lactating women',
                icon: '/assets/img/icon-pregnant-defaulted.svg',
                count: Number(report.plw_NU109c_calculate),
                percent:
                  Math.round(report.plw_NU109c_calculate / report.calculation_NU109c * 100),
              },
            },
            Died: {
              color: 'red',
              isOpen: true,
              total: Number(report.calculation_NU104c),
              percentage: Math.round(parseInt(report.calculation_NU104c, 10) / tsfpTotal * 100),
              boys: {
                color: '#d1413c',
                label: 'Male Children',
                icon: '/assets/img/icon-boy-died.svg',
                count: Number(report.boys_NU104c_calculate),
                percent:
                  Math.round(report.boys_NU104c_calculate / report.calculation_NU104c * 100),
              },
              girls: {
                color: '#de7f78',
                label: 'Female Children',
                icon: '/assets/img/icon-girl-died.svg',
                count: Number(report.girls_NU104c_calculate),
                percent:
                  Math.round(report.girls_NU104c_calculate / report.calculation_NU104c * 100),
              },
              pregnant: {
                color: '#e8b6ad',
                label: 'Pregnant or lactating women',
                icon: '/assets/img/icon-pregnant-died.svg',
                count: Number(report.plw_NU104c_calculate),
                percent:
                  Math.round(report.plw_NU104c_calculate / report.calculation_NU104c * 100),
              },
            },
          };
          break;
        }

        case 'BSFP': {
          indicators.BSFP = {
            type: 'BSFP',
            isOpen: false,
            totals: report.calculation_NU106,
            color: '#800000',
            Admitted: {
              color: '#333',
              isOpen: false,
              total: Number(report.calculation_NU106),
              boys: {
                color: '#5080D2',
                label: 'Male Children',
                icon: '/assets/img/icon-boy-recovered.svg',
                count: Number(report.boys_NU106_calculate),
                percent:
                  Math.round(report.boys_NU106_calculate / report.calculation_NU106 * 100),
              },
              girls: {
                color: '#D25FA7',
                label: 'Female Children',
                icon: '/assets/img/icon-girl-recovered.svg',
                count: Number(report.girls_NU106_calculate),
                percent:
                  Math.round(report.girls_NU106_calculate / report.calculation_NU106 * 100),
              },
              pregnant: {
                color: '#7C4FBB',
                label: 'Pregnant or lactating women',
                icon: '/assets/img/icon-girl-recovered.svg',
                count: Number(report.plw_NU106_calculate),
                percent:
                  Math.round(report.plw_NU106_calculate / report.calculation_NU106 * 100),
              },
            },
          };
          break;
        }

        case 'MCHN': {
          indicators.MCHN = {
            type: 'MCHN',
            isOpen: false,
            totals: report.calculation_NU107,
            color: '#800080',
            Admitted: {
              color: '#333',
              isOpen: false,
              total: Number(report.calculation_NU107),
              boys: {
                color: '#5080D2',
                label: 'Male Children',
                icon: '/assets/img/icon-boy-recovered.svg',
                count: Number(report.boys_NU107_calculate),
                percent:
                  Math.round(report.boys_NU107_calculate / report.calculation_NU107 * 100),
              },
              girls: {
                color: '#D25FA7',
                label: 'Female Children',
                icon: '/assets/img/icon-girl-recovered.svg',
                count: Number(report.girls_NU107_calculate),
                percent:
                  Math.round(report.girls_NU107_calculate / report.calculation_NU107 * 100),
              },
              pregnant: {
                color: '#7C4FBB',
                label: 'Pregnant or lactating women',
                icon: '/assets/img/icon-girl-recovered.svg',
                count: Number(report.plw_NU107_calculate),
                percent:
                  Math.round(report.plw_NU107_calculate / report.calculation_NU107 * 100),
              },
            },
          };
          break;
        }

        case 'IYCF': {
          indicators.IYCF = {
            type: 'IYCF',
            isOpen: false,
            totals: report.plw_NU110_calculate,
            color: '#0000FF',
            Admitted: {
              color: '#2ECC40',
              isOpen: false,
              total: Number(report.plw_NU110_calculate),
              pregnant: {
                color: '#0000FF',
                label: 'Pregnant or lactating women',
                icon: '/assets/img/icon-girl-recovered.svg',
                count: Number(report.plw_NU110_calculate),
                percent:
                  Math.round(report.plw_NU110_calculate / report.plw_NU110_calculate * 100),
              },
            },
          };
          break;
        }

        default: {
          // return false;
        }
      }
    }
    return indicators;
  }

  constructor(props) {
    super(props);
    const { layerObj } = this.props.facility;

    if (!layerObj || layerObj.id !== 'nutrition-sites-live') {
      return false;
    }

    const facilityData = ProfileView.dynamicFacilityDataBuilder(this.props.facility);
    this.state = Object.assign({}, facilityData);

    this.updateReportingPeriod = this.updateReportingPeriod.bind(this);
    this.rpNavClick = this.rpNavClick.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { layerObj } = nextProps.facility;

    if (!layerObj || layerObj.id !== 'nutrition-sites-live') {
      return false;
    }

    const facilityData = ProfileView.dynamicFacilityDataBuilder(nextProps.facility);
    this.setState(facilityData);
    return true;
  }

  updateReportingPeriod(e) {
    if (!e || !e.point || !e.point.category) {
      return false;
    }
    const nextReportingPeriod = e.point.category.replace(/ /g, '_');
    const rpIndex = this.state.metrics.reportingPeriods.indexOf(nextReportingPeriod);

    if (rpIndex === -1) {
      return false;
    }
    // this.setState(Object.assign({}, this.state, { rpIndex }));
    this.setState({
      ...this.state,
      metrics: {
        ...this.state.metrics,
        rpIndex,
      },
    });
    return true;
  }

  rpNavClick(e, pointer) {
    e.preventDefault();
    let rpIndex;

    if (pointer === 'prev') {
      if (this.state.metrics.rpIndex === 0) {
        return false;
      }
      rpIndex = this.state.metrics.rpIndex - 1;
    } else if (pointer === 'next') {
      if (this.state.metrics.rpIndex === this.state.metrics.reportingPeriods.length - 1) {
        return false;
      }
      rpIndex = this.state.metrics.rpIndex + 1;
    } else {
      rpIndex = Number(e.target.value);
    }

    if (this.state.metrics.rpIndex !== rpIndex) {
      this.setState({
        metrics: Object.assign({}, this.state.metrics, { rpIndex }),
      });
    }
    return true;
  }

  render() {
    if (!this.state) {
      return null;
    }

    const { layerObj } = this.props.facility;
    const isNutrition = layerObj.id === 'nutrition-sites-fixed';
    const isEducation = layerObj.id === 'educational-facilities';
    // universal facility properties
    const {
      siteName,
      lat,
      long,
      layer,
      basicInfo,
    } = this.state;

    // nutrition facility properties
    const {
      typeOfSite,
      settlement,
      district,
      region,
      org,
      servicesList,
      verificationStatus,
      verified,
    } = this.state;

    let indicatorComponents = null;
    if (this.state.metrics) {
      const { reportingPeriods, rpIndex, services } = this.state.metrics;
      const rpServices = reportingPeriods && services && services[reportingPeriods[rpIndex]];

      indicatorComponents = rpServices
        ? Object.keys(rpServices).map((indicator, i) =>
          (<IndicatorRow
            services={rpServices[indicator]}
            index={i}
            key={i}
          />),
        )
        : null
      ;
    }

    return (
      <div>
        <div className="profile-indicators">
          {indicatorComponents !== null && this.state.metrics
          && this.state.metrics.reportingPeriods ? (
            <ReportingPeriodNav
              updateReportingPeriod={this.updateReportingPeriod}
              reportingPeriods={{ reportingPeriods: this.state.metrics.reportingPeriods }}
              rpIndex={this.state.metrics.rpIndex}
              services={this.state.metrics.services}
              rpNavClick={this.rpNavClick}
            />
          ) : null}
          <ul>
            { indicatorComponents }
          </ul>
        </div>
      </div>
    );
  }
}

// ProfileView.propTypes = {
//   // facility: PropTypes.objectOf(PropTypes.any).isRequired,
//   parentstate: PropTypes.objectOf(PropTypes.any).isRequired,
//   parentProps: PropTypes.objectOf(PropTypes.any).isRequired,
// };

export default connect(mapStateToProps)(ProfileView);



