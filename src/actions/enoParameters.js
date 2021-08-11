import { getEnoParameters, postEnoParameters } from 'utils/remote-api';

export const CREATE_ENO_PARAMETERS = 'CREATE_ENO_PARAMETERS';
export const CREATE_ENO_PARAMETERS_SUCCESS = 'CREATE_ENO_PARAMETERS_SUCCESS';
export const CREATE_ENO_PARAMETERS_FAILURE = 'CREATE_ENO_PARAMETERS_FAILURE';
export const LOAD_ENO_PARAMETERS = 'LOAD_ENO_PARAMETERS';
export const LOAD_ENO_PARAMETERS_START = 'LOAD_ENO_PARAMETERS_START';
export const LOAD_ENO_PARAMETERS_SUCCESS = 'LOAD_ENO_PARAMETERS_SUCCESS';
export const LOAD_ENO_PARAMETERS_FAILURE = 'LOAD_ENO_PARAMETERS_FAILURE';
export const UPDATE_ENO_PARAMETERS = 'UPDATE_ENO_PARAMETERS';

/**
 * Load eno parameters start
 *
 *  * It's executed before the remote fetch of the eno parameters.
 *
 * @return  {object}       LOAD_ENO_PARAMETERS_START action
 */
export const loadEnoParametersStart = () => ({
  type: LOAD_ENO_PARAMETERS_START,
  payload: {},
});

/**
 * Load eno parameters success
 *
 * It's executed after the remote fetch of the eno parameters.
 *
 * @param   {object} params The values of eno parameters.
 * @return  {object}        LOAD_ENO_PARAMETERS_SUCCESS action.
 */
export const loadEnoParametersSuccess = params => ({
  type: LOAD_ENO_PARAMETERS_SUCCESS,
  payload: {
    ...params,
  },
});

/**
 * Load questionnaire failure
 *
 * It's executed after the fail of a remote eno parameters' fetch.
 *
 * @param   {string} id    The questionnaire id
 * @param   {string} err   The error returned for the fetch process.
 * @return  {object}       LOAD_ENO_PARAMETERS_FAILURE action
 */
export const loadEnoParametersFailure = (id, err) => ({
  type: LOAD_ENO_PARAMETERS_FAILURE,
  payload: { id, err },
});

/**
 * Load questionnaire
 *
 * Asyc action that fetch a eno parameters for the questionnaire.
 *
 * @param   {string}    id  The questionnaire id.
 * @return  {function}      Thunk which may dispatch LOAD_ENO_PARAMETERS_SUCCESS or LOAD_ENO_PARAMETERS_FAILURE
 */
export const loadEnoParameters = (id, token) => dispatch => {
  dispatch(loadEnoParametersStart());
  dispatch({
    type: LOAD_ENO_PARAMETERS,
    payload: id,
  });
  return getEnoParameters(id, token)
    .then(p => {
      dispatch(loadEnoParametersSuccess(p));
    })
    .catch(err => {
      dispatch(loadEnoParametersFailure(id, err));
    });
};

/**
 * Create Eno parameters success
 *
 * It's executed after the remote creation of an entry of eno parameters.
 *
 * @param   {object}  LOAD_ENO_PARAMETERS  The new values to save in database.
 * @return  {object}          CREATE_QUESTIONNAIRE_SUCCESS action
 */
export const createEnoParametersSuccess = params => ({
  type: CREATE_ENO_PARAMETERS_SUCCESS,
  payload: {
    params,
  },
});

/**
 * Create Eno parameters failure
 *
 * @param   {string}  err The error returned for the creation process.
 * @return  {object}      CREATE_ENO_PARAMETERS_FAILURE action
 */
export const createEnoParametersFailure = err => ({
  type: CREATE_ENO_PARAMETERS_FAILURE,
  payload: err,
});

/**
 * Create an entry for eno parameters in database
 *
 * Asyc action that creates a questionnaire.
 *
 * @param   {string}   name  The questionnaire name.
 * @param   {string}   label The questionnaire label.
 * @return  {function}       Thunk which may dispatch CREATE_ENO_PARAMETERS_SUCCESS or CREATE_ENO_PARAMETERS_FAILURE
 */
export const createEnoParameters = (params, token) => dispatch => {
  dispatch({
    type: CREATE_ENO_PARAMETERS,
    payload: params,
  });
  return postEnoParameters(params, token)
    .then(p => {
      dispatch(createEnoParametersSuccess(p));
    })
    .catch(err => {
      dispatch(createEnoParametersFailure(params.idQuestionnaire, err));
    });
};

/**
 * Update eno parameters
 *
 * It updates the store "enoParameters" with the data passed.
 *
 * @return {object}       UPDATE_ENO_PARAMETERS action
 */
export const updateEnoParameters = updatedState => {
  const { context } = updatedState;
  return {
    type: UPDATE_ENO_PARAMETERS,
    payload: {
      context,
    },
  };
};
