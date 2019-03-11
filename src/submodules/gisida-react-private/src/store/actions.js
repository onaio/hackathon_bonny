import * as types from './constants/actionTypes';

export const toggleSplitScreen = () => ({
  type: types.TOGGLE_SPLIT_SCREEN,
});

export const resetMapView = (reset) => ({
  type: types.RESET_MAP_VIEW,
  reset,
});

export const toggleDashboard = activeDashboard => ({
  type: types.TOGGLE_DASHBOARD,
  id: activeDashboard,
});

export const toggleSummaryView = viewSummary => ({
  type: types.TOGGLE_SUMMARY_VIEW,
  viewSummary,
});

export const addConfigs = configs => ({
  type: types.ADD_CONFIGS,
  configs,
});

export const activeTab = activeTab => ({
  type: types.ACTIVE_TAB,
  activeTab,
});

export const initSummary = config => ({
  type: types.INIT_SUMMARY,
  config,
});

export const toggleFilter = () => ({
  type: types.TOGGLE_INFO_FILTER,
});

export const buildSectorsObj = (sector, sectorId) => ({
  type: types.BUILD_SECTORS_OBJ,
  sector,
  sectorId
});

export const updateFilters = (sectorId) => ({
  type: types.UPDATE_FILTERS,
  sectorId,
});

export const infosaveFilterState = (sectorId, filterState, isClear) => ({
  type: types.INFO_SAVE_FILTER_STATE,
  sectorId,
  filterState,
  isClear,
});

export default {
  toggleSplitScreen,
  toggleDashboard,
  resetMapView,
  addConfigs,
  activeTab,
  toggleSummaryView,
  toggleFilter,
  buildSectorsObj,
  updateFilters,
  infosaveFilterState,
};
