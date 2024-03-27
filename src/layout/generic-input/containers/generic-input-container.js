import { connect } from 'react-redux';

import GenericInput from '../components/generic-input';

import {
  saveActiveQuestionnaire,
  visualizeActiveQuestionnaire,
} from '../../../actions/app-state';
import { removeVisualizationError } from '../../../actions/errors';
import {
  getNewSequencePlaceholder,
  getNewSubsequencePlaceholder,
  getNewQuestionPlaceholder,
  getNewLoopPlaceholder,
} from '../../../utils/component/generic-input-utils';
import { COMPONENT_TYPE } from '../../../constants/pogues-constants';

const { QUESTION, SEQUENCE, SUBSEQUENCE, LOOP, FILTER } = COMPONENT_TYPE;

// Utils

function getPlaceholders(
  componentsStore,
  selectedComponentId,
  questionnaireId,
) {
  const selectedComponent = componentsStore[selectedComponentId];
  return {
    [SEQUENCE]: getNewSequencePlaceholder(
      componentsStore,
      questionnaireId,
      selectedComponent,
    ),
    [SUBSEQUENCE]: getNewSubsequencePlaceholder(
      componentsStore,
      selectedComponent,
    ),
    [QUESTION]: getNewQuestionPlaceholder(componentsStore, selectedComponent),
    [LOOP]: getNewLoopPlaceholder(componentsStore),
    [FILTER]: getNewLoopPlaceholder(componentsStore),
  };
}

function isQuestionnaireValid(questionnaireErrors = {}) {
  return (
    Object.keys(questionnaireErrors).reduce(
      (acc, key) => acc + questionnaireErrors[key].length,
      0,
    ) === 0
  );
}

function isLoopsValid(
  componentsStore,
  activeQuestionnaire,
  externalQuestionnairesLoops,
) {
  let loopsValid = true;
  const componentsLoop = Object.values(componentsStore).filter(
    component => component.type === LOOP,
  );
  const externalLoopsAvailable = externalQuestionnairesLoops || {};
  const externalQuestionnnairesId =
    activeQuestionnaire.childQuestionnaireRef || [];
  const referencedLoops = Object.keys(externalLoopsAvailable)
    .filter(key => externalQuestionnnairesId.includes(key))
    .reduce((acc, key) => [...acc, ...externalLoopsAvailable[key].loops], []);

  if (componentsLoop.length > 0) {
    componentsLoop.forEach(component => {
      if (
        !componentsStore[component.initialMember] ||
        !componentsStore[component.finalMember] ||
        componentsStore[component.initialMember].weight >
          componentsStore[component.finalMember].weight ||
        (component.basedOn &&
          !componentsStore[component.basedOn] &&
          !referencedLoops.some(loop => loop.id === component.basedOn))
      ) {
        loopsValid = false;
      }
    });
  }
  return loopsValid;
}

// Container

const mapStateToProps = state => {
  const { activeComponentsById, selectedComponentId, activeQuestionnaire } =
    state.appState;
  const { externalQuestionnairesLoops } = state.metadataByType;
  const errors = state.errors || { errorsIntegrity: {} };
  const questionnaireErrors =
    errors.errorsIntegrity[activeQuestionnaire.id] || {};
  const selectedComponent = activeComponentsById[selectedComponentId];

  return {
    placeholders: getPlaceholders(
      activeComponentsById,
      selectedComponentId,
      activeQuestionnaire.id,
    ),
    isQuestionnaireHaveError: state.appState.isQuestionnaireHaveError,
    isQuestionnaireModified: state.appState.isQuestionnaireModified,
    isQuestionnaireValid: isQuestionnaireValid(questionnaireErrors),
    isLoopsValid: isLoopsValid(
      activeComponentsById,
      activeQuestionnaire,
      externalQuestionnairesLoops,
    ),
    activeQuestionnaire: activeQuestionnaire,
    authType: state.authType,
    showVisualizationErrorPopup:
      state.errors.errorsVisualization.showErrorVisualizationPopup,
    isLoadingVisualization: state.appState.isLoadingVisualization,
    selectedComponent: selectedComponent,
  };
};

const mapDispatchToProps = {
  saveActiveQuestionnaire,
  visualizeActiveQuestionnaire,
  removeVisualizationError,
};

export default connect(mapStateToProps, mapDispatchToProps)(GenericInput);
