import React from 'react';
import { connect } from 'react-redux';
import { files, getData, aggregateFormData, processFormData, parseData, generateFilterOptions } from 'gisida'
import SummaryNav from './SummaryNav';
import SummaryPerformance from './SummaryPerformance';
import * as d3 from 'd3';
import { addConfigs, activeTab, buildSectorsObj, toggleFilter } from '../../store/actions';
import SummaryCampPerformance from './SummaryCampPerformance';
import SectorPerformance from './SectorPerformance';

require('./Summary.scss');
const { loadJSON, loadCSV } = files;

const mapStateToProps = (state, ownProps) => {
  const { DASHBOARD, VIEW, INFOFILTER } = state;
  const MAP = state['map-1'];

  return {
    DASHBOARD,
    VIEW,
    MAP,
    INFOFILTER,
    GLOBAL: state,
    id: ownProps.id,
    activeDashboard: DASHBOARD.activeDashboard,
    viewSummary: DASHBOARD.viewSummary,
    summaryURL: DASHBOARD.summary,
    dashboardConfigs: DASHBOARD.configs,
    activeTab: DASHBOARD.activeTab,
    joinCSV: DASHBOARD.joinCSV,
  }
}

class Summary extends React.Component {
  static parseDateFromFilepath(filePath) {
    let dateStr = filePath;
    dateStr = dateStr.slice(dateStr.indexOf('-') + 1, dateStr.indexOf('.csv'));
    return Date.UTC(dateStr.slice(0, -2), dateStr.slice(-2));
  }

  constructor(props) {
    super(props);
    this.changeSector = this.changeSector.bind(this);

    this.state = {
      hasData: false,
      isOverviewPage: true,
      config: null,
      isSummaryPage: false,
      currentYear: "2017",
      currentSector: '',
      currentSectorData: {},
      PartnerData: {},
      SectorData: {},
      temporalIndex: 0
    };
  }

