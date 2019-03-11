import React from 'react';
import PropTypes from 'prop-types';
import ProgressMetric from './ProgressMetric';
import { connect, Provider } from 'react-redux';
import { toggleFilter } from '../../store/actions';
import Filter from './Filter';


class SummaryPerformance extends React.Component {

  static parseSectorTotals(currentSectorData, sectorConfig) {
    if (!currentSectorData) {
      return null;
    }
    const isCSV = typeof currentSectorData.values !== 'undefined';
    const rawSectorValues = isCSV ? currentSectorData.values :
      Object.keys(currentSectorData).map(i => ({
        total: currentSectorData[i].cumulative_total_prop.total,
        target: currentSectorData[i].cumulative_total_prop.target['all'][0].total,
      }))
    ;
    const summaryTotals = {
      target: isCSV ? rawSectorValues[(rawSectorValues.length - 2)]
        : rawSectorValues.reduce((a, b) => { return a + b.target; }, 0),
      actual: isCSV ? rawSectorValues[(rawSectorValues.length - 3)]
        : rawSectorValues.reduce((a, b) => { return a + b.total; }, 0),
      iconFilename: sectorConfig && sectorConfig.iconFilename || '',
      description: sectorConfig && sectorConfig.description || '',
    };

    return summaryTotals;
  }

  static buildSectorLevelData(SectorData, config, currentYear, temporalIndex) {
    if (!SectorData) {
      return null;
    }
    const secData = SectorData[currentYear][temporalIndex];
    const overviewItems = [];
    const secKeys = Object.keys(secData).filter(d => d !== 'dataDate');
    for (let x = 0; x < secKeys.length; x += 1) {
      const sectorObj = secData[secKeys[x]];
      const rawSectorValues = sectorObj.values;
      overviewItems.push({
        target: rawSectorValues[(rawSectorValues.length - 2)],
        actual: rawSectorValues[(rawSectorValues.length - 3)],
        iconFilename: config[secKeys[x]].iconFilename,
        description: config[secKeys[x]].description,
        label: secKeys[x],
        indicators: [{
          label: "Children aged 6 to 59 months receiving Vitamin A",
          target: rawSectorValues[(rawSectorValues.length - 2)],
          actual: rawSectorValues[(rawSectorValues.length - 3)],
          iconFilename: config[secKeys[x]].iconFilename,
          description: config[secKeys[x]].description,
        },
        {
          label: "Childrein aged 0 to 59 months treated for SAM",
          target: rawSectorValues[(rawSectorValues.length - 2)],
          actual: rawSectorValues[(rawSectorValues.length - 3)],
          iconFilename: config[secKeys[x]].iconFilename,
          description: config[secKeys[x]].description
        }],
      });
    }
    return overviewItems;
  }

  static buildIndicatorTotals (sectorData, sectorConfig, isOverviewPage, isPercent) {
    if (!sectorData || (!isOverviewPage && !sectorConfig)) {
      return null;
    }
    const isCSV = typeof sectorData.values !== 'undefined';

    if (isOverviewPage) {
      return Object.keys(sectorData).map(sector => ({
        target: sectorData[sector].target,
        actual: sectorData[sector].total,
        iconFilename: sectorConfig && sectorConfig[sector] && sectorConfig[sector].iconFilename || '',
        description: sectorConfig && sectorConfig[sector] && sectorConfig[sector].description || '',
        label: sector,
      }))
    }

    const indicatorTotals = [];

    sectorConfig.indicators.forEach((i) => {
      let indicatorMap = {};
      let genderMap = {};
      const total = sectorData[i].cumulative_total_prop.total;
      if (sectorData[i].gender) {
        const malePercent = Math.round((sectorData[i].gender.male / total) * 100) || 0;
        const femalePercent = Math.round((sectorData[i].gender.female / total) * 100) || 0;
        genderMap = {
          male: isPercent ? malePercent : sectorData[i].gender.male,
          female: isPercent ? femalePercent : sectorData[i].gender.female,
        };
      }

      indicatorMap = {
        target: isCSV ? sectorData.values[(sectorData.values.length - 2)] : sectorData[i].cumulative_total_prop.target['all'][0].total,
        actual: isCSV ? sectorData.values[(sectorData.values.length - 3)] : sectorData[i].cumulative_total_prop.total,
        iconFilename: sectorConfig && sectorConfig[i].iconFilename || '',
        description: sectorConfig && sectorConfig.description || '',
        label: i,
      };
      if (sectorData[i].gender) {
        indicatorTotals.push({
          ...genderMap,
          ...indicatorMap
        });
      } else {
        indicatorTotals.push(indicatorMap);
      }
    });
    return indicatorTotals;
  }

  static buildOverviewSecData (config, currentSectorData) {
    const overviewSecData = {};
    config.Sectors.forEach((sector) => {
      overviewSecData[sector] = {
        target: Object.keys(currentSectorData[sector]).reduce((a,b) =>
        (a + currentSectorData[sector][b].cumulative_total_prop.target['all'][0].total), 0),
        total: Object.keys(currentSectorData[sector]).reduce((a,b) =>
          (a + currentSectorData[sector][b].cumulative_total_prop.total), 0)
      };
    });
    return overviewSecData;
  }

