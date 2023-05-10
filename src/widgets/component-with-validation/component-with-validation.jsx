import React from 'react';
import PropTypes from 'prop-types';
import { WIDGET_VALIDATION_ERRORS } from 'constants/dom-constants';
import { getKey } from 'utils/widget-utils';

const { COMPONENT_CLASS } = WIDGET_VALIDATION_ERRORS;

export default function ComponentWithValidation({ validationErrors }) {
  return (
    <div className={COMPONENT_CLASS}>
      {validationErrors.length > 0 && (
        <ul>
          {validationErrors.map(err => (
            <li key={getKey(`${err[0]}${err[1]}`)}>{err[0]}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

ComponentWithValidation.propTypes = {
  validationErrors: PropTypes.arrayOf(PropTypes.shape()),
};

ComponentWithValidation.defaultProps = {
  validationErrors: [],
};
