export const defaultState = {
  VIEW: {
    splitScreen: false,
    dashboard: null,
    showMap: true
  },
  DASHBOARD: {
    activeDashboard: false,
    activeTab: 'Overview',
    joinCSV: '/data/180320_Outline_Rohingya_refugee_camps_sites_centroids.csv',
    tabs: [],
    isSplash: true,
    viewSummary: false,
    summary: '/config/summary.json',
    configs: {},
    forms: {},
    showFilter: false,
    sectorsObj: {},
  },
  INFOFILTER: {
    
  }
};

export default defaultState;
