import * as ResponseFormat from './response-format';
import * as Declaration from './declaration';
import * as Control from './control';
import * as Redirection from './redirection';
import * as Response from './response';
import * as Loop from './loop';
import * as Filters from './redirection-filters';

import { uuid } from 'utils/utils';
import * as CollectedVariable from './collected-variable';

import {
  COMPONENT_TYPE,
  SEQUENCE_TYPE_NAME,
  QUESTION_TYPE_NAME,
  QUESTION_TYPE_ENUM,
  QUESTIONNAIRE_TYPE,
} from 'constants/pogues-constants';

const { MULTIPLE_CHOICE, SINGLE_CHOICE, TABLE, PAIRING } = QUESTION_TYPE_ENUM;
const {
  QUESTION,
  SEQUENCE,
  SUBSEQUENCE,
  QUESTIONNAIRE,
  LOOP,
  FILTER,
  EXTERNAL_ELEMENT,
} = COMPONENT_TYPE;
const { Filtres, Redirections } = QUESTIONNAIRE_TYPE;

const sortByWeight = store => (keyA, keyB) => {
  if (store[keyA].weight < store[keyB].weight) return -1;
  if (store[keyA].weight > store[keyB].weight) return 1;
  return 0;
};

export const getResponseCoordinate = (
  variablesAttribute,
  variablesMapping = [],
) =>
  variablesMapping.reduce((acc, m) => {
    const axis = m.MappingTarget.split(' ');
    const find = variablesAttribute
      ? variablesAttribute.find(ele => ele.AttributeTarget === m.MappingTarget)
      : false;
    const variableRes = {
      ...acc,
      [m.MappingSource]: {
        x: parseInt(axis[0], 10),
        y: parseInt(axis[1], 10),
      },
    };
    if (find) {
      variableRes[m.MappingSource].isCollected = false;
    } else {
      variableRes[m.MappingSource].isCollected = true;
    }
    return variableRes;
  }, {});

const getResponsesByVariable = (responses = [], coordinatesByResponse = []) =>
  responses.reduce((accInner, response) => {
    const { id: responseId, CollectedVariableReference: collectedVariableId } =
      response;
    // Mapping only exists in the questions with a matrix of responses
    const coordinates = coordinatesByResponse[responseId] || {};

    return {
      ...accInner,
      [collectedVariableId]: {
        ...coordinates,
      },
    };
  }, {});

const clarificationQuestion = Children => {
  const Clarification = [];
  const childr = Children.filter(children => children.Child.length !== 0);
  childr.forEach(item => {
    item.Child.forEach(clar => {
      if (clar.type === 'SequenceType') {
        clar.Child.forEach(supseq => {
          if (
            (supseq.questionType === SINGLE_CHOICE ||
              supseq.questionType === MULTIPLE_CHOICE ||
              supseq.questionType === TABLE) &&
            supseq.ClarificationQuestion !== undefined &&
            supseq.ClarificationQuestion.length !== 0
          ) {
            Clarification.push(supseq);
          }
        });
      } else if (
        (clar.questionType === SINGLE_CHOICE ||
          clar.questionType === MULTIPLE_CHOICE ||
          clar.questionType === TABLE) &&
        clar.ClarificationQuestion !== undefined &&
        clar.ClarificationQuestion.length !== 0
      ) {
        Clarification.push(clar);
      }
    });
  });
  return Clarification;
};

