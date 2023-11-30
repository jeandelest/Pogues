import * as Questionnaire from './transformations/questionnaire';
import * as CalculatedVariable from './transformations/calculated-variable';
import * as ExternalVariable from './transformations/external-variable';
import * as CollectedVariable from './transformations/collected-variable';
import * as CodesList from './transformations/codes-list';
import * as Component from './transformations/component';
import { VARIABLES_TYPES } from 'constants/pogues-constants';
import { removeOrphansCodesLists } from 'utils/codes-lists/codes-lists-utils';

const { CALCULATED, EXTERNAL, COLLECTED } = VARIABLES_TYPES;

export function questionnaireRemoteToStores(remote, currentStores = {}) {
  const {
    id,
    CodeLists: { CodeList: codesLists },
    Variables: { Variable: variables },
  } = remote;
  const iterations = remote.Iterations?.Iteration || [];
  const filters = remote.FlowControl || [];
  const calculatedVariables = variables.filter(v => v.type === CALCULATED);
  const externalVariables = variables.filter(v => v.type === EXTERNAL);
  const collectedVariables = variables.filter(v => v.type === COLLECTED);

  // Questionnaire store
  const questionnaireById = Questionnaire.remoteToStore(remote, currentStores);

  // Calculate variables store
  const calculatedVariableByQuestionnaire = {
    [id]: CalculatedVariable.remoteToStore(calculatedVariables),
  };

  // External variables store
  const externalVariableByQuestionnaire = {
    [id]: ExternalVariable.remoteToStore(externalVariables),
  };
  // Codes lists store
  const variableclarification = Component.getClarificarionfromremote(
    remote.Child,
    collectedVariables,
  );
  const codesListsStore = CodesList.remoteToStore(
    codesLists,
    variableclarification,
  );
  // Collected variables store
  const responsesByVariable = Component.remoteToVariableResponse(remote);
  const collectedVariableByQuestionnaire = {
    [id]: CollectedVariable.remoteToStore(
      collectedVariables,
      responsesByVariable,
      codesListsStore,
      variableclarification,
    ),
  };
  // Components store
  const componentByQuestionnaire = {
    [id]: Component.remoteToStore(
      remote,
      id,
      codesListsStore,
      iterations,
      filters,
    ),
  };
  const condListLinked = removeOrphansCodesLists(
    codesListsStore,
    componentByQuestionnaire[id],
  );
  if (
    Object.values(condListLinked).length !==
    Object.values(codesListsStore).length
  ) {
    Object.values(codesListsStore).forEach(code => {
      if (!condListLinked[code.id]) {
        code.isDuplicated = true;
      }
    });
  }
  const codeListByQuestionnaire = {
    [id]: codesListsStore,
  };
  return {
    questionnaireById,
    calculatedVariableByQuestionnaire,
    externalVariableByQuestionnaire,
    collectedVariableByQuestionnaire,
    codeListByQuestionnaire,
    componentByQuestionnaire,
  };
}

export function questionnaireListRemoteToStores(questionnairesList) {
  const questionnaireById = [];

  questionnairesList.forEach(quest => {
    let questionnaireState;
    try {
      questionnaireState = Questionnaire.remoteToStore1(quest);
    } catch (e) {
      //
    }
    if (questionnaireState) questionnaireById.push(questionnaireState);
  });
  return questionnaireById;
}
