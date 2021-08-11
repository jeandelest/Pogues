import {
  LOAD_ENO_PARAMETERS_SUCCESS,
  UPDATE_ENO_PARAMETERS,
} from 'actions/enoParameters';
import { createActionHandlers } from 'utils/reducer/actions-handlers';

const actionHandlers = {};

export function loadEnoParameters(state, params) {
  return {
    ...state,
    ...params,
  };
}

export function updateEnoParameters(state, updatedContext) {
  const { context } = updatedContext;
  return {
    ...state,
    context: context,
  };
}

actionHandlers[LOAD_ENO_PARAMETERS_SUCCESS] = loadEnoParameters;
actionHandlers[UPDATE_ENO_PARAMETERS] = updateEnoParameters;

export default createActionHandlers(actionHandlers);
