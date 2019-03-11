import React from 'react';
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
import { Actions } from 'gisida';
import { toggleDashboard } from '../../store/actions';


const mapStateToProps = (state, ownProps) => {
  return {
    id: ownProps.id,
    VIEW: state.VIEW,
    DASHBOARD: state.DASHBOARD,
    dashboardConfigs: state.DASHBOARD.configs
  }
}

class SummaryPageToggle extends React.Component {
  onToggleClick (e) {
    e.preventDefault();
    const { dispatch, id, DASHBOARD } = this.props;
    if (DASHBOARD.activeDashboard === id) {
      dispatch(toggleDashboard(null));
    } else {
      dispatch(toggleDashboard(id));
    }
  }

  render() {
    const { dashboardConfigs } = this.props;
    return Object.keys(dashboardConfigs).length > 0 ? (
      <li>
        <a
          href="#"
          onClick={ (e) => { this.onToggleClick(e)} }
        >
          <span className="glyphicon glyphicon-stats" />
        </a>
      </li>
    ) : null;
  }
}

SummaryPageToggle.propTypes = {
};

export default connect(mapStateToProps)(SummaryPageToggle);
