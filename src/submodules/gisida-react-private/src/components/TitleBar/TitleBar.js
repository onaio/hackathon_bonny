import React from 'react';
import { connect } from 'react-redux';
import Cookie from 'js-cookie';
import PropTypes from 'prop-types';
import { Actions } from 'gisida';
// import Cookie from 'js-cookie';
import './TitleBar.scss';


const logOut = (e) => {
  e.preventDefault();
  Cookie.set('dsauth', false);
  location.reload();
};


const mapStateToProps = (state, ownProps) => {
  return {
    appConfig: state.APP,
    MAP: state.MAP,
  }
}

class TitleBar extends React.Component {

handleSplitScreen() {
    const dispatch = this.props.dispatch;
    dispatch(Actions.toggleSplitScreen());
}

render() {
  const { appConfig } = this.props;

  return (
    <div className="noprint">
    {appConfig.loaded ?
      (<div className="menu" id="menu" style={{ background: appConfig.appColor }}>
        <div className="brand">
          <img src={appConfig.appIcon} alt="UKAID" className="brand-icon" />
          <div className="brand-title">
            <span className="white">{appConfig.appName}</span>&nbsp;&nbsp; {appConfig.appNameDesc}</div>
        </div>
        <ul>
          {this.props.children}
        </ul>
        {
          <a className="sign-out" onClick={logOut} role="button" tabIndex={0}>
            <span className="glyphicon glyphicon-log-out" />
          </a>
        }
        <a
          className="ona-logo"
          href="http://www.ona.io/"
          alt="Powered by ONA"
          title="Powered by ONA"
          target="_blank"
          rel="noopener noreferrer"
        >Powered by
        </a>
        </div>) : ''}
      
    </div>
    );
  }
}

TitleBar.propTypes = {
  appConfig: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default connect(mapStateToProps)(TitleBar);
