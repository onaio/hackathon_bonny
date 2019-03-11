import React from 'react';
import PropTypes from 'prop-types';
import Highcharts from 'highcharts';

class BarChartStacked extends React.Component {

  static tooltipPointFormatter() {
    return `<b>${this.series.name}:</b> ${this.y.toLocaleString()}`;
  }

  static alttooltipPointFormatter() {
    return `<b>${this.series.name}:</b> ${'$' + this.y.toLocaleString()}`
  }

  static stackLabelsFormatter() {
    // Custom formatting to get the label below the bar as designed
    const over = this.axis.series[0].yData[this.x];
    const actual = this.axis.series[2].yData[this.x] + over;
    const planned = this.axis.series[1].yData[this.x] + this.axis.series[2].yData[this.x];
    let percent = 0;

    // Color to be used in styling the resulting percentage
    const color = actual > planned ? '#66ba4b' : '#349ac4';

    // Handle missing / zero data situations
    if (planned !== 0) {
      percent = Math.floor((actual / planned) * 100).toLocaleString();
    } else if (planned === 0 && actual !== 0) {
      percent = 'NaN';
    }

    return `${actual.toLocaleString()} of ${planned.toLocaleString()} planned <span style="color:${color};">(${percent}%)</span>`;
  }

  static altStackLabelsFormatter() {
    const carried_over = this.axis.series[2].yData[this.x];
    const gap = this.axis.series[0].yData[this.x];
    const received = this.axis.series[1].yData[this.x];
    const total = [carried_over, gap, received].reduce((a, b) => a + b, 0);
    const color = received > total ? '#66ba4b' : '#349ac4'
    const percent = Math.round((gap / total) * 100).toLocaleString();
    const allocated = [carried_over, received].reduce((a, b) => a + b, 0);
    const percentAllocated = Math.round((allocated / total) * 100).toLocaleString();

    return `<span style="color:#969696;">${'Funding Gap: $' + gap.toLocaleString()} of ${'$' + total.toLocaleString()} planned </span><span style="color:${color};">(${percent}%)</span>
    <br/><span style="color:#969696;">Allocated Amount: ${'$' + allocated.toLocaleString()}</span><span style="color:${color};"> (${percentAllocated}%)</span>`;
  }

  constructor(props) {
    super(props);


    const { groupPadding, labelPlacement, pointPlacement, showLegend, labels, barCategories, barSeries, width, height, isFundingChart } = this.props;

    this.state = {
      chart: {
        type: 'bar',
        height: height || 300,
        width: width || null,
      },
      title: {
        text: null,
      },
      tooltip: {
        headerFormat: '',
        pointFormatter: isFundingChart
        ? BarChartStacked.alttooltipPointFormatter
        : BarChartStacked.tooltipPointFormatter,
      },
      xAxis: {
        categories: barCategories.categories,
        labels: labels,
      },
      yAxis: {
        min: 0,
        title: {
          text: null,
        },
        stackLabels: {
          enabled: true,
          align: 'left',
          verticalAlign: 'bottom',
          y: labelPlacement || 15,
          formatter: isFundingChart
          ? BarChartStacked.altStackLabelsFormatter
          : BarChartStacked.stackLabelsFormatter,
        },
      },
      legend: {
        enabled: showLegend || false,
        reversed: true,
      },
      plotOptions: {
        bar: {
          pointPlacement: pointPlacement || 0,
          groupPadding: groupPadding || 0.2,
          cursor: 'pointer',
          stacking: 'normal',
          dataLabels: {
            enabled: false,
          },
        },
      },
      series: barSeries.series,
      credits: {
        enabled: false,
      },
    };
  }

  componentDidMount() {
    this.chart = Highcharts.chart(this.chartEl, this.state);
  }

  componentWillReceiveProps(nextProps) {
    if (this.chart) {
      this.chart.destroy();
    }
    const { labels, barSeries, barCategories } = nextProps;
    this.setState({
      series: barSeries.series,
      xAxis: {
        categories: barCategories.categories,
        labels: labels,
      }
    });
  }

  componentDidUpdate() {
    this.chart = Highcharts.chart(this.chartEl, this.state);
  }

  componentWillUnmount() {
    if (this.chart) {
        this.chart.destroy();
    }
  }

  render() {
    return <div ref={(el) => { this.chartEl = el; }} />;
  }
}

BarChartStacked.propTypes = {
  barCategories: PropTypes.objectOf(PropTypes.any).isRequired,
  barSeries: PropTypes.objectOf(PropTypes.any).isRequired,
  height: PropTypes.number,
  width: PropTypes.number

};

export default BarChartStacked;