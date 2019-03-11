import defaultState from './defaultState';
import * as types from './constants/actionTypes';

function VIEW(state = defaultState.VIEW, action) {
  switch (action.type) {
    case types.TOGGLE_SPLIT_SCREEN:
      return {
        ...state,
        splitScreen: !state.splitScreen,
        showMap: true,
    };
    case types.RESET_MAP_VIEW:
      return {
        ...state,
        splitScreen: action.reset,
        showMap: true,
      };
    case types.TOGGLE_DASHBOARD:
      return {
        ...state,
        showMap: action.id ? !state.showMap : true,
        activeDashboard: action.id || null,
      }
    default:
      return state;
  }
}

function DASHBOARD (state = defaultState.DASHBOARD, action) {
  switch (action.type) {
    case types.TOGGLE_DASHBOARD: {
      return {
        ...state,
        activeDashboard: action.id || null,
        viewSummary: false,
      };
    }
    case types.TOGGLE_SUMMARY_VIEW: {
      return {
        ...state,
        viewSummary: action.viewSummary,
        activeDashboard: null,
      };
    }

    case types.RESET_MAP_VIEW: {
      return {
        ...state,
        activeDashboard: null,
      };
    }

    case types.ADD_CONFIGS: {
      const { configs } = action;
      return {
        ...state,
        configs: {
          ...configs,
        },
      };
    }

    case types.ACTIVE_TAB: {
      const { activeTab } = action;
      return {
        ...state,
        activeTab: activeTab,
      };
    }

    case types.INIT_SUMMARY: {
      return {
        ...state,
        [action.id]: {
          ...action.config
        },
      }
    }

    case types.TOGGLE_INFO_FILTER: {
      
      const {showFilter} = state;
      return {
        ...state,
        showFilter: !showFilter,
      }
    }

    case types.BUILD_SECTORS_OBJ: {
      const { sector, sectorId } = action;
      const allSecs = {};
      if (sector && sectorId) {
        if (!allSecs[sectorId]) {
          allSecs[sectorId] = {};
        }
        allSecs[sectorId] = {
          ...sector
        };
      }
      return {
        ...state,
        sectorsObj: {
          ...state.sectorsObj,
          ...allSecs,
        }
      }
    }
    default:
      return state;
  }
}

function INFOFILTER (state = defaultState.INFOFILTER, action) {
  switch (action.type) {
    case types.INFO_SAVE_FILTER_STATE: {

      return {
        ...state,
        [action.sectorId]: {
          ...action.filterState,
          doUpdate: action.isClear ? (action.filterState && action.filterState.doUpdate) : true,
          isClear: action.isClear || false,
        },
      };
    }
    case types.UPDATE_FILTERS: {
      const sectors = {};
      if (action.sectorId) {
        if (!sectors[action.sectorId]) {
          sectors[action.sectorId] = {}
        }
        sectors[action.sectorId] = {
          ...state[action.sectorId],
          doUpdate: typeof (state && state[action.sectorId] 
                          && state[action.sectorId].doUpdate) !== "undefined",
        };
      }
      return {
        ...state,
        ...sectors,
      };
    }
    default:
      return state;
  }
}

export default {
   VIEW,
   DASHBOARD,
   INFOFILTER
};
