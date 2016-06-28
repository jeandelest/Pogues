/**
 * Keep track of code list created within a questionnaire (ignore code list
 * specifiactions)
 */

//This reducer will not update if we remove the only response using a code
//list.
//TODO implement remove code list (with integrity controls to check if the
//code list is not used by any response)
import { CREATE_CODE_LIST } from '../actions/code-list'
import { CREATE_QUESTIONNAIRE, LOAD_QUESTIONNAIRE_SUCCESS } from '../actions/questionnaire'

export default function (state={}, action) {
  if (action.type === CREATE_QUESTIONNAIRE) {
    return {
      ...state,
      [action.payload.id]: []
    }
  }
  else if (action.type === CREATE_CODE_LIST) {
    const { id, qrId } = action.payload
    return {
     ...state,
      [qrId]: [...state[qrId], id]
    }
  }
  else if (action.type === LOAD_QUESTIONNAIRE_SUCCESS) {
    return {
      ...state,
      ...action.payload.update.codeListByQuestionnaire
    }
  }
  return state
}