  componentWillMount() {
    const { summaryURL } = this.props;
    loadJSON(summaryURL, (config) => {
      const { summaryData } = config;
      const summaryDataYearKeys = Object.keys(summaryData);
      const PartnerData = {};
      const SectorData = {};

      for (let s = 0; s < summaryDataYearKeys.length; s += 1) {
        PartnerData[summaryDataYearKeys[s]] = [];
        SectorData[summaryDataYearKeys[s]] = [];
      }
      let q = d3.queue();
      const { Sectors } = config;
      let currSector = '';
      let indicator;
      const locProps = ['submission/rc_loc', 'submission/hc_loc'];
      for (let x = 0; x < Sectors.length; x += 1) {
        currSector = Sectors[x];
        let secProps = [
          '_xform_id',
          ...locProps,
          'submission/location_type',
          'reporter/reporter_org',

        ];
        for (let i = 0; i < config[currSector].indicators.length; i += 1) {
          indicator = config[currSector].indicators[i];
          for (let l = 0; l < Object.keys(config[currSector]).length; l += 1) {
            if (Object.keys(config[currSector]).includes(indicator)) {
              if (!secProps.includes(config[currSector][indicator].cumulative_total_prop)) {
                secProps.push(config[currSector][indicator].cumulative_total_prop);
              }
              const genderProps = config[currSector][indicator].gender;
              if (genderProps) {
                Object.keys(genderProps).forEach((g) => {
                  const prop = genderProps[g];
                  if (!secProps.includes(prop)) {
                    secProps.push(prop);
                  }
                });
              }
            }
          }
        }
        if (Object.keys(config).includes(currSector)) {
          config[currSector].formId.forEach((f) => {
            q = q.defer(getData, f, secProps, this.props.GLOBAL.APP);
          });
        }
      }
      if (config.Funding) {
        config.Funding.formId.forEach((f) => {
          q = q.defer(getData, f, null, this.props.GLOBAL.APP);
        });
      }
      q = q.defer(d3.csv, this.props.joinCSV);
      q.awaitAll((error, Data) => {
        if (error) {
          throw error;
        }
        // Build location key from local CSV (for joining supplemental data)
        const locationKey = {};
        Data[Data.length - 1].forEach(d => {
          locationKey[d.New_Camp_S] = {
            ...d
          };
        });
        // Loop through all queried Data and add data from funding form
        for (let D = 0; D < Data.length; D += 1) {
          if (config.Funding) {
            config.Funding.formId.forEach((f) => {
              if (f === Data[D][0]['_xform_id']) {
                config.Funding.fundingData = [
                  ...Data[D]
                ];
              }
            });
          }
          // Loop through all form submissions
          for (let k = 0; k < Data[D].length; k += 1) {
            // Join supplemental data (one-to-many) via location
            for (let p = 0; p < locProps.length; p += 1) {
              if (Data[D][k][locProps[p]]) {
                Data[D][k] = {
                  ...Data[D][k],
                  ...locationKey[Data[D][k][locProps[p]]]
                };
              }
            }
          }
          let dataLayerSpec = {};
          // Loop through all config.Sectors
          for (let y = 0; y < Sectors.length; y += 1) {
            let secCumulProps = [];
            // Loop through all ONA Form IDs in Sector config
            config[Sectors[y]].formId.forEach((f) => {
              if (Object.keys(config).includes(Sectors[y])
                && f === Data[D][0]['_xform_id']) {
                // Shallow copy raw form data to config
                config[Sectors[y]].rawData = [
                  ...Data[D]
                ];
                // Loop through all Sector Indicators
                for (let i = 0; i < config[Sectors[y]].indicators.length; i += 1) {
                  indicator = config[Sectors[y]].indicators[i];
                  // Loop through all Sectors again (looking for same indicator in other sectors?)
                  for (let l = 0; l < Object.keys(config[Sectors[y]]).length; l += 1) {
                    if (Object.keys(config[Sectors[y]]).includes(indicator)) {
                      // Add form field property to sector props for aggregation
                      const extraProp = config[Sectors[y]][indicator].cumulative_total_prop;
                      if (!secCumulProps.includes(extraProp)) {
                        secCumulProps.push(extraProp)
                      }
                      const genderProps = config[Sectors[y]][indicator].gender;
                      if (genderProps) {
                        Object.keys(genderProps).forEach((g) => {
                          const prop = genderProps[g];
                          if (!secCumulProps.includes(prop)) {
                            secCumulProps.push(prop);
                          }
                        });
                      }
                    }
                  }
                }
                const { rawData } = config[Sectors[y]];
                if (rawData) {
                  this.buildConfigsData(config, Sectors[y], rawData, secCumulProps, false, false);
                }
              }
            });
          }
        }
      });
    });
  }