  constructor(props) {
    super(props);
    const { currentSectorData, sectorConfig, SectorData, config, temporalIndex, currentYear, isOverviewPage } = this.props;
    if (!currentSectorData && !sectorConfig) {
      return false;
    }
    let overviewSecData;
    if (isOverviewPage) {
      overviewSecData = SummaryPerformance.buildOverviewSecData(config, currentSectorData);
    }

    this.state = {
      isOverviewPage,
      isPercent: false,
      currentSector: this.props.currentSector,
      sectorTotals: isOverviewPage ? overviewSecData
        : SummaryPerformance.parseSectorTotals((overviewSecData || currentSectorData), sectorConfig),
      allSectorTotals: SummaryPerformance.buildSectorLevelData(SectorData, config, currentYear, temporalIndex),
      indicatorTotals: SummaryPerformance.buildIndicatorTotals(
        (overviewSecData || currentSectorData),
        (isOverviewPage ? config : sectorConfig),
        isOverviewPage,
        false
      ),
    };
    this.handleChangeSector = this.handleChangeSector.bind(this);
    this.toggleOnOff = this.toggleOnOff.bind(this);
  }

  componentWillMount() {
    const { iconDir, currentSectorData, SectorData, currentYear, config, isOverviewPage } = this.props;
    this.setState({
      iconDir,
      currentSectorData,
      SectorData,
      config,
      currentYear,
      isOverviewPage,
    });
  }

  componentWillReceiveProps(nextProps) {
    const { currentSector, currentSectorData, sectorConfig, iconDir, SectorData, currentYear, config, temporalIndex, isOverviewPage } = nextProps;
    if (!currentSectorData && !sectorConfig && !iconDir && !SectorData) {
      return null;
    }

    let overviewSecData;
    if (isOverviewPage) {
      overviewSecData = overviewSecData = SummaryPerformance.buildOverviewSecData(config, currentSectorData);
    }

    this.setState({
      currentSector,
      config,
      SectorData,
      currentYear,
      currentSectorData,
      iconDir,
      isPercent: false,
      sectorTotals: isOverviewPage ? overviewSecData
        : SummaryPerformance.parseSectorTotals((overviewSecData || currentSectorData), sectorConfig),
      allSectorTotals: SummaryPerformance.buildSectorLevelData(SectorData, config, currentYear, temporalIndex),
      indicatorTotals: SummaryPerformance.buildIndicatorTotals(
        (overviewSecData || currentSectorData),
        (isOverviewPage ? config : sectorConfig),
        isOverviewPage,
        false
      ),
    });
  }

  componentWillUpdate(nextProps, nextState) {
    const { currentSectorData, sectorConfig, isOverviewPage } = nextProps;
     if (this.state.isPercent !== nextState.isPercent) {
       this.setState({
         indicatorTotals: SummaryPerformance.buildIndicatorTotals(
           currentSectorData,
           sectorConfig,
           isOverviewPage,
           nextState.isPercent
         )
       });
     }
  }

  handleChangeSector(e, isOverviewPage) {
    e.preventDefault();
    e.stopPropagation();
    if (isOverviewPage) {
      this.props.changeSector(e);
    }
  }

  genderPercentToggle(e) {
    e.preventDefault();
    this.setState({
      isPercent: !this.state.isPercent,
    });
  }

  toggleOnOff(e) {
    const { isOverviewPage } = this.props;
    const { currentSector } = this.state;
    this.props.dispatch(toggleFilter())
    if (!isOverviewPage) {
      this.props.changeSector(e, currentSector);
    }
  }

  render() {
    const { currentSector, iconDir, sectorTotals, currentSectorData, SectorData, currentYear, config, allSectorTotals, indicatorTotals, isPercent } = this.state;
    const { isOverviewPage } = this.state;

    if (!sectorTotals || !iconDir) {
      return null;
    }

    sectorTotals.label = currentSector;

    //would pass in a length variable here by mapping through indicatorTotals' label
    //need to find how many lines for a certain length string
    //however, length doesn't particularly determine how many lines it will take up
/*
    let lines = 1;

    for (let i = 0; i < indicatorTotals.length; i++) {
      if (indicatorTotals[i].label) {
        if (indicatorTotals[i].label.length >= 110) {
          lines = 4;
        }
        else if (indicatorTotals[i].label.length >= 80) {
          lines = 3;
        }
        else {
          lines = 1;
        }
      }
    }
*/
    const secComponents = indicatorTotals.map(i =>
      (
        <ProgressMetric
          type="metric-progress"
          isOverviewPage={isOverviewPage}
          iconDir={iconDir}
          metricData={i}
          key={i.label}
          changeSector={this.handleChangeSector}
          isPercent={isPercent}
        />
      ))
    ;
    
    return !isOverviewPage ? (
      <div className="summary-card metric-aggregates" data-currentsector={currentSector}>
        <h5>Progress</h5>
        <Filter
          sectorId={currentSector}
          toggleFilterPanel={this.toggleOnOff}
        />
        <a
          className="gender-val-toggle"
          onClick={(e) => this.genderPercentToggle(e)}
        >
          {`Show Gender ${isPercent ? 'Totals' : 'Percentage'}`}
        </a>
        <ProgressMetric
          type="total-progress"
          iconDir={iconDir}
          metricData={sectorTotals}
          currentSector={currentSector}
          changeSector={this.handleChangeSector}
          isPercent={isPercent}
          isSectorLevel={true}
        />
        <div className="metrics clearfix">
          {secComponents}
        </div>
      </div>
    ) : (
      <div className="summary-card metric-aggregates" data-currentsector={currentSector}>
        <h5>Performance</h5>
        <div className="metrics clearfix">
          {secComponents}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { DASHBOARD } = state;
   return { 
     DASHBOARD,
  }
}


export default connect(mapStateToProps)(SummaryPerformance);