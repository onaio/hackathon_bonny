import React from 'react';
import PropTypes from 'prop-types';
import { ColumnChart } from 'gisida-react';
import BarChartStacked from '../Charts/BarChartStacked.js';

// require('./SummaryCampPerformance.scss');

class SummaryCampPerformance extends React.Component {

	//Component Wrapper for column chart showing perfomance for all camps

	constructor(props) {
		super(props);

		const { currentSector, currentSectorData } = this.props;

		this.state = {
			currentSector,
			currentSectorData: currentSectorData
		};
	}

	componentWillReceiveProps(nextProps) {

		const { currentSector, currentSectorData } = nextProps;

		this.setState({
			currentSector: currentSector,
			currentSectorData: currentSectorData
		});
	}

	render() {
		const sectorDataCopy = { ...this.state.currentSectorData };

/*
		data for seriesData and categories, in this form:
		{
			indicator1: 
			{
				seriesData: [data], 
				categories: [data]
			}
			...
		}
*/

		let dataForColumnChart = { ...sectorDataCopy };
		let dataForBarChartStacked = { ...sectorDataCopy };

		for (let indicator in sectorDataCopy) {
			let seriesData = [];
			let categories = [];

			let sumtotalRC = 0;
			let sumtotalHC = 0;
 			
 			//sort campData so that both total number and categories sort together 
 			sectorDataCopy[indicator]['campData'].sort(function(a,b) {
 				return b['total'] - a['total'];
 			});

			for (let data in sectorDataCopy[indicator]['campData']) {
				seriesData.push({
					y : sectorDataCopy[indicator]['campData'][data]['total'],
					color : (sectorDataCopy[indicator]['campData'][data]['isRC'] ? '#cb6a37' : '#2c8fbc')
				});
				categories.push(sectorDataCopy[indicator]['campData'][data].parsedUID);

				//sumtotal of RC and HC
				if (sectorDataCopy[indicator]['campData'][data]['isRC']) {
					sumtotalRC += sectorDataCopy[indicator]['campData'][data]['total'];
				}
				else {
					sumtotalHC += sectorDataCopy[indicator]['campData'][data]['total'];
				}
			}

			//calculate if RC or HC is over the targetted, otherwise stay at zero
			let overTargetRC = 0;
			let overTargetHC = 0;

			if (sumtotalRC > sectorDataCopy[indicator]['cumulative_total_prop']['target']['all'][0]['rc']) {
				overTargetRC = sumtotalRC - sectorDataCopy[indicator]['cumulative_total_prop']['target']['all'][0]['rc'];
			}

			if (sumtotalHC > sectorDataCopy[indicator]['cumulative_total_prop']['target']['all'][0]['hc']) {
				overTargetHC = sumtotalHC - sectorDataCopy[indicator]['cumulative_total_prop']['target']['all'][0]['hc'];
			}

			dataForColumnChart[indicator] = {
				'seriesData' : seriesData,
				'categories' : categories
			};

			dataForBarChartStacked[indicator] = {
				'totalRC': sumtotalRC,
				'totalHC': sumtotalHC,
				'targetRC': sectorDataCopy[indicator]['cumulative_total_prop']['target']['all'][0]['rc'],
				'targetHC': sectorDataCopy[indicator]['cumulative_total_prop']['target']['all'][0]['hc'],
				'overTargetRC': overTargetRC,
				'overTargetHC': overTargetHC
			};
		}

		//let divWidth = document.getElementById("summary-camp-performance-wrapper").offsetWidth || 800;
		return (
			<div>
				<div className="summary-camp-performance">
					<div className="actual-planned">
						{Object.keys(sectorDataCopy).map( (indicator, idx) => {
							return (
								<div className="page-break">
									<div className="summary-card" key={idx}>		
										<h5>{indicator}</h5>									
										<div className="actual-versus-total-chart">
											{
												[dataForBarChartStacked[indicator]['totalRC']].length &&
												[dataForBarChartStacked[indicator]['totalHC']].length && 
												[dataForBarChartStacked[indicator]['targetRC']].length &&
												[dataForBarChartStacked[indicator]['targetHC']].length > 0 ? (
												<BarChartStacked
													height={175}
													labels = {{align: 'right'}}
													barCategories={{categories: ['Refugee Camp','Host Community']}}
													barSeries={{series: [
													{
														name: 'Over Target',
														data: [dataForBarChartStacked[indicator]['overTargetRC'], dataForBarChartStacked[indicator]['overTargetHC']],
														color: '#5aaa45'
													},
													{
														name: 'Remaining of Target',
														data: [(dataForBarChartStacked[indicator]['targetRC'] - dataForBarChartStacked[indicator]['totalRC']), 
																	 (dataForBarChartStacked[indicator]['targetHC'] - dataForBarChartStacked[indicator]['totalHC'])],
														color: '#e0e0e0'
													},
													{
														name: 'Total',
														data: [{y: dataForBarChartStacked[indicator]['totalRC'], color: '#cb6a37'}, 
																	 {y: dataForBarChartStacked[indicator]['totalHC'], color: '#2c8fbc'}]
													}]}}
												/>
											) : (
												<p>Insufficient Data for this bar chart, sorry!</p>
											)}
										</div>
										<div className="each-camp-total-chart">
											{
												dataForBarChartStacked[indicator]['totalRC'] ||
												dataForBarChartStacked[indicator]['totalHC'] > 0 ? (
												<ColumnChart
													seriesTitle={null}
													seriesData={dataForColumnChart[indicator]['seriesData']}
													categories={dataForColumnChart[indicator]['categories']}
													yAxisLabel={' '}
													chartHeight={300}
												/>
											) : (
												<div>{/*insufficient data, render nothing*/}</div>
											)}
										</div>
									</div>
								</div>
								)
						})}
					</div>
				</div>
			</div>
		);
	}
}

SummaryCampPerformance.propTypes = {
  currentSector: PropTypes.string.isRequired,
  currentSectorData: PropTypes.objectOf(PropTypes.any).isRequired
};

export default SummaryCampPerformance;