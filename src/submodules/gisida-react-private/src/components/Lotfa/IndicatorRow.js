import React from 'react';
import PropTypes from 'prop-types';
import { ColumnChart } from 'gisida-react';
import { hexToRgbA } from './../utils';

require ('./indicatorRow.scss');

const SECURITY_MEASURES = {
  "PD1": {
    value: '40%',
    color: 'orange'
  },
  "PD2": {
    value: '70%',
    color: 'yellow'
  },
  "PD3": {
    value: '80%',
    color: 'yellow'
  },
  "PD4": {
    value: '80%',
    color: 'lightgreen'
  },
  "PD5": {
    value: '70%',
    color: 'yellow'
  },
  "PD6": {
    value: '70%',
    color: 'yellow'
  },
  "PD7": {
    value: '80%',
    color: 'lightgreen'
  },
  "PD8": {
    value: '60%',
    color: 'yellow'
  },
  "PD9": {
    value: '90%',
    color: 'green'
  },
  "PD10": {
    value: '60%',
    color: 'yellow'
  },
  "PD11": {
    value: '80%',
    color: 'lightgreen'
  },
  "PD12": {
    value: '70%',
    color: 'yellow'
  },
  "PD13": {
    value: '40%',
    color: 'orange'
  },
  "PD15": {
    value: '80%',
    color: 'lightgreen'
  },
  "PD16": {
    value: '60%',
    color: 'yellow'
  },
  "PD17": {
    value: '60%',
    color: 'yellow'
  },
  "PD18": {
    value: '60%',
    color: 'yellow'
  },
  'PD19': {
    value: '0%',
    color: 'grey'
  },
  'PD21': {
    value: '0%',
    color: 'grey'
  }
};

class IndicatorRow extends React.Component {
  static buildColData(indicators) {
    if (indicators.type !== 'Vehicles') {
      return null;
    }
    let data = [];
    const categories = [];
    const dataKeys = Object.keys(indicators);
    let category;

    for (let x = 0; x < dataKeys.length; x += 1) {
      if (indicators[dataKeys[x]] instanceof Object) {
        category = dataKeys[x];
        data.push({
          name: indicators[category].label,
          y: indicators[category].count,
          color: hexToRgbA(indicators[category].color),
        });
      }
    }
    data = data.sort((a, b) => b.y - a.y);
    data.forEach(d => {
      categories.push(d.name);
    });
    return {
      categories,
      data
    }
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
      isSecurityCoverageTableOpen: false,
      services,
      seriesData: IndicatorRow.buildColData(services)
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      services: nextProps.services,
      facility: nextProps.facility,
      seriesData: IndicatorRow.buildColData(nextProps.services)
    });
  }

  render() {
    const self = this;
    const { seriesData, services, isSecurityCoverageTableOpen } = this.state;
    let table_data = [];
    let crimeAttack_data = [];
    let security_section = null;
    const objData = Object.keys(services).map(d => services[d]).filter(d => typeof d === "object");

    if (services && services.type === 'CrimeAttack') {
      let fontSize;
      // build crime attack layout
      objData.forEach((elem, r) => {
        fontSize = {
          'fontSize': elem.label === 'Most Prevalent Crime' ? '14px' : '40px',
        };
        crimeAttack_data.push((
          <div className = 'crime-attack' key={r}>
            <div className="badge-label">{elem.label}</div>
              <div style={fontSize} className={`${(elem.count === 'Yes' || elem.label === 'Most Prevalent Crime') ? 'ca-grey status-badge' : 'ca-green status-badge' }`}>
                <span>{elem.label === 'Most Prevalent Crime' ? elem.count : elem.count && elem.count.toUpperCase()}</span>
              </div>
          </div>
        ));
      })
    }
    else if (services && services.type === 'Security'
      && services['Security Coverage']
      && typeof services['Security Coverage'].count !== 'undefined') {
      // build toggle table here
      objData.filter(d => d.label !== 'color' && d.label !== 'Security Coverage').forEach((elem, r) => {
        table_data.push((
          <tr key={r}>
            <td>{elem.label}</td>
            <td className={`td-${elem.count === 'Yes' ? 'green' : 'red'}`}>
              {elem.count}
            </td>
          </tr>
        ))
      });
      return <div>
        <div>
          <h4><b>Security</b></h4>
          <div className="security-container">
            <div className="security">
              <div className="badge-label">
                Security Measures in Place&nbsp;
                <span onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  self.setState({ isSecurityCoverageTableOpen: !isSecurityCoverageTableOpen })
                }}>({isSecurityCoverageTableOpen ? 'less' : 'more'})</span>
              </div>
              <div 
                style={{ 
                  'backgroundColor': services["Security Coverage"].color,
                  'cursor': 'pointer',
                }}
                className="status-badge"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  self.setState({ isSecurityCoverageTableOpen: !isSecurityCoverageTableOpen })
                }}
              >
                <span>{services["Security Coverage"].count}</span>
              </div>
              { this.state.isSecurityCoverageTableOpen ? (
                <table className="blueTable">
                  <tbody>{table_data}</tbody>
                </table>
              ) : '' }
            </div>
          </div>
        </div>
      </div>;
    }
    else if (services && services.type === 'Infrastructure') {
      // build infrastructure layout
      objData.forEach((elem, r) => {
          table_data.push(
            (<tr key={r}>
              <td>{elem.label}</td>
              <td
                className={`${(elem.count === 0 || isNaN(elem.count)) ? 'td-red' : 'td-green'}`}
              >
              {elem.count}
              </td>
            </tr>
            )
          );
        }) 
      } else if (services && services.type === 'Utilities') {
        //build utilities utilities
        objData.forEach((elem, r) => {
          table_data.push(
            (<tr key={r}>
              <td>{elem.label}</td>
              <td
                className={`${(typeof elem.count === 'undefined' || elem.count === 'No' || elem.count === 'Not at all' || elem.count === '25% of the day or less') ? 'td-red' : 'td-green'}`}
              > 
              {elem.count}
              </td>
            </tr>
            )
          );
        })
      }

      const renderedTable = table_data.length ? (
      <div>
        <h4><b>{services.type}</b></h4>
        <table className="blueTable">
          <tbody>
            {table_data}
          </tbody>
        </table>
        <hr/>
      </div>) : '';

      const crime_attack = crimeAttack_data.length ? (
      <div>
       <div>
        <h4><b>{`Crime & Attack`}</b></h4>
        {crimeAttack_data}<hr/>
      </div>
     </div>) : '';

      const vehicle_columnChart = services.type === "Vehicles" && seriesData ? 
      (<div> 
        <h4><b>{services.type}</b></h4>
        <li>
          <li>
            <ul className="indicators-list">
              <li>
                <ul className="indicator-bar">
                  <li className="indicator-section-header">
                    {seriesData ?
                    (
                    <ColumnChart
                      seriesTitle={''}
                      categories={seriesData.categories}
                      seriesData={seriesData.data}
                      targetMark={1}
                      chartHeight={250}
                      yAxisLabel={'Number of Vehicles'}
                    />
                    ) : null}
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </li>
        <hr/>
       </div>) : '';


    return (
      <div>
        <div>{crime_attack}</div> 
        {renderedTable}
        {vehicle_columnChart}
      </div>
    );
  }
}

IndicatorRow.propTypes = {
  services: PropTypes.objectOf(PropTypes.any).isRequired,
  // facility: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default IndicatorRow;
