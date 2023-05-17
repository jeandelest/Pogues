import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { ComponentWithValidation } from 'widgets/component-with-validation';
import Input from 'forms/controls/input';
import { fieldArrayMeta } from 'utils/proptypes-utils';
import { WIDGET_CODES_LISTS } from 'constants/dom-constants';
import Dictionary from 'utils/dictionary/dictionary';
import { RichEditorWithVariable } from 'forms/controls/control-with-suggestions';

const {
  CODE_INPUT_CLASS,
  CODE_INPUT_CODE_CLASS,
  CODE_INPUT_LABEL_CLASS,
  CODE_INPUT_ACTIONS_CLASS,
  CODE_INPUT_ERRORS_CLASS,
  CODE_INPUT_CODE_CLASS_PRECISION,
} = WIDGET_CODES_LISTS;

function CodesListsInputCode({
  path,
  formName,
  change,
  precisionShow,
  Question,
  code,
  push,
  clear,
  close,
  remove,
  meta,
}) {
  const [firstField, setFirstField] = useState(null);
  const [errorsToShow, setErrorsToShow] = useState([]);

  const executeIfValid = useCallback(
    action => {
      setErrorsToShow(meta.error || []);
      if (errorsToShow.length === 0) action();
    },
    [errorsToShow.length, meta.error],
  );

  const initInputCode = useCallback(
    code => {
      if (code) {
        change(formName, `${path}value`, code.value);
        change(formName, `${path}label`, code.label);
        if (code.precisionid !== undefined && code.precisionid !== '') {
          change(formName, `${path}precisionid`, code.precisionid);
          change(formName, `${path}precisionlabel`, code.precisionlabel);
          change(formName, `${path}precisionsize`, code.precisionsize);
        } else if (precisionShow) {
          change(formName, `${path}precisionid`, `${Question}${code.value}CL`);
          change(formName, `${path}precisionlabel`, `${Dictionary.specify} :`);
          change(formName, `${path}precisionsize`, '249');
        } else {
          change(formName, `${path}precisionid`, '');
          change(formName, `${path}precisionlabel`, '');
          change(formName, `${path}precisionsize`, '');
        }
      }
    },
    [Question, change, formName, path, precisionShow],
  );

  const addCode = useCallback(() => {
    firstField.focus();
    push();
    clear();
  }, [clear, firstField, push]);

  const addCodeIfIsValid = useCallback(() => {
    executeIfValid(addCode);
  }, [addCode, executeIfValid]);

  useEffect(() => {
    initInputCode(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    initInputCode(code);
  }, [code, initInputCode]);

  return (
    <div className={CODE_INPUT_CLASS}>
      <div className={CODE_INPUT_ERRORS_CLASS}>
        <ComponentWithValidation validationErrors={errorsToShow} />
      </div>

      <div
        className="Precision"
        style={{ display: precisionShow ? 'none' : 'block' }}
      >
        <Field
          className={CODE_INPUT_CODE_CLASS}
          name="input-code.value"
          type="text"
          component={Input}
          label={Dictionary.code}
          onKeyDown={e => {
            if (e.key === 'Enter') addCodeIfIsValid();
          }}
          reference={node => setFirstField(node)}
          focusOnInit
        />
        <Field
          className={CODE_INPUT_LABEL_CLASS}
          name="input-code.label"
          type="text"
          component={RichEditorWithVariable}
          label={Dictionary.label}
          onEnter={addCodeIfIsValid}
        />
        <Field name="input-code.parent" type="hidden" component="input" />
        <div className={CODE_INPUT_ACTIONS_CLASS}>
          <button
            className={`${CODE_INPUT_ACTIONS_CLASS}-cancel`}
            onClick={close}
          >
            {Dictionary.cancel}
          </button>
          <button
            className={`${CODE_INPUT_ACTIONS_CLASS}-validate`}
            onClick={e => {
              e.preventDefault();
              addCodeIfIsValid();
            }}
          >
            {Dictionary.validate}
          </button>
        </div>
      </div>
      {precisionShow ? (
        <div className="Precision">
          <Field
            className={CODE_INPUT_CODE_CLASS_PRECISION}
            name="input-code.precisionid"
            type="text"
            component={Input}
            label={Dictionary.precisionId}
            onEnter={addCodeIfIsValid}
          />
          <Field
            className={CODE_INPUT_CODE_CLASS_PRECISION}
            name="input-code.precisionlabel"
            type="text"
            component={RichEditorWithVariable}
            label={Dictionary.label}
            onEnter={addCodeIfIsValid}
          />
          <Field
            className={CODE_INPUT_CODE_CLASS_PRECISION}
            name="input-code.precisionsize"
            type="number"
            component={Input}
            label={Dictionary.maxLength}
            onEnter={addCodeIfIsValid}
          />
          <button
            className={`${CODE_INPUT_ACTIONS_CLASS}-cancel`}
            onClick={remove}
            aria-label={Dictionary.remove}
          >
            <span className="glyphicon glyphicon-trash" aria-hidden="true" />
          </button>

          <div className={CODE_INPUT_ACTIONS_CLASS}>
            <button
              className={`${CODE_INPUT_ACTIONS_CLASS}-cancel`}
              onClick={close}
            >
              {Dictionary.cancel}
            </button>
            <button
              className={`${CODE_INPUT_ACTIONS_CLASS}-validate`}
              onClick={e => {
                e.preventDefault();
                addCodeIfIsValid();
              }}
            >
              {Dictionary.validate}
            </button>
          </div>
        </div>
      ) : (
        false
      )}
    </div>
  );
}

CodesListsInputCode.propTypes = {
  code: PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }),
  meta: PropTypes.shape({ ...fieldArrayMeta, error: PropTypes.array })
    .isRequired,
  path: PropTypes.string.isRequired,
  formName: PropTypes.string.isRequired,
  change: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  clear: PropTypes.func.isRequired,
};

CodesListsInputCode.defaultProps = {
  code: {
    value: '',
    label: '',
    precisionid: '',
    precisionlabel: '',
    precisionsize: '',
  },
};

export default CodesListsInputCode;
