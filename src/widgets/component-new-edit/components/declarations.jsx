import React from 'react';
import { Field, FormSection } from 'redux-form';
import PropTypes from 'prop-types';

import { defaultState } from '../model/declaration';

import Select from 'forms/controls/select';
import GenericOption from 'forms/controls/generic-option';
import { TextareaWithVariableAutoCompletion } from 'forms/controls/control-with-suggestions';
import { ListWithInputPanel } from 'widgets/list-with-input-panel';
import { validateDeclarationForm } from 'utils/validation/validate';

import Dictionary from 'utils/dictionary/dictionary';
import { TABS_PATHS, DEFAULT_FORM_NAME } from 'constants/pogues-constants';

// Utils

const validateForm = (setErrors, validate) => values => {
  return validate(values, setErrors);
};

// Prop types and default props

export const propTypes = {
  formName: PropTypes.string,
  selectorPath: PropTypes.string,
  errors: PropTypes.array,
  showPosition: PropTypes.bool,
  setErrors: PropTypes.func.isRequired,
};

export const defaultProps = {
  formName: DEFAULT_FORM_NAME,
  selectorPath: TABS_PATHS.DECLARATIONS,
  errors: [],
  showPosition: true,
};

// Component

function Declarations({ formName, selectorPath, errors, showPosition, setErrors }) {
  return (
    <FormSection name={selectorPath}>
      <ListWithInputPanel
        formName={formName}
        selectorPath={selectorPath}
        name="declarations"
        errors={errors}
        validateForm={validateForm(setErrors, validateDeclarationForm)}
        resetObject={defaultState}
      >
        <Field
          name="label"
          id="declaration_text"
          component={TextareaWithVariableAutoCompletion}
          label={Dictionary.declaration_label}
          required
        />

        <Field name="declarationType" id="declaration_type" component={Select} label={Dictionary.type} required>
          <GenericOption key="INSTRUCTION" value="INSTRUCTION">
            {Dictionary.INSTRUCTION}
          </GenericOption>
          <GenericOption key="COMMENT" value="COMMENT">
            {Dictionary.COMMENT}
          </GenericOption>
          <GenericOption key="HELP" value="HELP">
            {Dictionary.HELP}
          </GenericOption>
          <GenericOption key="WARNING" value="WARNING">
            {Dictionary.WARNING}
          </GenericOption>
        </Field>

        {showPosition && (
          <Field
            name="position"
            id="declaration_position"
            component={Select}
            label={Dictionary.declaration_position}
            required
          >
            <GenericOption key="AFTER_QUESTION_TEXT" value="AFTER_QUESTION_TEXT">
              {Dictionary.dclPosAfterQuestion}
            </GenericOption>
            <GenericOption key="AFTER_RESPONSE" value="AFTER_RESPONSE">
              {Dictionary.dclPosAfterAnswer}
            </GenericOption>
            <GenericOption key="BEFORE_QUESTION_TEXT" value="BEFORE_QUESTION_TEXT">
              {Dictionary.dclPosBeforeText}
            </GenericOption>
            <GenericOption key="DETACHABLE" value="DETACHABLE">
              {Dictionary.dclPosDetachable}
            </GenericOption>
          </Field>
        )}
      </ListWithInputPanel>
    </FormSection>
  );
}

Declarations.propTypes = propTypes;
Declarations.defaultProps = defaultProps;

export default Declarations;
