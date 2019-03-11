import React from 'react';
import PropTypes from 'prop-types';

require('./ProgressMetric.scss');

class ProgressMetric extends React.Component {

  static getPercentages(actual, target) {
    // Determine percentage of metric (Actual / Target)%
    let percentWidth = 0;
    let percentRound = 0;

    // if denominator of 0, don't do math...
    if (target === 0) {
      // if numerator isn't 0, fill all progress icons
      if (actual !== 0) {
        percentRound = actual.toLocaleString();
        percentWidth = 100;
      }

      return {
        rowIconCounts: [10],
        percentWidths: [percentWidth],
        percentRound,
      };
    }

    // a float reference of the actual progress percentage
    const percentLiteral = (actual / target) * 100;
    // an integer fo the percentage used for lthe label
    percentRound = Math.round(percentLiteral);


    const percentWidths = []; // array to stash widths of each row
    const rowIconCounts = []; // array to stash icon counts of each row
    let iconCount = Math.ceil(percentRound / 10); // eg - 101% => 11 icons
    let c = 0; // counter for icons
    let p = percentLiteral; // counter for total amount of percentage
    let isLastRow = false;
    let isFirstRow = true;

    // run through the total count of icons
    while (iconCount) {
      // reference determining if this row is the last
      isLastRow = iconCount <= 10;

      // determine the icon count for this row
      c = isLastRow ? iconCount : 10;
      rowIconCounts.push(isFirstRow ? 10 : c);

      // determine the width percentage for the rows div.over
      percentWidth = isLastRow ?
        ProgressMetric.calculateWidthPercentage((p / 10), isFirstRow ? 10 : c) : 100;

      percentWidths.push(percentWidth);

      if (isFirstRow) isFirstRow = false;
      // reduce the total percentage counter by the width of the row
      p -= percentWidth;
      // reduce the total count of icons needing to be rendered
      iconCount -= c;
    }

    // return both onto this.state.percentages
    return {
      rowIconCounts,
      percentWidths,
      percentRound,
    };
  }

  // An agorithm for showing more accurate progress indicators
  // by accounting for the whitespace between icons.
  // Example (7.1, 10) => Result  (72.735%)
  static calculateWidthPercentage(actual, target) {
    const basePercentage = actual / target; // .710
    const iconPercentage = 26 / 46 / 10; // 0.0565 - percentage of total space taken by an icon
    const leftPercentage = 10 / 46 / 10; // 0.0217 - percentage of space taken by whitespace

    const fullIconCount = Math.floor(basePercentage * 10); // 7
    const remainingPerc = basePercentage - (fullIconCount / 10); // 0.010

    let actualPercentage = 0;

    actualPercentage += (fullIconCount / 10); // 0.7000
    actualPercentage += leftPercentage; // .7217 = .7000 + .0217
    actualPercentage += ((remainingPerc * 10) * iconPercentage); // .72735 = .7217 + ((.1) * .0565)

    return actualPercentage * 100; // 72.735(%)
  }

  constructor(props) {
    super(props);
    const { type, iconDir } = this.props;
    const { iconFilename, label, actual, target, description, male, female } = this.props.metricData;

    this.buildProgressRows = this.buildProgressRows.bind(this);
    this.buildLIs = this.buildLIs.bind(this);

    this.state = {
      type,
      label,
      actual,
      target,
      description,
      male,
      female,
      iconSrc: iconDir && iconFilename ? `${iconDir}${iconFilename}` : null,
      iconAlt: `Icon for ${label}`,
      percentages: ProgressMetric.getPercentages(actual, target),
    };
  }

  componentWillReceiveProps(nextProps) {
    const { type, iconDir, isOverviewPage, isPercent } = nextProps;
    const { iconFilename, label, actual, target, description, male, female } = nextProps.metricData;
    this.setState({
      type,
      label,
      actual,
      target,
      male,
      female,
      description,
      isOverviewPage,
      isPercent,
      iconSrc: iconDir && iconFilename ? `${iconDir}${iconFilename}` : null,
      iconAlt: `Icon for ${label}`,
      percentages: ProgressMetric.getPercentages(actual, target),
    });
  }

  buildLIs(r, count, position) {
    let c = count;
    const LIs = []; // array of react li elements for each row
    const svgSrc = position === 'under' ? 'person-icon-gray' :
      r ? 'person-icon-green' : 'person-icon-blue';

    while (c) {
      LIs.push(<li key={c.toString()}>
        <img alt="Progress Icon" src={`${this.props.iconDir}${svgSrc}.svg`} />
      </li>);
      c -= 1;
    }

    return LIs;
  }

