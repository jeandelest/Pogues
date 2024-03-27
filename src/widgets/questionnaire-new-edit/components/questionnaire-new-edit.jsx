import React from 'react';
import { Field, formPropTypes } from 'redux-form';

import { WIDGET_QUESTIONNAIRE_NEW_EDIT } from '../../../constants/dom-constants';
import Dictionary from '../../../utils/dictionary/dictionary';
import { AssociatedFields } from '../../associated-fields';
import { StatisticalContextCriteria } from '../../statistical-context-criteria';

import {
  FORMULA_LANGUAGE,
  QUESTIONNAIRE_TYPE,
  TargetMode,
} from '../../../constants/pogues-constants';
import GenericOption from '../../../forms/controls/generic-option';
import ListCheckboxes from '../../../forms/controls/list-checkboxes';
import ListRadios from '../../../forms/controls/list-radios';

import { updateNameField } from '../../../utils/utils';

const { COMPONENT_CLASS, FOOTER, CANCEL, VALIDATE } =
  WIDGET_QUESTIONNAIRE_NEW_EDIT;

const { Filtres, Redirections } = QUESTIONNAIRE_TYPE;
const { XPATH, VTL } = FORMULA_LANGUAGE;

// Component
function QuestionnaireNewEdit({
  handleSubmit,
  submitting,
  form,
  onCancel,
  stamp,
}) {
  return (
    <div className={COMPONENT_CLASS}>
      <form onSubmit={handleSubmit}>
        <StatisticalContextCriteria
          stamp={stamp}
          formName={form}
          multipleCampaign
          focusOnInit
        />

        <AssociatedFields
          formName={form}
          fieldOrigin={{ name: 'label', label: Dictionary.title }}
          fieldTarget={{ name: 'name', label: Dictionary.name }}
          action={updateNameField}
        />

        <Field
          name="TargetMode"
          component={ListCheckboxes}
          label={Dictionary.collectionMode}
          inline
        >
          {TargetMode.map(s => (
            <GenericOption key={s.value} value={s.value}>
              {s.label}
            </GenericOption>
          ))}
        </Field>
        <Field
          name="dynamiqueSpecified"
          component={ListRadios}
          label={Dictionary.dynamiqueSpecified}
          inline
        >
          <GenericOption key={Redirections} value={Redirections}>
            {Dictionary.QGoTo}
          </GenericOption>
          <GenericOption key={Filtres} value={Filtres}>
            {Dictionary.QFilter}
          </GenericOption>
        </Field>
        <Field
          name="formulaSpecified"
          component={ListRadios}
          label={Dictionary.formulaSpecified}
          inline
        >
          <GenericOption key={XPATH} value={XPATH}>
            {Dictionary.formulaXpath}
          </GenericOption>
          <GenericOption key={VTL} value={VTL}>
            {Dictionary.formulaVTL}
          </GenericOption>
        </Field>
        <div className={FOOTER}>
          <button className={VALIDATE} type="submit" disabled={submitting}>
            {Dictionary.validate}
          </button>
          <button className={CANCEL} disabled={submitting} onClick={onCancel}>
            {Dictionary.cancel}
          </button>
        </div>
      </form>
    </div>
  );
}

QuestionnaireNewEdit.propTypes = formPropTypes;

export default QuestionnaireNewEdit;