export const getClarificarionfromremote = (Children, collectedVariables) => {
  const variableClarification = [];
  const childclarification = clarificationQuestion(Children);
  childclarification.forEach(element => {
    element.ClarificationQuestion.forEach(item => {
      const position = element.FlowControl.find(
        controle => controle.IfTrue === item.id,
      ).Expression;
      if (position) {
        const stringFind = position.substring(
          position.lastIndexOf('=') + 3,
          position.lastIndexOf("'"),
        );
        let multiplFind = '';
        const tableFind = position.substring(1, position.lastIndexOf('$'));
        let codelistid = null;
        let level = null;
        let varibale = null;
        if (element.questionType === MULTIPLE_CHOICE) {
          codelistid = element.ResponseStructure.Dimension[0].CodeListReference;
          const codeCollectedVarible = position.substring(
            1,
            position.lastIndexOf('$'),
          );
          const variable = collectedVariables.find(
            varib => varib.Name === codeCollectedVarible,
          );
          if (variable) {
            multiplFind = element.Response.findIndex(
              response => response.CollectedVariableReference === variable.id,
            );
          }
        } else if (element.questionType === TABLE) {
          varibale = collectedVariables.find(varib => varib.Name === tableFind);
          if (varibale) {
            codelistid = varibale.CodeListReference;
            const respones = element.Response.filter(
              response =>
                response.CodeListReference === varibale.CodeListReference,
            );
            level = respones.indexOf(
              respones.find(
                resp => resp.CollectedVariableReference === varibale.id,
              ),
            );
          }
        } else {
          codelistid = element.Response[0].CodeListReference;
        }
        const variable = {
          responseclar: item,
          position:
            element.questionType === MULTIPLE_CHOICE ? multiplFind : stringFind,
          codelistid: codelistid,
          type: element.questionType,
          level: parseInt(level, 10) + 1,
        };
        variableClarification.push(variable);
      }
    });
  });
  return variableClarification;
};

function remoteToVariableResponseNested(children = [], acc = {}) {
  children.forEach(child => {
    const {
      Response: responses,
      ClarificationQuestion: responsesClarification,
      ResponseStructure: responseStructure,
      Child: childrenInner,
    } = child;
    let responseFinal = responses;
    if (responsesClarification !== undefined) {
      responsesClarification.forEach(clar => {
        responseFinal = responseFinal.concat(clar.Response);
      });
    }

    const variableResponseMapping = responseStructure
      ? responseStructure.Mapping
      : undefined;

    const variableResponseAttribute = responseStructure
      ? responseStructure.Attribute
      : undefined;
    const coordinatesByResponse = getResponseCoordinate(
      variableResponseAttribute,
      variableResponseMapping,
    );

    acc = {
      ...acc,
      ...getResponsesByVariable(responseFinal, coordinatesByResponse),
      ...remoteToVariableResponseNested(childrenInner, acc),
    };
  });
  return acc;
}
export function remoteToVariableResponse(remote) {
  return remoteToVariableResponseNested(remote.Child);
}

