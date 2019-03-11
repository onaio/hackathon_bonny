import React from 'react';
import PropTypes from 'prop-types';

class SummaryNav extends React.Component {
  constructor(props) {
    super(props);

    const { currentSector, navItems } = this.props;

    this.state = {
      currentSector,
      navItems: navItems,
    };
    this.handleChangeSector = this.handleChangeSector.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { currentSector, navItems } = nextProps;

    this.setState({
      currentSector,
      navItems: navItems,
    });
  }

  handleChangeSector(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.changeSector(e);
  }

  render() {
    const { currentSector } = this.state;
    const { handleChangeSector } = this;

    const navItems = this.state.navItems.map(item =>
      (<li key={item} className={currentSector === item ? 'active' : ''}>
        <a
          id={item.replace(/\//g, '-').replace(/ /g, '-')}
          href="#" onClick={handleChangeSector}
          data-key={item}
        >{item}</a>
      </li>),
    );

    return (
      <div className="summary-nav">
        <ul>
        <li
          key="overview"
          className={this.props.isOverviewPage ? 'active' : ''}>
          <a
            id="overview"
            href="#"
            onClick={handleChangeSector}
            data-key="Overview">
            Overview
          </a>
        </li>
          {navItems}
        </ul>
      </div>
    );
  }
}

SummaryNav.propTypes = {
  currentSector: PropTypes.string.isRequired,
  navItems: PropTypes.arrayOf(PropTypes.any).isRequired,
  // changeSector: PropTypes.func.isRequired,
};

export default SummaryNav;
