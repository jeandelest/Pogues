import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { fieldInputPropTypes, fieldMetaPropTypes } from 'redux-form';

import { getControlId } from 'utils/widget-utils';
import { CONTROL_TEXTAREA } from 'constants/dom-constants';

const { COMPONENT_CLASS } = CONTROL_TEXTAREA;

function Textarea({
  label,
  required,
  disabled,
  focusOnInit,
  input: propsInput,
  meta: { touched, error },
}) {
  const [input, setInput] = useState(propsInput);

  useEffect(() => {
    if (focusOnInit && input.focus) input.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusOnInit]);

  const id = getControlId('textarea', propsInput.name);

  return (
    <div className={COMPONENT_CLASS}>
      <label htmlFor={id}>
        {label}
        {required && <span className="ctrl-required">*</span>}
      </label>
      <div>
        <textarea
          {...propsInput}
          id={id}
          placeholder={label}
          disabled={disabled}
          ref={node => setInput(node)}
        />
        {touched && error && <span className="form-error">{error}</span>}
      </div>
    </div>
  );
}

Textarea.propTypes = {
  input: PropTypes.shape(fieldInputPropTypes).isRequired,
  meta: PropTypes.shape(fieldMetaPropTypes).isRequired,
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  focusOnInit: PropTypes.bool,
};

Textarea.defaultProps = {
  required: false,
  disabled: false,
  focusOnInit: false,
};

export default Textarea;