  buildProgressRows(percentages) {
    const { rowIconCounts, percentWidths } = percentages;

    // if no progress has been made, return a single 'under' row
    if (!rowIconCounts.length) {
      return [(
        <div key={0} className="progress-row clearfix">
          <div className="under">
            <ul>
              {this.buildLIs(0, 10, 'under')}
            </ul>
          </div>
        </div>
      )];
    }

    const rows = []; // array of react row elements to return
    let row = <div />;
    let c = 0; // counter for icons

    // loop through all the rows in rowIconCounts
    for (let r = 0; r < rowIconCounts.length; r += 1) {
      // if it's the first row, always render 10 icons
      c = !r ? 10 : rowIconCounts[r];

      // define the width style of the row's 'over' div to show progress
      const progressOverStyle = { width: `${percentWidths[r]}%` };

      // build the row as a compound react element
      row = (
        <div key={r.toString()} className="progress-row clearfix">
          <div className="under">
            <ul>
              {this.buildLIs(r, c, 'under')}
            </ul>
          </div>
          <div className="over">
            <ul className={r ? 'extra' : ''} style={progressOverStyle}>
              {this.buildLIs(r, c, 'over')}
            </ul>
          </div>
        </div>
      );

      // push the row into its array for rendering
      rows.push(row);
    }

    return rows;
  }

  buildCircleLIs(count, limit) {
    let c = count;
    const LIs = [];
    for (let x = 0; x < c; x += 1) {
      LIs.push(
        <li key={x} className={`progress-circle ${limit}`}>
        </li>
      );
    }

    return LIs;
  }

  render() {
    if (!this.props && !this.props.metricData) {
      return null;
    }
    const { type, label, actual, target, iconSrc, iconAlt, percentages, description, male, female } = this.state;

    const { isOverviewPage, isSectorLevel } = this.props;

    // so icons level up
    let lineHeight = '72px';
    if(isOverviewPage || isSectorLevel) {
      lineHeight = '19px';
    }

    const progressRows = this.buildProgressRows(percentages);
    const isPercent = !(typeof percentages.percentRound === 'string');
    const percentClass = `progress-percent ${isPercent
      ? (percentages.percentRound >= 100 ? 'green' : '')
      : 'actual'}`
      ;

    let indicatorsRow = null;
    const { percentRound } = percentages;

    if (this.props.metricData && this.props.metricData.indicators) {
      const { indicators } = this.props.metricData;
      indicatorsRow = indicators.map((i, x) =>
        (<div
          className="indicator-row"
          key={x}>
          <div className="indicator-progress-wrapper">
            <span>
              {i.label}
            </span>
            <div className="indicator-icon-wrapper">
              <img src={iconSrc} />
              <span className="indicator-percentage">
                {`${percentages.percentRound}%`}
              </span>
            </div>
            <div className="progress-row clearfix">
              <div className="progress-under">
                <ul>
                  {this.buildCircleLIs(10, 'under')}
                </ul>
              </div>
              <div className="progress-over">
                <ul style={{ width: `${percentRound}%` }}>
                  {this.buildCircleLIs(10, 'over')}
                </ul>
              </div>
            </div>
            <span className="progress-numbers">
              <span className="actual">{i.actual}</span>
              &nbsp;out of
              <span className="target">{i.target}</span>
              &nbsp;target
            </span>
          </div>
        </div>
        ));
    }

    return (
      <div
        className={`${type} ${isOverviewPage ? 'pointer' : ''}`}
        onClick={(e) => { this.props.changeSector(e, isOverviewPage) }}
        data-key={label}>
        {label ? (
          <div className="label-wrapper" style={{height: lineHeight}}>
            <span>{label}</span>
            {!!description ? (
              <div className="description">
                <span className="glyphicon glyphicon-info-sign" />
                <p>{description}</p>
              </div>
            ) : ''}
          </div>
        ) : ''}
        <div className={`icon-wrapper${!iconSrc ? ' empty' : ''}`}>
          {iconSrc ? <img src={iconSrc} alt={iconAlt} /> : ''}
        </div>
        <div className="progress-wrapper">
          {progressRows}
        </div>
        <div className="stats-wrapper">
          <span className={percentClass}>
            {`${percentages.percentRound}${isPercent ? '%' : ''}`}
          </span>
          <span className={`${isOverviewPage || isSectorLevel ? '' : 'progress-actual'}`}>Total:&nbsp;
            <span>{actual.toLocaleString()}</span>
          </span>
          <span className={`${isOverviewPage || isSectorLevel ? '' : 'progress-target'}`}>
            Target:&nbsp;
            <span>{target.toLocaleString()}</span>
          </span>
          {(Number.isInteger(male) && Number.isInteger(female)) ?
            <div className="gender-wrapper">
              <span>Male:&nbsp;
                <span>{`${male.toLocaleString()}${this.state.isPercent ? '%' : ''}`}</span>
              </span>
              <span>
                Female:&nbsp;
                <span>{`${female.toLocaleString()}${this.state.isPercent ? '%' : ''}`}</span>
              </span>
            </div> : null}
        </div>
        {this.props.isOverviewPage ?
          <div className="indicator-container">
            {indicatorsRow}
          </div> : null}
      </div>
    );
  }
}

ProgressMetric.propTypes = {
  iconDir: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  metricData: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default ProgressMetric;
