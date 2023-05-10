import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { fieldInputPropTypes, fieldMetaPropTypes } from 'redux-form';

import {
  getControlId,
  getValuesFromGenericOptions,
  toggleValueInList,
} from 'utils/widget-utils';

import { CONTROL_LIST_CHECKBOXES } from 'constants/dom-constants';
import ClassSet from 'react-classset';

const { COMPONENT_CLASS, INLINE_MODE } = CONTROL_LIST_CHECKBOXES;

function ListCheckboxes({
  label,
  required,
  disabled,
  noValuesMessage,
  children,
  input,
  meta: { touched, error },
  inline,
}) {
  const [listCheckValues, setListCheckValues] = useState(
    input.value !== '' && input.value.length > 0 ? input.value.split(',') : [],
  );

  useEffect(() => {
    setListCheckValues(
      input.value !== '' && input.value.length > 0
        ? input.value.split(',')
        : [],
    );
  }, [input.value]);

  const toggleCheck = checkValue => {
    input.onChange(toggleValueInList(listCheckValues, checkValue).join());
  };

  const values = getValuesFromGenericOptions(children);

  return (
    <div className={COMPONENT_CLASS}>
      <label
        htmlFor={getControlId(
          'checkbox',
          input.name,
          values[0] && values[0].value,
        )}
      >
        {label}
        {required && <span className="ctrl-required">*</span>}
      </label>
      <div>
        <input type="hidden" name={input.name} />
        {/* No values */}
        {values.length === 0 && noValuesMessage && (
          <div>
            <span>{noValuesMessage}</span>
          </div>
        )}

        {values.map(val => {
          // eslint-disable-next-line no-shadow
          const { label, value, ...otherProps } = val;
          const id = getControlId('checkbox', input.name, value);

          return (
            <div
              className={ClassSet({
                [INLINE_MODE]: inline,
              })}
              key={id}
            >
              <label htmlFor={id} className="form-check-label">
                <input
                  {...otherProps}
                  type="checkbox"
                  id={id}
                  value={value}
                  checked={
                    listCheckValues.indexOf(value) !== -1 ? 'checked' : false
                  }
                  onChange={() => toggleCheck(value)}
                  disabled={disabled}
                />
                {label}
              </label>
            </div>
          );
        })}
        {touched && error && <span className="form-error">{error}</span>}
      </div>
    </div>
  );
}

ListCheckboxes.propTypes = {
  input: PropTypes.shape(fieldInputPropTypes).isRequired,
  meta: PropTypes.shape(fieldMetaPropTypes).isRequired,
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  noValuesMessage: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
  inline: PropTypes.bool.isRequired,
};

ListCheckboxes.defaultProps = {
  required: false,
  disabled: false,
  children: [],
  noValuesMessage: undefined,
  inline: false,
};

export default ListCheckboxes;