function remoteToState(remote, componentGroup, codesListsStore) {
  const {
    id,
    questionType,
    genericName,
    Name: name,
    Label: [label],
    Declaration: declarations,
    // Trello #196 : ouput : GoTo --> FlowControl
    FlowControl: redirections,
    Control: controls,
    Response: responses,
    ClarificationQuestion: responsesClarification,
    ResponseStructure: responseStructure,
    Child: children,
    parent,
    weight,
    TargetMode,
    declarationMode,
    FlowControl: flowControl,
    flowLogic,
    Scope: scope,
  } = remote;
  const redirectionClar =
    redirections !== undefined && Array.isArray(redirections) && questionType
      ? redirections.filter(redirec => redirec.flowControlType === undefined)
      : [];
  let responseFinal = responses;
  if (responsesClarification !== undefined) {
    responsesClarification.forEach(clar => {
      responseFinal = responseFinal.concat(clar.Response);
    });
  }
  const state = {
    id,
    name,
    parent: parent || '',
    weight: weight || 0,
    children: children
      ? children
          .filter(child => child.id && child.id !== 'idendquest')
          .map(childr => childr.id)
      : [],
    declarations: Declaration.remoteToState(declarations),
    controls: Control.remoteToState(controls),
    redirections: Redirection.remoteToState(redirectionClar),
    TargetMode: TargetMode || declarationMode || [],
    responsesClarification,
    flowControl,
    dynamiqueSpecified:
      flowLogic && flowLogic === FILTER ? Filtres : Redirections,
  };
  if (genericName) {
    state.label = label;
    if (genericName === QUESTIONNAIRE) {
      state.type = QUESTIONNAIRE;
    } else if (genericName === 'MODULE') {
      state.type = SEQUENCE;
    } else if (genericName === 'SUBMODULE') {
      state.type = SUBSEQUENCE;
    } else if (genericName === 'EXTERNAL_ELEMENT') {
      state.type = EXTERNAL_ELEMENT;
    }
  } else {
    const dimensions = responseStructure ? responseStructure.Dimension : [];

    state.type = QUESTION;
    state.label = label.replace(/&#xd;/gi, '\n\n');
    state.responseFormat = ResponseFormat.remoteToState(
      questionType,
      responses,
      dimensions,
      codesListsStore,
      scope,
    );
    state.collectedVariables =
      CollectedVariable.remoteToComponentState(responseFinal);
  }
  const cGroupIndex = componentGroup.findIndex(
    group => group.MemberReference?.indexOf(id) >= 0,
  );
  const cGroup = componentGroup[cGroupIndex];
  state.pageBreak =
    cGroup &&
    cGroupIndex < componentGroup.length - 1 &&
    cGroup.MemberReference.indexOf(id) === cGroup.MemberReference.length - 1;
  if (questionType === MULTIPLE_CHOICE || questionType === TABLE) {
    state.response = responses;
  }
  return state;
}

function remoteToStoreNested(
  children,
  parent,
  componentGroup,
  iterations,
  filters,
  codesListsStore = {},
  acc = {},
) {
  let weight = 0;
  children.forEach(child => {
    acc[child.id] = remoteToState(
      { ...child, weight, parent },
      componentGroup,
      codesListsStore,
    );
    weight += 1;
    if (child.Child)
      remoteToStoreNested(
        child.Child,
        child.id,
        componentGroup,
        iterations,
        filters,
        codesListsStore,
        acc,
      );
    return acc;
  });
  iterations.forEach(iteration => {
    acc[iteration.id] = Loop.remoteToState(iteration, parent);
  });
  let acc1 = acc;
  filters.forEach(filter => {
    acc1 = Filters.remoteToState(filter, parent, acc1);
  });
  return acc1;
}

function getCollectedVariablesById(
  collectedVariablesStore,
  collectedVariables,
) {
  const collectedvariablequestion = [];
  Object.values(collectedVariablesStore).forEach(collec => {
    if (collectedVariables !== undefined) {
      collectedVariables.forEach(variables => {
        if (collec.id === variables) {
          collectedvariablequestion.push(collec);
        }
      });
    }
  });
  return collectedvariablequestion;
}

function getFlowcontrol(FlowControl) {
  const flowcontrolefinal = [];
  FlowControl.forEach(flowcon => {
    if (flowcon.flowControlType === undefined) {
      flowcontrolefinal.push(flowcon);
    }
  });
  return flowcontrolefinal;
}

function getClarificationresponseSingleChoiseQuestion(
  collectedVariablesStore,
  collectedVariables,
  codesListsStore,
  responseFormat,
  FlowControl,
  TargetMode,
  responsesClarification,
  flowControl,
) {
  const ClarificationQuestion = [];
  const collectedvariablequestion = getCollectedVariablesById(
    collectedVariablesStore,
    collectedVariables,
  );
  const flowcontrolefinal = getFlowcontrol(FlowControl);
  collectedvariablequestion.forEach(collected => {
    const code = Object.values(
      codesListsStore[responseFormat.SINGLE_CHOICE.CodesList.id].codes,
    ).find(code => code.weight === collected.z);
    if (code) {
      const findResponse = responsesClarification
        ? responsesClarification.find(
            element => element.Name === collected.name,
          )
        : undefined;
      const findFlow =
        flowControl && findResponse
          ? flowControl.find(element => element.IfTrue === findResponse.id)
          : undefined;
      const responseModel = {
        mandatory: false,
        typeName: collected.type,
        maxLength: collected.TEXT.maxLength,
        pattern: '',
        collectedVariable: collected.id,
      };
      if (findResponse?.Response) {
        responseModel.id = findResponse.Response[0].id;
      }
      const clafication = {
        id: findResponse ? findResponse.id : uuid(),
        questionType: QUESTION_TYPE_ENUM.SIMPLE,
        Name: code.precisionid,
        Label: code.precisionlabel,
        TargetMode: TargetMode,
        Response: [Response.stateToRemote(responseModel)],
      };
      ClarificationQuestion.push(clafication);
      const clarficationredirection = {
        id: findFlow ? findFlow.id : uuid(),
        label: `$${collectedvariablequestion[0].name}$ = '${code.value}' : ${collected.name}`,
        condition: `$${collectedvariablequestion[0].name}$ = '${code.value}'`,
        cible: clafication.id,
        flowControlType: 'CLARIFICATION',
      };
      const clarficationredirectionid = clarficationredirection.id;
      const flow = Redirection.stateToRemote({
        [clarficationredirectionid]: clarficationredirection,
      });
      flowcontrolefinal.push(flow[0]);
    }
  });
  return {
    flowcontrolefinal,
    ClarificationQuestion,
  };
}

function getClarificationResponseMultipleChoiceQuestion(
  collectedVariablesStore,
  collectedVariables,
  codesListsStore,
  responseFormat,
  FlowControl,
  TargetMode,
  responsesClarification,
  flowControl,
) {
  const ClarificationQuestion = [];
  const collectedvariablequestion = getCollectedVariablesById(
    collectedVariablesStore,
    collectedVariables,
  );

  const flowcontrolefinal = getFlowcontrol(FlowControl);
  collectedvariablequestion.forEach(collected => {
    if (responseFormat.MULTIPLE_CHOICE.PRIMARY.CodesList) {
      const code = Object.values(
        codesListsStore[responseFormat.MULTIPLE_CHOICE.PRIMARY.CodesList.id]
          .codes,
      ).find(code => code.weight === collected.z);
      if (code) {
        const collectedVar = collectedvariablequestion.find(
          collectedVarible => collectedVarible.x === code.weight,
        );
        const findResponse = responsesClarification
          ? responsesClarification.find(
              element => element.Name === collected.name,
            )
          : undefined;
        const findFlow =
          flowControl && findResponse
            ? flowControl.find(element => element.IfTrue === findResponse.id)
            : undefined;
        const responseModel = {
          mandatory: false,
          typeName: collected.type,
          maxLength: collected.TEXT.maxLength,
          pattern: '',
          collectedVariable: collected.id,
        };
        if (findResponse?.Response[0]) {
          responseModel.id = findResponse.Response[0].id;
        }
        const clafication = {
          id: findResponse ? findResponse.id : uuid(),
          questionType: QUESTION_TYPE_ENUM.SIMPLE,
          Name: code.precisionid,
          Label: code.precisionlabel,
          TargetMode: TargetMode,
          Response: [Response.stateToRemote(responseModel)],
        };
        ClarificationQuestion.push(clafication);
        const clarficationredirection = {
          id: findFlow ? findFlow.id : uuid(),
          label: `$${collectedVar.name}$ = '1' : ${collected.name}`,
          condition: `$${collectedVar.name}$ = '1'`,
          cible: clafication.id,
          flowControlType: 'CLARIFICATION',
        };
        const clarficationredirectionid = clarficationredirection.id;
        const flow = Redirection.stateToRemote({
          [clarficationredirectionid]: clarficationredirection,
        });
        flowcontrolefinal.push(flow[0]);
      }
    }
  });
  return {
    flowcontrolefinal,
    ClarificationQuestion,
  };
}

function getClarificationResponseTableQuestion(
  collectedVariablesStore,
  collectedVariables,
  codesListsStore,
  responseFormat,
  FlowControl,
  TargetMode,
  responsesClarification,
  flowControl,
) {
  const ClarificationQuestion = [];
  const collectedvariablequestion = getCollectedVariablesById(
    collectedVariablesStore,
    collectedVariables,
  );
  const flowcontrolefinal = getFlowcontrol(FlowControl);
  if (responseFormat.TABLE.LIST_MEASURE) {
    responseFormat.TABLE.LIST_MEASURE.forEach(mesure => {
      if (mesure.SINGLE_CHOICE?.CodesList.id) {
        Object.values(
          codesListsStore[mesure.SINGLE_CHOICE.CodesList.id].codes,
        ).forEach(code => {
          if (code.precisionid && code.precisionid !== '') {
            const collectedvariablequestionPrecision =
              collectedvariablequestion.filter(
                varibale => varibale.z === code.weight,
              );
            collectedvariablequestionPrecision.forEach(varib => {
              const variableTable = collectedvariablequestion.find(
                varTab =>
                  varTab.x === varib.mesureLevel &&
                  varTab.codeListReference ===
                    mesure.SINGLE_CHOICE.CodesList.id,
              );
              const findResponse = responsesClarification
                ? responsesClarification.find(
                    element => element.Name === varib.name,
                  )
                : undefined;
              const findFlow =
                flowControl && findResponse
                  ? flowControl.find(
                      element => element.IfTrue === findResponse.id,
                    )
                  : undefined;
              const responseModel = {
                mandatory: false,
                typeName: varib.type,
                maxLength: code.precisionsize,
                pattern: '',
                collectedVariable: varib.id,
              };
              if (findResponse?.Response[0]) {
                responseModel.id = findResponse.Response[0].id;
              }
              const clafication = {
                id: findResponse ? findResponse.id : uuid(),
                questionType: QUESTION_TYPE_ENUM.SIMPLE,
                Name: varib.name,
                Label: code.precisionlabel,
                TargetMode: TargetMode,
                Response: [Response.stateToRemote(responseModel)],
              };
              ClarificationQuestion.push(clafication);
              const clarficationredirection = {
                id: findFlow ? findFlow.id : uuid(),
                label: `$${variableTable.name}$ = '${code.value}' : ${varib.name}`,
                condition: `$${variableTable.name}$ = '${code.value}'`,
                cible: clafication.id,
                flowControlType: 'CLARIFICATION',
              };
              const clarficationredirectionid = clarficationredirection.id;
              const flow = Redirection.stateToRemote({
                [clarficationredirectionid]: clarficationredirection,
              });
              flowcontrolefinal.push(flow[0]);
            });
          }
        });
      }
    });
  }

  return {
    flowcontrolefinal,
    ClarificationQuestion,
  };
}

function storeToRemoteNested(
  state,
  store,
  collectedVariablesStore,
  codesListsStore,
  dynamiqueSpecified,
  depth = 1,
) {
  const {
    id,
    name: Name,
    label,
    type,
    children,
    responseFormat,
    declarations,
    controls,
    redirections,
    collectedVariables,
    TargetMode,
    response,
    responsesClarification,
    flowControl,
  } = state;
  if (type !== LOOP && type !== FILTER) {
    let remote = {
      id,
      depth,
      Name,
      Label: [label.replace(/\n\n/gi, '&#xd;')],
      Declaration: Declaration.stateToRemote(declarations),
      Control: Control.stateToRemote(controls),
      // Trello #196 : ouput : GoTo --> FlowControl
      FlowControl: [],
      TargetMode,
    };
    if (dynamiqueSpecified !== Filtres) {
      remote.FlowControl = Redirection.stateToRemote(redirections);
    }

    if (type === QUESTION) {
      if (
        responseFormat.type === SINGLE_CHOICE &&
        collectedVariablesStore !== undefined
      ) {
        const remoteclarification =
          getClarificationresponseSingleChoiseQuestion(
            collectedVariablesStore,
            collectedVariables,
            codesListsStore,
            responseFormat,
            remote.FlowControl,
            TargetMode,
            responsesClarification,
            flowControl,
          );
        remote.FlowControl = remoteclarification.flowcontrolefinal;
        remote.ClarificationQuestion =
          remoteclarification.ClarificationQuestion;
      }
      if (
        responseFormat.type === MULTIPLE_CHOICE &&
        collectedVariablesStore !== undefined
      ) {
        const remoteclarification =
          getClarificationResponseMultipleChoiceQuestion(
            collectedVariablesStore,
            collectedVariables,
            codesListsStore,
            responseFormat,
            remote.FlowControl,
            TargetMode,
            responsesClarification,
            flowControl,
          );
        remote.FlowControl = remoteclarification.flowcontrolefinal;
        remote.ClarificationQuestion =
          remoteclarification.ClarificationQuestion;
      }
      if (
        responseFormat.type === TABLE &&
        collectedVariablesStore !== undefined
      ) {
        const remoteclarification = getClarificationResponseTableQuestion(
          collectedVariablesStore,
          collectedVariables,
          codesListsStore,
          responseFormat,
          remote.FlowControl,
          TargetMode,
          responsesClarification,
          flowControl,
        );
        remote.FlowControl = remoteclarification.flowcontrolefinal;
        remote.ClarificationQuestion =
          remoteclarification.ClarificationQuestion;
      }
      if (responseFormat.type === PAIRING) {
        remote.Scope = responseFormat[PAIRING].scope;
      }

      remote.type = QUESTION_TYPE_NAME;
      remote.questionType = responseFormat.type;
      remote = {
        ...remote,
        ...ResponseFormat.stateToRemote(
          responseFormat,
          collectedVariables,
          collectedVariablesStore,
          response,
        ),
      };
    } else {
      remote.type = SEQUENCE_TYPE_NAME;
      if (type === QUESTIONNAIRE) {
        remote.genericName = 'QUESTIONNAIRE';
      } else if (type === SEQUENCE) {
        remote.genericName = 'MODULE';
      } else if (type === EXTERNAL_ELEMENT) {
        remote.genericName = 'EXTERNAL_ELEMENT';
      } else {
        remote.genericName = 'SUBMODULE';
      }
      remote.Child = childrenToRemote(
        children,
        store,
        codesListsStore,
        dynamiqueSpecified,
        collectedVariablesStore,
        depth,
      );
    }
    return remote;
  }
  return {};
}
function childrenToRemote(
  children,
  store,
  codesListsStore,
  dynamiqueSpecified,
  collectedVariablesStore = {},
  depth = 0,
) {
  return children.sort(sortByWeight(store)).map(key => {
    const newDepth = depth + 1;
    return storeToRemoteNested(
      store[key],
      store,
      collectedVariablesStore,
      codesListsStore,
      dynamiqueSpecified,
      newDepth,
    ); // eslint-disable-line no-use-before-define
  });
}

export function remoteToStore(
  remote,
  questionnaireId,
  codesListsStore,
  iterations,
  filters,
) {
  return {
    ...remoteToStoreNested(
      remote.Child,
      questionnaireId,
      remote.ComponentGroup,
      iterations,
      filters,
      codesListsStore,
    ),
    [questionnaireId]: remoteToState(remote, []),
  };
}

export function storeToRemote(
  store,
  questionnaireId,
  collectedVariablesStore,
  codesListsStore,
  dynamiqueSpecified,
) {
  return store[questionnaireId].children.sort(sortByWeight(store)).map(key => {
    return storeToRemoteNested(
      store[key],
      store,
      collectedVariablesStore,
      codesListsStore,
      dynamiqueSpecified,
    );
  });
}
