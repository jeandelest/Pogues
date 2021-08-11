import React from 'react';
import PropTypes from 'prop-types';

import {
  QuestionnaireNewEdit,
  Questionnaire,
} from 'widgets/questionnaire-new-edit';
import { validateQuestionnaireForm } from 'utils/validation/validate';

// PropTypes and defaultProps

export const propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  stamp: PropTypes.string.isRequired,
  createQuestionnaire: PropTypes.func.isRequired,
  createEnoParameters: PropTypes.func.isRequired,
  setErrors: PropTypes.func.isRequired,
};

// Utils

function validateAndSubmit(
  action,
  validate,
  transformer,
  onSuccess,
  token,
  createParams,
) {
  return function (values) {
    validate(values);

    const params = {
      idQuestionnaire: transformer.formToState(values).id,
      context: values.contextQuestionnaire,
    };
    createParams(params, token);

    return action(transformer.formToState(values), token).then(result => {
      const {
        payload: { id },
      } = result;
      if (onSuccess) onSuccess(id);
    });
  };
}

// Component

function QuestionnaireNew({
  onCancel,
  onSuccess,
  stamp,
  token,
  createQuestionnaire,
  setErrors,
  createEnoParameters,
}) {
  const validate = setErrorsAction => values =>
    validateQuestionnaireForm(values, setErrorsAction);

  // Initial values

  const initialState = { owner: stamp };
  const questionnaireTransformer = Questionnaire(initialState);
  const initialValues = questionnaireTransformer.stateToForm();

  // Validation and submit

  return (
    <QuestionnaireNewEdit
      onCancel={onCancel}
      initialValues={initialValues}
      onSubmit={validateAndSubmit(
        createQuestionnaire,
        validate(setErrors),
        questionnaireTransformer,
        onSuccess,
        token,
        createEnoParameters,
      )}
    />
  );
}

QuestionnaireNew.propTypes = propTypes;

export default QuestionnaireNew;
