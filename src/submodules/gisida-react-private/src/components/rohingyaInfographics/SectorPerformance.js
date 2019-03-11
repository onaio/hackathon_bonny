import React from 'react';
import PropTypes from 'prop-types';
import BarChartStacked from '../Charts/BarChartStacked.js';

require('./SectorPerformance.scss');

class SectorPerformance extends React.Component {

  static buildStackChartData(data) {
    const barCategories = [];
    const fundingRequirements = [];
    const fundsReceived = [];
    const fundsCarriedOver = [];
    const fundsGap = [];
    let barSeries;
    let appealSec = '';

    const appealSectors = Object.keys(data);
    for (let i = 0; i < appealSectors.length; i += 1) {
      appealSec = appealSectors[i];
      barCategories.push(appealSec);
      fundingRequirements.push(data[appealSec].funding_requirements);
      fundsReceived.push(data[appealSec].funds_received);
      fundsCarriedOver.push(data[appealSec].funds_carried_over);
      fundsGap.push(data[appealSec].funds_gap);
    }
    const totalFundingGap = fundsGap.reduce((a, b) => a + b, 0);
    const totalFundsReceived = fundsReceived.reduce((a, b) => a + b, 0);
    const totalFundsCarriedOver = fundsCarriedOver.reduce((a, b) => a + b, 0);
    const totalAllocated = [totalFundsCarriedOver, totalFundsReceived].reduce((a, b) => a + b, 0);
    const totalFundingRequirement = totalFundingGap + totalAllocated//fundingRequirements.reduce((a, b) => a + b, 0);
    const percentageAllocated = Math.round((totalAllocated / totalFundingRequirement) * 100);
    const percentageFundingGap = Math.round((totalFundingGap / totalFundingRequirement) * 100);
    barSeries = [
      // actual = funding received
      // planned = funding requirements
      // over = carried over
      // {
      //   name: 'Funding Requirements',
      //   data: [
      //     ...fundingRequirements
      //   ],
      //   color: 'transparent'
      // },

      {
        name: 'Funding Gap',
        data: [
          ...fundsGap
        ],
        color: '#cecece'
      },
      {
        name: 'Received',
        data: [
          ...fundsReceived
        ],
        color: '#349ac4'
      },
      {
        name: 'Carried Over',
        data: [
          ...fundsCarriedOver
        ],
        color: '#72d7ff'
      },
    ];

    return {
      barCategories,
      barSeries,
      totalAllocated,
      percentageAllocated,
      totalFundingGap,
      percentageFundingGap,
    }
  }

  constructor(props) {
    super(props);

    const { fundingData } = this.props;

    this.state = {
      fundingData,
      chartData: SectorPerformance.buildStackChartData(fundingData)
    };
  }

  componentWillReceiveProps(nextProps) {
    const { fundingData } = nextProps;

    this.setState({
      fundingData,
      chartData: SectorPerformance.buildStackChartData(fundingData)
    });
  }
  /*
  height={560}
                width={900}*/
  render() {
    const { chartData } = this.state;
    const { barCategories, barSeries, percentageAllocated,
      percentageFundingGap, totalAllocated, totalFundingGap} = chartData;
    return (
      <div className="page-break">
        <div className="summary-card">
          <h5>
            Funding Requirements
         </h5>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Total</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Amount Allocated</td>
                <td>${totalAllocated.toLocaleString()}</td>
                <td>{`${percentageAllocated}%`}</td>
              </tr>
              <tr>
                <td>Total Funding Gap</td>
                <td>${totalFundingGap.toLocaleString()}</td>
                <td>{`${percentageFundingGap}%`}</td>
              </tr>
            </tbody>
          </table>
          <div className="actual-versus-total-chart">
            {chartData ?
              <BarChartStacked
                groupPadding={0.35}
                labelPlacement={8}
                pointPlacement={0.08}
                showLegend={true}
                barCategories={{ categories: barCategories }}
                barSeries={{ series: barSeries }}
                height={700}
                labels={{
                  align: 'left',
                  reserveSpace: false,
                  x: 6,
                  y: -19,
                  style: {
                    fontSize: '10pt',
                    fontWeight: 'bold',
                  }
                }}
                isFundingChart={true}
              />
              : null}
          </div>
        </div>
      </div>
    );
  }
}

SectorPerformance.propTypes = {
  fundingData: PropTypes.objectOf(PropTypes.any).isRequired
};

export default SectorPerformance;