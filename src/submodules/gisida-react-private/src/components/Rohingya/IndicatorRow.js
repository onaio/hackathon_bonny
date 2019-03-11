import React from 'react';
import PropTypes from 'prop-types';
import { PieChart } from 'gisida-react';
import { hexToRgbA } from './../utils';

class IndicatorRow extends React.Component {
  static buildPieData(indicators) {
    const indicatorKeys = ['rc', 'hc'];
    const populationKeys = ['boys', 'girls'];
    const pieMap = {};
    let indicatorData;
    let datum = {};

    for (let i = 0; i < indicatorKeys.length; i += 1) {
      indicatorData = Object.assign({}, indicators[indicatorKeys[i]]);
      if (indicators[indicatorKeys[i]]) {
        pieMap[indicatorKeys[i]] = [];
      }

      for (let p = 0; p < populationKeys.length; p += 1) {
        if (indicatorData[populationKeys[p]]) {
          datum = {
            name: indicatorData[populationKeys[p]].label,
            y: indicatorData[populationKeys[p]].count,
            color: hexToRgbA(indicatorData[populationKeys[p]].color, 0.8),
            indicator: indicatorKeys[i],
          };

          if (datum.y === indicatorData.total) {
            datum.dataLabels = { distance: -65 };
          }

          pieMap[indicatorKeys[i]].push(datum);
        }
      }
    }

    return pieMap;
  }

  static pointFormatter() {
    return `<small>${this.point.indicator}</small>
      <br/><span style={{color: ${this.point.color}}}>\u25CF</span>
      ${this.point.name}: <b>${this.y}</b><br/>`;
  }

  static headerFormatter() {
    return `<span>${this.y}</span><br/>`;
  }

  constructor(props) {
    super(props);
    const { services } = this.props;

    this.state = {
      services,
      seriesData: IndicatorRow.buildPieData(services),
    };

    this.showIndicators = this.showIndicators.bind(this);
    this.showIndicatorBar = this.showIndicatorBar.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      services: nextProps.services,
      facility: nextProps.facility,
      seriesData: IndicatorRow.buildPieData(nextProps.services),
    });
  }

  showIndicators(e) {
    e.preventDefault();
    this.setState({
      services: Object.assign({}, this.state.services, { isOpen: !this.state.services.isOpen }),
    });
  }

  showIndicatorBar(e, indicator) {
    e.preventDefault();
    this.setState({
      services: Object.assign({}, this.state.services, {
        [indicator]: Object.assign(
          {},
          this.state.services[indicator],
          { isOpen: !this.state.services[indicator].isOpen },
        ),
      }),
    });
  }

  render() {
    const { seriesData, services } = this.state;
    const indicatorKeys = ['rc', 'hc'];
    const indicatorRows = [];
    let indicatorData;
    let indicator;

    const populationKeys = ['boys', 'girls'];
    const populationRows = [];
    let populationData;
    let population;

    const barStacks = [];
    let stack;

    // Build out actual elements based on the data
    // Loop through indicators of the actual service
    for (let i = 0; i < indicatorKeys.length; i += 1) {
      if (services[indicatorKeys[i]]) {
        indicatorData = services[indicatorKeys[i]];

        // Push stack elements for the stacked bar chart (breaking down total admissions)
        stack = (
          <span
            data-balloon={`${indicatorKeys[i]}: ${services[indicatorKeys[i]].percentage.toString()}%`}
            data-balloon-pos="up"
            style={{
              width: (services.totals === 'NaN%' || services.totals === 0)
                ? '0%' : `${services[indicatorKeys[i]].percentage.toString()}%`,
              background: services[indicatorKeys[i]].color,
            }}
          />
        );
        barStacks.push(stack);

        // Loop through population breakdowns of the indicator
        for (let p = 0; p < populationKeys.length; p += 1) {
          if (indicatorData[populationKeys[p]]) {
            populationData = indicatorData[populationKeys[p]];
            // Push expandable population breakdown elements to an array for the indicator
            population = populationData.count !== 0 ? (
              <tr>
                <td>{populationData.count}</td>
                <td><img alt={`${populationKeys[p]} icon`} src={populationData.icon} /></td>
                <td>{populationData.label}</td>
              </tr>
            ) : null;
            populationRows.push(population);
          }
        }

        if (Number(indicatorData.total)) {
          // Define each indicator element (including population breakdowns)
          indicator = (
            <li>
              <a
                className={`indicator-label indicator-item ${indicatorKeys[i]}`}
                href="#"
                onClick={(e) => { this.showIndicatorBar(e, indicatorKeys[i]); }}
              >
                {services[indicatorKeys[i]].campLabel}
                <span className="indicator-value">{indicatorData.total}</span>
                <span className={`caret caret-${services[indicatorKeys[i]].isOpen ? 'down' : 'right'}`} />
              </a>
              {
                services[indicatorKeys[i]].isOpen ? (
                  <ul className="indicator-bar">
                    <li className="indicators-section-header">
                      <a href="#">
                        <table className="pie-chart-legend">
                          {populationRows.map(p => p)}
                        </table>
                        <PieChart
                          seriesName={''}
                          seriesData={seriesData[indicatorKeys[i]]}
                          chartWidth={170}
                          chartHeight={170}
                          donut={0}
                          chartLevel={indicatorKeys[i]}
                          tooltipOptions={{
                            headerFormat: IndicatorRow.headerFormatter,
                            formatter: IndicatorRow.pointFormatter,
                          }}
                        />
                      </a>
                    </li>
                  </ul>
                ) : ''
              }
            </li>
          );
          indicatorRows.push(indicator);
        }
      }

      // Empty the population array before next iteration
      populationRows.length = 0;
    }

    return services.totals !== '0' && services.totals !== 0 && typeof (services.totals) !== 'undefined' ?
    (
      <li>
        <li>
          <a className="service-name indicator-label" href="#" onClick={e => this.showIndicators(e)}>
            {services.type}
            <div className="totals">Totals</div>
            <span className="indicator-totals indicator-value">{services.totals}</span>
            <span className={`total ${services.type ? 'caret' : ''} caret-${services.isOpen ? 'down' : 'right'}`} />
            <div className="progress progress-stacked">{barStacks}</div>
          </a>
          {
            services.isOpen ? (
              <ul className="indicators-list">
                {indicatorRows}
              </ul>
            ) : ''
          }
        </li>
      </li>
    ) : null;
  }
}

IndicatorRow.propTypes = {
  services: PropTypes.objectOf(PropTypes.any).isRequired,
  // facility: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default IndicatorRow;