  buildConfigsData(config, sector, rawData, secCumulProps, filterSpec, isFilter) {
    const { dispatch } = this.props;
    let dataLayerSpec = {};
    if (!isFilter) {
      const parsedData = parseData(config[sector]['parse-uid'], rawData);
      // define a proxy "data-layer" to feed into aggregation function
      dataLayerSpec = {
        id: sector,
        source: {
          data: [
            ...parsedData,
          ]
        },
        property: secCumulProps[0],
        aggregate: {
          type: 'sum', // aggregate sum totals
          'group-by': 'ADMN0_EN', // country level join prop
          extraProps: [
            ...secCumulProps, // aggregate all sector cumulative props
            'submission/location_type',
            'reporter/reporter_org',
            'Upazila'
          ],
          "filter": ["parsedLocType", "parsedPartner", "Upazila"],
          "accepted-filter-values": ["all", "all", "all"],
          "filter-label": ["Location Type", "Partners", "Upazila"],
          timeseries: {
            type: 'cumulative',
            field: 'period'
          }
        }
      };

      if (dataLayerSpec.aggregate && dataLayerSpec.aggregate.filter) {
        dataLayerSpec.filterOptions = generateFilterOptions(dataLayerSpec);
        dispatch(buildSectorsObj(dataLayerSpec, sector))
        // config[Sectors[y]].filterOptions = dataLayerSpec.filterOptions;
      }
    }

    const sectorSpec = isFilter ? filterSpec : dataLayerSpec;
    
    // Aggregate group-by country to get indicator cumulative sum totals
    config[sector].data = (!isFilter ? aggregateFormData(sectorSpec)
      .filter(d => d.ADMN0_EN !== 'undefined') : 
        (processFormData(sectorSpec.source.data, sectorSpec).length > 1 ? 
      processFormData(sectorSpec.source.data,sectorSpec)
      .filter(d => d.ADMN0_EN !== 'undefined'): 
        processFormData(sectorSpec.source.data,sectorSpec)))
      .map((d) => {
        let data = d;
        data = {
          ...data,
          sector,
        };
        return data;
     });

    const campDataLayerSpec = {
      ...sectorSpec,
      aggregate: {
        ...sectorSpec.aggregate,
        'group-by': 'New_Camp_S' // camp level join prop
      }
    };
    config[sector].campData = aggregateFormData(campDataLayerSpec);
    this.props.dispatch(addConfigs(config));
    this.setState({
      config,
      newSecData: isFilter ? this.buildSectorData(config) : null,
    }, () => {
      this.getSummaryData(true);
    });
  }

  buildSectorData(config) {
    const { Sectors } = config;
    const sectorMap = {
      'all': [],
    };
    const allDataMap = {}
    // sector data expected structure example:
    //   SectorData: {
    //     'all': [{
    //         'sectorA': {
    //             'indicatorA': {},
    //             ....
    //         },
    //         'sectorB': { ... },
    //         ...
    //     }]
    // }
    // ^^ (change 'all' to year to and add dates to array objects for timeseries) ^^

    let currSector = '';
    let indicator;
    const allData = [];
    let currDataMap = {};

    // Loop through all Sectors
    for (let x = 0; x < Sectors.length; x += 1) {
      currSector = Sectors[x];
      if (!allDataMap[currSector]) {
        allDataMap[currSector] = {};
      }
      // Combine all sector data
      config[currSector].data.forEach(d => {
        allData.push(d);
      });

      currDataMap = {
        ...allData.filter(d => d.sector === currSector)[0]
      };

      // Loop through all Indicators
      for (let i = 0; i < config[currSector].indicators.length; i += 1) {
        indicator = config[currSector].indicators[i];
        if (Object.keys(config[currSector]).includes(indicator)) {
          let cumulProp = config[currSector][indicator].cumulative_total_prop;
          // Build sub-component models / schemas
          allDataMap[currSector][indicator] = {
            'cumulative_total_prop': { // Progress metrics
              'total': currDataMap[cumulProp],
              'target': config[currSector][indicator].target,
            },
            'campData': [...config[currSector].campData]
              .filter(d => typeof d.New_Camp_S !== 'undefined' && d.New_Camp_S !== 'undefined')
              .map(d => ({
                'locType': d['submission/location_type'],
                category: d.New_Camp_S,
                parsedUID: d.parsedUID,
                parsedPartner: d.parsedPartner,
                total: d[config[currSector][indicator].cumulative_total_prop],
                isRC: d['submission/location_type'] === 'rc' //may want to do a val instead of conditional
              }))
          }
          const genderProps = config[currSector][indicator].gender;
          if (genderProps) {
            allDataMap[currSector][indicator].gender = {
              'male': (genderProps.male && currDataMap[genderProps.male]) || 0,
              'female': (genderProps.female && currDataMap[genderProps.female]) || 0
            };
          }
        }
      }
    }

    // Push to non-temporal sectorMap as a timeseries of 1 period
    sectorMap['all'].push(allDataMap);
    return sectorMap;
  }

