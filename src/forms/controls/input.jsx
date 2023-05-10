import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { fieldInputPropTypes, fieldMetaPropTypes } from 'redux-form';

import { getControlId } from 'utils/widget-utils';
import { CONTROL_INPUT } from 'constants/dom-constants';

const { COMPONENT_CLASS } = CONTROL_INPUT;

function Input({
  className,
  type,
  label,
  placeholder,
  required,
  disabled,
  input: propsInput,
  reference,
  focusOnInit,
  onEnter,
  meta: { touched, error },
  ...otherProps
}) {
  const [input, setInput] = useState(propsInput);

  useEffect(() => {
    if (focusOnInit && input.focus) input.focus();
    if (reference) reference(input);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusOnInit, reference]);

  const id = getControlId('input', propsInput.name);
  return (
    <div className={`${COMPONENT_CLASS} ${className}`}>
      <label htmlFor={id}>
        {label}
        {required && <span className="ctrl-required">*</span>}
      </label>
      <div>
        <input
          {...otherProps}
          {...propsInput}
          type={type}
          id={id}
          placeholder={placeholder !== '' || label}
          disabled={disabled}
          ref={node => setInput(node)}
          onKeyPress={event => {
            if (event.charCode === 13 && onEnter) onEnter(event);
          }}
        />

        {touched && error && <span className="form-error">{error}</span>}
      </div>
    </div>
  );
}

Input.propTypes = {
  input: PropTypes.shape(fieldInputPropTypes).isRequired,
  meta: PropTypes.shape(fieldMetaPropTypes).isRequired,
  type: PropTypes.string.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  focusOnInit: PropTypes.bool,
  reference: PropTypes.func,
  onEnter: PropTypes.func,
};

Input.defaultProps = {
  label: '',
  placeholder: '',
  className: '',
  required: false,
  disabled: false,
  focusOnInit: false,
  reference: undefined,
  onEnter: undefined,
};

export default Input;
