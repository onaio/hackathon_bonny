import {infosaveFilterState} from '../../../store/actions';

export default function clearFilterState(filterState, sectorId, dispatch, isClear) {
  dispatch(infosaveFilterState(sectorId, filterState, isClear));
}