  buildFundingData(config) {
    const { Funding, appealSectors } = config;
    const fundingMap = {};
    let appealSec = '';
    for (let i = 0; i < appealSectors.length; i += 1) {
      appealSec = appealSectors[i];

      if (!fundingMap[appealSec]) {
        fundingMap[appealSec] = {};
      }

      Funding.fundingData.forEach((d) => {
        fundingMap[appealSec] = {
          'funding_requirements': d[Funding[appealSec].funding_requirements] || 0,
          'funds_received': d[Funding[appealSec].funds_received] || 0,
          'funds_carried_over': d[Funding[appealSec].funds_carried_over] || 0,
          'funds_gap': Number(d[Funding[appealSec].funds_gap]) || 0
        };
      });
    }
    return fundingMap;
  }

  parseCSVdata(data, url, year) {
    const { config } = this.state;
    const { Partners, Sectors } = config;
    const dataDate = Summary.parseDateFromFilepath(url);
    let i = 0;

    const h1 = [];
    const h2 = ["Metric"];

    Object.keys(data[0]).forEach((k) => {
      h1.push(k.split("_")[0]);
      switch (k.split("_")[1]) {
        case 'p':
          h2.push("Planned");
          break;
        case 'a':
          h2.push("Actual");
          break;
        case 't':
          h2.push("Target");
          break;
        case 'pr':
          h2.push("Progress");
          break;
        default:
          break;
      }
    });
    // partnerMap - this is what we eventually push all the data to
    const partnerMap = {
      dataDate,
    };

    let partnerStr = '';
    let iRefProp = '';

    // loop through the header row to find partner columns
    for (i = 1; i < h1.length; i += 1) {
      partnerStr = h1[i];
      // check if header label is in config.Partners
      if (Partners.includes(partnerStr)) {
        // if partner object doesn't exist, create it on the map
        if (!partnerMap[partnerStr]) {
          partnerMap[partnerStr] = {
            sectorSums: {},
            metrics: {},
            options: config[partnerStr],
          };
        }
        // determine which column we're looking at
        iRefProp = h2[i] === 'Actual' ? 'actualColI' : 'plannedColI';
        // save the index to reference within the sector/metric rows
        partnerMap[partnerStr][iRefProp] = i;
      }
    }

    // sectorMap - a map from which to reference all the data
    const sectorMap = {
      dataDate,
    };
    let thisSectorStr = '';
    let val = '';
    const scrubRowValues = (thisVal, c) => {
      val = thisVal;
      // if the first column, don't scrub
      if (c === 0) return val;
      // remove all spaces from val
      val = val.replace(/ /g, '').replace(/"/g, '');
      // if val is empty or a hyphen, return 0
      if (val === '' || val === '-') return 0;
      // if val has a percent symbol, remove it and return as a decimal
      if (val.indexOf('%') !== -1) return (Number(val.replace('%', '')) / 100);
      // otherwise return val as a number while removing any commas
      return Number(val.replace(/,/g, ''));
    };

    // loop through rows looking for sectors
    for (i = 0; i < data.length; i += 1) {
      // check config.Sectors for match of first array value
      if (Sectors.includes(data[i].Sector)) {
        // stash a reference to the current sector
        thisSectorStr = data[i].Sector;
        // save sector to sectorMap

        sectorMap[thisSectorStr] = {
          values: Object.values(data[i]).map(scrubRowValues), // save raw array of values
          metrics: config[thisSectorStr].indicators, // reference sector metrics
        };

        // if not match, save as metric nested under current Sector
      } else {
        // save raw array of values
        sectorMap[thisSectorStr][data[i].Sector] = {
          values: Object.values(data[i]).map(scrubRowValues),
        };
      }
    }

    // todo - convert this into buildSummaryModel function
    // Save entire "columns" of values from partnerMap.partners
    let thisPartner = null;
    let thisSector = null;
    let thisMetric = null;
    let partnerActualI = 0;
    let partnerPlannedI = 0;
    // let partnerProp = '';
    // let sectorProp = '';
    let metricProp = '';
    let metricPropRef = '';

    // loop through all partners
    Object.keys(partnerMap).forEach((partnerProp) => {
      if (partnerProp === 'dataDate') return false;
      thisPartner = partnerMap[partnerProp];

      // reference the partner column indecies
      partnerActualI = thisPartner.actualColI;
      partnerPlannedI = thisPartner.plannedColI;

      // loop through all sectors
      Object.keys(sectorMap).forEach((sectorProp) => {
        if (sectorProp === 'dataDate') return false;
        thisSector = sectorMap[sectorProp];

        // save summations from sector "rows"
        thisPartner.sectorSums[sectorProp] = {
          actual: thisSector.values[partnerActualI],
          planned: thisSector.values[partnerPlannedI],
        };

        // loop through all metrics of each sector
        for (i = 0; i < thisSector.metrics.length; i += 1) {
          metricProp = thisSector.metrics[i];

          // if current metric is not in config, don't try to save it.
          // this should never happen...
          if (!config[sectorProp][metricProp]) return false;

          // If the metric doesn't exist in thisSector AND it has a property name that is different
          // than what should be displayed as in the UI, it should have reference in the config.
          if (!thisSector[metricProp] && !!config[sectorProp][metricProp].csvReference) {
            // This should only happen once b/c it will be updated in the sectorMap below
            metricPropRef = config[sectorProp][metricProp].csvReference;

            // ...otherwise reset metricPropRef to an empty string.
          } else {
            metricPropRef = '';
          }

          // define the metric object containing the entire row of values
          thisMetric = thisSector[(metricPropRef || metricProp)];

          // if there is no metric, don't try to save it. (this shouldn't happen)
          if (!thisMetric) return false;

          // If this metric was requiring a CSVreference then clean up
          // the associated metric in the sectorMap to match the config
          if (metricPropRef) {
            thisSector[metricProp] = thisSector[metricPropRef];
            thisSector[metricProp][0] = metricProp;
            delete thisSector[metricPropRef];
          }

          // Save the metric to partner.metric
          thisPartner.metrics[metricProp] = {
            actual: thisMetric.values[partnerActualI],
            planned: thisMetric.values[partnerPlannedI],
          };
        }

        return true;
      });

      return true;
    });

    return {
      year,
      sectorMap,
      partnerMap,
    };
  }

  getSummaryData(isLatest) {
    const { summaryData, csvFilenames, csvDirectory, Sectors } = this.state.config;
    const { PartnerData, SectorData, currentYear, temporalIndex, currentSector } = this.state;

    const yearKeys = Object.keys(summaryData);
    const csvPromises = [];
    const self = this;
    // If only getting the latest, grab the last CSV from each year
    if (isLatest) {
      for (let y = 0; y < yearKeys.length; y += 1) {
        const url = `${csvDirectory}${summaryData[yearKeys[y]][summaryData[yearKeys[y]].length - 1]}`;
        csvPromises.push(
          new Promise((res, rej) => {
            loadCSV(url, (csv) => {
              res(this.parseCSVdata(csv, url, yearKeys[y]));
            });
          })
        );
      }
    } else {
      // Grab the rest of the CSVs from each year
      for (let y = 0; y < yearKeys.length; y += 1) {
        for (let u = 0; u < summaryData[yearKeys[y]].length - 1; u += 1) {
          const url = `${csvDirectory}${summaryData[yearKeys[y]][u]}`;
          csvPromises.push(
            new Promise((res, rej) => {
              loadCSV(url, (csv) => {
                res(this.parseCSVdata(csv, url, yearKeys[y]));
              });
            })
          );
        }
      }
    }

    // Reolve all promises and push parsed data into Partner/Sector Data
    Promise.all(csvPromises).then(results => {
      for (let r = 0; r < results.length; r += 1) {
        if (!PartnerData[results[r].year]) {
          PartnerData[results[r].year] = [];
        }

        if (!SectorData[results[r].year]) {
          SectorData[results[r].year] = [];
        }

        PartnerData[results[r].year].push(results[r].partnerMap);
        SectorData[results[r].year].push(results[r].sectorMap);
      }

      // Sort the Partner/Sector Data by Date
      if (!isLatest) {
        for (let y = 0; y < yearKeys.length; y += 1) {
          PartnerData[yearKeys[y]].sort((a, b) => b.dataDate - a.dataDate);
          SectorData[yearKeys[y]].sort((a, b) => b.dataDate - a.dataDate);
        }
      }

      this.setState({
        hasData: true,
        PartnerData,
        SectorData,
        currentSectorData: SectorData[currentYear][temporalIndex][currentSector || Sectors[0]],
      }, () => {
        if (isLatest) this.getSummaryData(false);
      })
    });
  }

  componentWillReceiveProps(nextProps) {
    
    const { activeDashboard, viewSummary, INFOFILTER } = nextProps;

    this.setState({
      activeDashboard,
      INFOFILTER,
      isSummaryPage: viewSummary,
    });
  }

  componentWillUpdate(nextProps, nextState) {
    const { config } = nextState;
    const { dashboardConfigs } = nextProps;
    if (!dashboardConfigs) {
      return null
    }

    if ((this.props.DASHBOARD.activeDashboard !== nextProps.DASHBOARD.activeDashboard)) {
      this.props.dispatch(addConfigs(config));
      this.setState({
        newSecData: this.buildSectorData(dashboardConfigs),
        fundingData: this.buildFundingData(dashboardConfigs)
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    
    const { INFOFILTER, DASHBOARD } = this.props;
    const { currentSector, config } = this.state;
    const doApply = INFOFILTER && INFOFILTER[currentSector] && INFOFILTER[currentSector].doUpdate
      && !INFOFILTER[currentSector].isClear && INFOFILTER[currentSector].aggregate
      && (prevState && prevState.INFOFILTER[currentSector]
        && !prevState.INFOFILTER[currentSector].doUpdate
        && INFOFILTER[currentSector].aggregate
        && (INFOFILTER[currentSector].fauxsectorObj
          && INFOFILTER[currentSector].fauxsectorObj.source.data.length));

    const doSubsequentApply = prevState.INFOFILTER && prevState.INFOFILTER[currentSector] &&
      INFOFILTER[currentSector].aggregate &&
      JSON.stringify(prevState.INFOFILTER[currentSector].aggregate
        && prevState.INFOFILTER[currentSector].aggregate["accepted-filter-values"]) !==
      JSON.stringify(INFOFILTER[currentSector].aggregate["accepted-filter-values"]) &&
      !INFOFILTER[currentSector].aggregate["accepted-filter-values"].every(filterVal => filterVal === 'all')
      && (INFOFILTER[currentSector].fauxsectorObj
        && INFOFILTER[currentSector].fauxsectorObj.source.data.length);

    const doClear = INFOFILTER && INFOFILTER[currentSector] && !INFOFILTER[currentSector].doUpdate &&
      INFOFILTER[currentSector].isClear && INFOFILTER[currentSector].aggregate
      && (prevState && prevState.INFOFILTER[currentSector]
        && prevState.INFOFILTER[currentSector].doUpdate && prevState.INFOFILTER[currentSector].aggregate);

    if (doApply || doClear || doSubsequentApply) {
      this.setState({
        INFOFILTER,

      }, () => {
        if (doApply || doSubsequentApply) {
          const { fauxsectorObj } = INFOFILTER[currentSector];
          this.buildConfigsData(config, currentSector, fauxsectorObj.source.data, fauxsectorObj.aggregate.extraProps, fauxsectorObj, true);
        } else if (doClear) {

          const { originalsectorObj } = INFOFILTER[currentSector];
          const oldSecObj = {
            ...originalsectorObj,
            aggregate: {
              ...originalsectorObj.aggregate,
              'accepted-filter-values': [
                ...DASHBOARD.sectorsObj[currentSector].aggregate['accepted-filter-values']
              ]
            }
          }
          this.buildConfigsData(config, currentSector, oldSecObj.source.data, oldSecObj.aggregate.extraProps, oldSecObj, true);
        }
      });
    }
  }



  changeSector(e, currSec) {
    const targetSector = ((e.currentTarget && e.currentTarget.getAttribute('data-key')) || currSec);
    const { DASHBOARD } = this.props;
    if (!targetSector) {
      return false
    }

    const { SectorData, temporalIndex, currentYear } = this.state;

    // this.props.dispatch(activeTab(targetSector));
    if (targetSector !== 'Overview') {
      this.setState({
        activeDashboard: true,
        isSummaryPage: true,
        isOverviewPage: false,
        currentSector: targetSector,
        currentSectorData: SectorData[currentYear][temporalIndex][targetSector],
      });
    } else {
      this.setState({
        isOverviewPage: true,
        isSummaryPage: false,
        currentSector: targetSector,
      }, () => {
        if (DASHBOARD.showFilter) this.props.dispatch(toggleFilter())
      });
    }
    return true;
  }

  render() {
    const { isOverviewPage, config, SectorData, currentYear, currentSector, hasData, temporalIndex, activeDashboard } = this.state;
    const { activeTab } = this.props;
    if (!config || !this.state.newSecData) {
      return null;
    }

    const { IconDirectory } = config;

    return hasData ? isOverviewPage ? (
      <div
        className="summary-wrapper"
        style={{ display: activeDashboard && !this.props.VIEW.showMap ? 'block' : 'none' }}>
        <div className="summary-header">
          <h3>Rohingya Summary</h3>
        </div>
        {config.Sectors ?
          <SummaryNav
            navItems={Object.keys(SectorData[currentYear][0]).filter(s => s !== 'dataDate')}
            currentSector={activeTab}
            changeSector={this.changeSector}
            isOverviewPage={isOverviewPage}
          /> : null}
        {config.Sectors && SectorData ?
          <SummaryPerformance
            currentSector={activeTab || config.Sectors[0]}
            currentSectorData={this.state.newSecData['all'][0]}
            sectorConfig={config[currentSector || config.Sectors[0]]}
            iconDir={IconDirectory}
            SectorData={SectorData}
            currentYear={currentYear}
            config={config}
            temporalIndex={temporalIndex}
            isOverviewPage={isOverviewPage}
            changeSector={this.changeSector}
          /> : null}
        {this.state.fundingData ?
          <SectorPerformance
            fundingData={this.state.fundingData}
          />
        : null}
      </div>
    ) : (
        <div
          className="summary-wrapper"
          style={{ display: !isOverviewPage && !this.props.VIEW.showMap ? 'block' : 'none' }}
        >
          <div
            className="summary-header"
          >
            <h3>
              Progress Against Targets
          </h3>
          </div>
          {config.Sectors ?
            <SummaryNav
              navItems={Object.keys(SectorData[currentYear][0]).filter(s => s !== 'dataDate')}
              currentSector={this.state.currentSector || config.Sectors[0]}
              changeSector={this.changeSector}
              isOverviewPage={isOverviewPage}
            /> : null}

          {config.Sectors && currentSector && this.state.newSecData ?
            <div>
              <SummaryPerformance
                currentSector={currentSector || config.Sectors[0]}
                currentSectorData={this.state.newSecData['all'][0][currentSector]}
                sectorConfig={config[currentSector || config.Sectors[0]]}
                iconDir={IconDirectory}
                SectorData={SectorData}
                currentYear={currentYear}
                config={config}
                temporalIndex={temporalIndex}
                changeSector={this.changeSector}
              />
              <SummaryCampPerformance
                currentSector={currentSector || config.Sectors[0]}
                currentSectorData={this.state.newSecData['all'][0][currentSector]}
              />
            </div>
            : null}
        </div>
      ) : null;
  }
}

Summary.propTypes = {

};

/*

currentSector={currentSector || config.Sectors[0]}
currentSectorData={this.state.newSecData['all'][0][currentSector]}

*/

export default connect(mapStateToProps)(Summary);