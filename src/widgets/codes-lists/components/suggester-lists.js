import React, { useState, useEffect } from 'react';
import { Field, FormSection } from 'redux-form';
import PropTypes from 'prop-types';
import Select from 'forms/controls/select';
import GenericOption from 'forms/controls/generic-option';
import Dictionary from 'utils/dictionary/dictionary';
import { WIDGET_CODES_LISTS } from 'constants/dom-constants';

const { COMPONENT_CLASS } = WIDGET_CODES_LISTS;

export function SuggesterLists({
  change,
  formName,
  path,
  loadNomenclaturesIfNeeded,
  loadNomenclature,
  token,
  nomenclatures,
  selectorPath,
  currentId,
  codesListsStore,
}) {
  const [currentIdState, setCurrentIdState] = useState(currentId);

  useEffect(() => {
    loadNomenclaturesIfNeeded(token);
  }, [token, loadNomenclaturesIfNeeded]);

  useEffect(() => {
    if (currentIdState !== currentId && currentId === '') {
      change(formName, `${path}id`, '');
      change(formName, `${path}label`, '');
      setCurrentIdState(currentId);
    }

    if (
      currentIdState !== currentId &&
      currentId !== '' &&
      codesListsStore[currentId]?.suggesterParameters
    ) {
      change(formName, `${path}label`, codesListsStore[currentId].label);
      change(
        formName,
        `${path}suggester-parameters`,
        codesListsStore[currentId].suggesterParameters,
      );
      change(formName, `${path}urn`, codesListsStore[currentId].urn);
      change(
        formName,
        `${path}codesMaxlength`,
        codesListsStore[currentId].codesMaxlength,
      );
      setCurrentIdState(currentId);
    }

    if (
      currentIdState !== currentId &&
      currentId !== '' &&
      !codesListsStore[currentId]?.suggesterParameters &&
      nomenclatures[currentId].codes
    ) {
      change(formName, `${path}label`, nomenclatures[currentId].label);
      change(
        formName,
        `${path}suggesterParameters`,
        nomenclatures[currentId].suggesterParameters,
      );
      change(formName, `${path}urn`, nomenclatures[currentId].urn);
      change(
        formName,
        `${path}codesMaxlength`,
        nomenclatures[currentId].codes.reduce(
          (acc, code) => (code.id.length > acc ? code.id.length : acc),
          0,
        ),
      );
      setCurrentIdState(currentId);
    }

    if (
      currentIdState !== currentId &&
      currentId !== '' &&
      !codesListsStore[currentId] &&
      !nomenclatures[currentId].codes
    )
      loadNomenclature(token, currentId, nomenclatures);
  }, [
    currentId,
    change,
    currentIdState,
    formName,
    path,
    nomenclatures,
    loadNomenclature,
    token,
    codesListsStore,
  ]);

  return (
    <FormSection name={selectorPath} className={COMPONENT_CLASS}>
      <Field
        name="id"
        component={Select}
        label={Dictionary.selectCodesListType}
        required
      >
        <GenericOption key="noNomenclature" value="">
          {Dictionary.selectSuggesterList}
        </GenericOption>
        {Object.values(nomenclatures).map(nomenclature => (
          <GenericOption key={nomenclature.id} value={nomenclature.id}>
            {nomenclature.label}
          </GenericOption>
        ))}
      </Field>
    </FormSection>
  );
}

SuggesterLists.propTypes = {
  change: PropTypes.func.isRequired,
  formName: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  codesListsStore: PropTypes.object,
  loadNomenclaturesIfNeeded: PropTypes.func.isRequired,
  token: PropTypes.string,
  nomenclatures: PropTypes.object,
  selectorPath: PropTypes.string.isRequired,
  currentId: PropTypes.string,
};

SuggesterLists.defaultProps = {
  currentId: '',
  codesListsStore: {},
  nomenclatures: {},
};
