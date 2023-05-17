import merge from 'lodash.merge';
import cloneDeep from 'lodash.clonedeep';
import { defaultTypageForm } from './typage';

export const defaultState = {};

export const defaultForm = {
  mandatory: false,
  ...defaultTypageForm,
};

export function formToState(form) {
  const { type, mandatory, [type]: simpleForm, id } = form;

  return {
    id,
    type,
    mandatory,
    [type]: { ...simpleForm },
  };
}

export function stateToForm(currentState) {
  const { mandatory, type, [type]: simpleState, id } = currentState;

  return merge(cloneDeep(defaultForm), {
    id,
    mandatory,
    type,
    [type]: {
      ...simpleState,
    },
  });
}

const Factory = (initialState = {}) => {
  let currentState = merge(cloneDeep(defaultForm), initialState);

  return {
    formToState: form => {
      const state = formToState(form);
      currentState = merge(cloneDeep(currentState), state);
      return state;
    },
    stateToForm: () => {
      return stateToForm(currentState);
    },
    getNormalizedValues: form => {
      // Values ready to be validated
      const { type, [type]: simpleType } = form;

      return {
        type,
        [type]: simpleType,
      };
    },
  };
};

export default Factory;
