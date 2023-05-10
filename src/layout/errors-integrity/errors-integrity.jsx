import React from 'react';
import PropTypes from 'prop-types';

import { ERRORS_INTEGRITY } from 'constants/dom-constants';
import { getIntegrityErrors } from 'utils/integrity/utils';

const { COMPONENT_ID, INNER, ALERT, LIST } = ERRORS_INTEGRITY;

function renderComponentsErrors(errorsIntegrity, componentsStore) {
  // We are testing if the component exists in the active components store
  return Object.keys(errorsIntegrity)
    .filter(componentId => componentsStore[componentId])
    .reduce((acc, componentId) => {
      const integrityErrors = getIntegrityErrors(errorsIntegrity[componentId]);

      if (integrityErrors.length > 0) {
        const componentErrorsOutput = (
          <li key={componentId}>
            <span>{componentsStore[componentId].name}</span>
            <ul>
              {integrityErrors.map((e, index) => (
                <li key={index}>{e}</li>
              ))}
            </ul>
          </li>
        );

        return [...acc, componentErrorsOutput];
      }

      return acc;
    }, []);
}

function ErrorsIntegrity({ errorsIntegrity, componentsStore }) {
  const componentsErrors = renderComponentsErrors(
    errorsIntegrity,
    componentsStore,
  );

  return (
    <div id={COMPONENT_ID}>
      {componentsErrors.length > 0 && (
        <div className={INNER}>
          <div className={ALERT}>
            <div className="alert-icon big">
              <div className="alert-triangle" />!
            </div>
          </div>
          <div className={LIST}>
            <ul>{componentsErrors}</ul>
          </div>
        </div>
      )}
    </div>
  );
}

ErrorsIntegrity.propTypes = {
  errorsIntegrity: PropTypes.object,
  componentsStore: PropTypes.object.isRequired,
};

ErrorsIntegrity.defaultProps = {
  errorsIntegrity: {},
};

export default ErrorsIntegrity;
