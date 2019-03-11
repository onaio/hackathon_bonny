import React from 'react'
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { initStore } from 'gisida';
// Gisida React Components
import {
  App,
  Map,
  Menu,
  StyleSelector,
  Legend,
  SummaryChart,
  DetailView,
  Filter,
  TimeSeriesSlider,
  Spinner,
  LocationController,
} from 'gisida-react';
// Gisida React Private Components
import TitleBar from './submodules/gisida-react-private/src/components/TitleBar/TitleBar';
import MapToggle from './submodules/gisida-react-private/src/components/TitleBar/MapToggle';
import RefreshToggle from './submodules/gisida-react-private/src/components/TitleBar/RefreshToggle';
import ProfileView from './submodules/gisida-react-private/src/components/Lotfa/ProfileView';

// LOTFA Private Components
import Login, { isLoggedIn } from './submodules/gisida-react-private/src/components/Login/Login'; 
import reducers from './submodules/gisida-react-private/src/store/reducers';

const store = initStore(reducers);
const rootElement = document.getElementById('root');
// require('bootstrap-loader');
require('bootstrap-sass');
require('bootstrap-sass/assets/stylesheets/_bootstrap.scss');

if (isLoggedIn()) {
  ReactDOM.render((
    <Provider store={store}>
      <App>
        <TitleBar>
          <MapToggle />
          <RefreshToggle />
        </TitleBar>
        <Map mapId="map-1">
          <Menu><LocationController /></Menu>
          <TitleBar />
          <StyleSelector />
          <Legend />
          <Filter />
          <SummaryChart />
          <TimeSeriesSlider />
          <Spinner />
          <DetailView>
            <ProfileView parentstate/>
          </DetailView>
        </Map>
      </App>
    </Provider>
  ), rootElement);
} else {
  ReactDOM.render((
    <Provider store={store}>
      <Login />
    </Provider>
  ), rootElement)
}
