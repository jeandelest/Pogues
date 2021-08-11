import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash.isequal';
import Loader from 'layout/loader';

import { PAGE_QUESTIONNAIRE } from 'constants/dom-constants';
import { QuestionnaireListComponents } from 'layout/questionnaire-list-components';
import { QuestionnaireNav } from 'layout/questionnaire-nav';
import { GenericInput } from 'layout/generic-input';

const { COMPONENT_ID } = PAGE_QUESTIONNAIRE;

// Prop types and default props

export const propTypes = {
  id: PropTypes.string.isRequired,
  token: PropTypes.string,
  loadQuestionnaire: PropTypes.func.isRequired,
  loadStatisticalContext: PropTypes.func.isRequired,
  loadCampaignsIfNeeded: PropTypes.func.isRequired,
  setActiveQuestionnaire: PropTypes.func.isRequired,
  setActiveComponents: PropTypes.func.isRequired,
  setActiveCodeLists: PropTypes.func.isRequired,
  setActiveVariables: PropTypes.func.isRequired,
  questionnaire: PropTypes.object,
  components: PropTypes.object,
  activeQuestionnaire: PropTypes.object,
  codeLists: PropTypes.object,
  calculatedVariables: PropTypes.object,
  externalVariables: PropTypes.object,
  collectedVariablesByQuestion: PropTypes.object,
  history: PropTypes.object.isRequired,
};

export const defaultProps = {
  token: '',
  questionnaire: {},
  activeQuestionnaire: {},
  components: {},
  codeLists: {},
  calculatedVariables: {},
  externalVariables: {},
  collectedVariablesByQuestion: {},
};

const PageQuestionnaire = props => {
  const {
    id,
    token,
    questionnaire,
    components,
    codeLists,
    calculatedVariables,
    externalVariables,
    collectedVariablesByQuestion,
    activeQuestionnaire,
    loading,
    loadQuestionnaire,
    loadEnoParameters,
    setActiveQuestionnaire,
    loadStatisticalContext,
    setActiveComponents,
    setActiveCodeLists,
    setActiveVariables,
    loadCampaignsIfNeeded,
  } = props;

  const [idState, setIdState] = useState();
  const [questionnaireState, setQuestionnaireState] = useState();
  const [activeQuestionnaireState, setActiveQuestionnaireState] = useState();
  const [componentsState, setComponentsState] = useState({});
  const [codeListsState, setCodeListsState] = useState();
  const [externalVariablesState, setExternalVariables] = useState();
  const [calculatedVariablesState, setCalculatedVariables] = useState();
  const [collectedVariablesByQuestionState, setCollectedVariablesByQuestion] =
    useState();

  useEffect(() => {
    if (idState !== id) {
      loadQuestionnaire(id, token);
      setIdState(id);
    }

    if (questionnaire && !isEqual(questionnaireState, questionnaire)) {
      const idCampaign =
        questionnaire.campaigns[questionnaire.campaigns.length - 1];
      setActiveQuestionnaire(questionnaire);
      loadStatisticalContext(idCampaign, token);
      setQuestionnaireState(questionnaire);
      loadEnoParameters(id, token);
    }
    if (
      components &&
      Object.values(componentsState).length !== Object.values(components).length
    ) {
      setActiveComponents(components);
      setComponentsState(components);
    }
    if (codeLists && !isEqual(codeListsState, codeLists)) {
      setActiveCodeLists(codeLists);
      setCodeListsState(codeLists);
    }
    if (
      (calculatedVariablesState &&
        !isEqual(calculatedVariablesState, calculatedVariables)) ||
      (externalVariables &&
        !isEqual(externalVariablesState, externalVariables)) ||
      (collectedVariablesByQuestionState &&
        !isEqual(
          collectedVariablesByQuestionState,
          collectedVariablesByQuestion,
        ))
    ) {
      setActiveVariables({
        activeCalculatedVariablesById: calculatedVariables,
        activeExternalVariablesById: externalVariables,
        collectedVariableByQuestion: collectedVariablesByQuestion,
      });
      setExternalVariables(externalVariables);
      setCalculatedVariables(calculatedVariables);
      setCollectedVariablesByQuestion(collectedVariablesByQuestion);
    }
  }, [
    token,
    loading,
    idState,
    questionnaire,
    questionnaireState,
    components,
    componentsState,
    externalVariables,
    externalVariablesState,
    calculatedVariables,
    calculatedVariablesState,
    collectedVariablesByQuestion,
    collectedVariablesByQuestionState,
    codeLists,
    codeListsState,
    id,
    loadQuestionnaire,
    loadEnoParameters,
    loadStatisticalContext,
    setActiveCodeLists,
    setActiveComponents,
    setActiveQuestionnaire,
    setActiveVariables,
  ]);

  useEffect(() => {
    if (
      activeQuestionnaire &&
      !isEqual(activeQuestionnaire, activeQuestionnaireState)
    ) {
      if (activeQuestionnaire.campaigns) {
        const idCampaign =
          activeQuestionnaire.campaigns[
            activeQuestionnaire.campaigns.length - 1
          ];
        loadStatisticalContext(idCampaign, token);
      }
      if (activeQuestionnaire.operation) {
        loadCampaignsIfNeeded(activeQuestionnaire.operation, token);
      }
      setActiveQuestionnaireState(activeQuestionnaire);
    }
  }, [
    token,
    activeQuestionnaire,
    activeQuestionnaireState,
    loadStatisticalContext,
    loadCampaignsIfNeeded,
  ]);

  return (
    <div id={COMPONENT_ID}>
      {loading ? (
        <Loader />
      ) : (
        <div>
          <QuestionnaireNav />
          <QuestionnaireListComponents navigate={props.history.push} />
          <GenericInput />
        </div>
      )}
    </div>
  );
};

export default PageQuestionnaire;
