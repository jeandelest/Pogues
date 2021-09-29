import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import ClassSet from 'react-classset';

import { WIDGET_STATISTICAL_CONTEXT_CRITERIA } from 'constants/dom-constants';

import Select from 'forms/controls/select';
import ListCheckboxes from 'forms/controls/list-checkboxes';
import GenericOption from 'forms/controls/generic-option';
import Dictionary from 'utils/dictionary/dictionary';
import { requiredSelect } from 'forms/validation-rules';

const { COMPONENT_CLASS, HORIZONTAL_CLASS } =
  WIDGET_STATISTICAL_CONTEXT_CRITERIA;

const StatisticalContextCriteria = props => {
  const {
    token,
    selectedSerie,
    selectedOperation,
    campaigns,
    operations,
    series,
    multipleCampaign,
    required,
    focusOnInit,
    horizontal,
    loadSeriesIfNeeded,
    loadOperationsIfNeeded,
    loadCampaignsIfNeeded,
  } = props;

  const [selectedSerieState, setSelectedSerieState] = useState();
  const [selectedOperationState, setSelectedOperationState] = useState();

  useEffect(() => {
    loadSeriesIfNeeded(token);
    if (selectedSerie !== selectedSerieState) {
      loadOperationsIfNeeded(selectedSerie, token);
      setSelectedSerieState(selectedSerie);
    }

    if (selectedOperation !== selectedOperationState) {
      loadCampaignsIfNeeded(selectedOperation, token);
      setSelectedOperationState(selectedOperation);
    }
  }, [
    token,
    selectedSerie,
    selectedOperation,
    selectedOperationState,
    selectedSerieState,
    loadSeriesIfNeeded,
    loadOperationsIfNeeded,
    loadCampaignsIfNeeded,
  ]);

  return (
    <div
      className={ClassSet({
        [COMPONENT_CLASS]: true,
        [HORIZONTAL_CLASS]: horizontal,
      })}
    >
      <Field
        name="serie"
        component={Select}
        required={required}
        focusOnInit={focusOnInit}
        validate={required ? [requiredSelect] : []}
        label={Dictionary.serie}
        emptyOption={Dictionary.selectSerie}
        disabled
      >
        {series.map(s => (
          <GenericOption key={s.value} value={s.value}>
            {s.label}
          </GenericOption>
        ))}
      </Field>
      {operations && (
        <Field
          name="operation"
          component={Select}
          required={required}
          validate={required ? [requiredSelect] : []}
          disabled={!selectedSerie}
          label={Dictionary.operation}
          emptyOption={Dictionary.selectOperation}
        >
          {operations.map(s => (
            <GenericOption key={s.value} value={s.value}>
              {s.label}
            </GenericOption>
          ))}
        </Field>
      )}

      {campaigns && (
        <Field
          name="campaigns"
          component={multipleCampaign ? ListCheckboxes : Select}
          required={required}
          validate={required ? [requiredSelect] : []}
          disabled={!selectedSerie || !selectedOperation}
          label={Dictionary.campaign}
          emptyOption={Dictionary.selectCampaign}
          noValuesMessage={Dictionary.noValuesCampaigns}
        >
          {campaigns.map(s => (
            <GenericOption key={s.value} value={s.value}>
              {s.label}
            </GenericOption>
          ))}
        </Field>
      )}
    </div>
  );
};
// PropTypes and defaultProps

StatisticalContextCriteria.propTypes = {
  token: PropTypes.string,
  series: PropTypes.array.isRequired,
  operations: PropTypes.array,
  campaigns: PropTypes.array,
  multipleCampaign: PropTypes.bool,
  required: PropTypes.bool,
  horizontal: PropTypes.bool.isRequired,
  focusOnInit: PropTypes.bool.isRequired,
  selectedSerie: PropTypes.string,
  selectedOperation: PropTypes.string,
  loadSeriesIfNeeded: PropTypes.func.isRequired,
  loadOperationsIfNeeded: PropTypes.func.isRequired,
  loadCampaignsIfNeeded: PropTypes.func.isRequired,
};
StatisticalContextCriteria.defaultProps = {
  token: '',
  multipleCampaign: false,
  required: false,
  focusOnInit: false,
  operations: undefined,
  campaigns: undefined,
  selectedSerie: undefined,
  selectedOperation: undefined,
};

export default StatisticalContextCriteria;
