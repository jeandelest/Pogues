import React, { useState, useEffect } from 'react';
import ReactModal from 'react-modal';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import QuestionnaireComponent from './questionnaire-component';
import { COMPONENT_TYPE } from 'constants/pogues-constants';

import { getEnvVar } from 'utils/env';
import { ComponentEdit } from 'layout/component-edit';
import { ConfirmDialog } from 'layout/confirm-dialog';
import { QuestionnaireEdit } from 'layout/questionnaire-edit';
import { ErrorsIntegrity as ErrorsIntegrityPanel } from 'layout/errors-integrity';

import Dictionary from 'utils/dictionary/dictionary';
import { getSortedChildren } from 'utils/component/component-utils';
import { ERRORS_INTEGRITY } from 'constants/dom-constants';

const { INNER, ALERT, LIST } = ERRORS_INTEGRITY;

const { LOOP, FILTER, NESTEDFILTRE } = COMPONENT_TYPE;

const QuestionnaireListComponents = ({
  token,
  questionnaire,
  componentsStore,
  editingComponentId,
  errorsIntegrity,
  setSelectedComponentId,
  activeCalculatedVariables,
  calculatedVariables,
  removeQuestionnaire,
  navigate,
  selectedComponentId,
  setEditingComponentId,
  duplicateComponentAndVariables,
  dragComponent,
  removeComponent,
  removeQuestionnaireRef,
}) => {
  const publicEnemyBaseUri = getEnvVar('PUBLIC_ENEMY_URL');

  useEffect(() => {
    setSelectedComponentId('');
  }, [setSelectedComponentId]);

  const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [showRemoveQuestionnaireDialog, setShowRemoveQuestionnaireDialog] =
    useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // Temporary : to help diagnose calculated variables bug
  useEffect(() => {
    if (questionnaire.id && calculatedVariables[questionnaire.id]) {
      setShowWarning(
        Object.keys(activeCalculatedVariables).length === 0 &&
          Object.keys(calculatedVariables[questionnaire.id]).length !== 0,
      );
    }
  }, [activeCalculatedVariables, calculatedVariables, questionnaire]);

  const componentFilterConditionInitial = id => {
    return Object.values(componentsStore).filter(
      component => component.type === FILTER && component.initialMember === id,
    );
  };
  const componentFilterConditionFinal = id => {
    return Object.values(componentsStore).filter(
      component => component.type === FILTER && component.finalMember === id,
    );
  };

  const renderComponentsByParent = parent => {
    return getSortedChildren(componentsStore, parent)
      .filter(key => {
        const component = componentsStore[key];
        return (
          component.type !== LOOP &&
          component.type !== FILTER &&
          component.type !== NESTEDFILTRE &&
          component.id !== 'idendquest'
        );
      })
      .map(key => {
        const subTree = renderComponentsByParent(key);
        const component = componentsStore[key];
        return (
          <QuestionnaireComponent
            token={token}
            key={component.id}
            selected={selectedComponentId === key}
            component={component}
            setSelectedComponentId={setSelectedComponentId}
            setEditingComponentId={setEditingComponentId}
            duplicateComponentAndVariables={duplicateComponentAndVariables}
            moveComponent={dragComponent}
            removeComponent={removeComponent}
            removeQuestionnaireRef={removeQuestionnaireRef}
            integrityErrorsByType={errorsIntegrity[key]}
            parentType={componentsStore[component.parent].type}
            actions={{
              handleOpenComponentDetail: () => setShowComponentModal(true),
            }}
            componentFiltersInitial={componentFilterConditionInitial(
              component.id,
            )}
            componentFiltersFinal={componentFilterConditionFinal(component.id)}
          >
            {subTree}
          </QuestionnaireComponent>
        );
      }, {});
  };

  const componentType = componentsStore[editingComponentId]?.type;

  const componentHeader = Dictionary[`componentEdit${componentType}`] || '';

  return (
    <div id="questionnaire">
      {!questionnaire.id ? (
        <span className="fa fa-spinner fa-pulse fa-2x" />
      ) : (
        <div>
          {/* Questionnaire edit */}

          <div id="questionnaire-head">
            <h4>{questionnaire.label}</h4>
            <div>
              {publicEnemyBaseUri && (
                <a
                  className="btn-blue"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://${publicEnemyBaseUri}/questionnaires/check/${questionnaire.id}`}
                >
                  {Dictionary.customize}
                </a>
              )}
              <button
                className="btn-yellow"
                onClick={() => setShowQuestionnaireModal(true)}
              >
                {Dictionary.showDetail}
              </button>
              <button
                className="btn-yellow"
                onClick={() => setShowRemoveQuestionnaireDialog(true)}
              >
                {Dictionary.remove}
                <span className="glyphicon glyphicon-trash" />
              </button>
            </div>
          </div>

          {/* Temporary warning to help diagnose the bug concerning disappearing of calculated variables */}
          {showWarning && (
            <div id="errors-integrity">
              <div className={INNER}>
                <div className={ALERT} style={{ marginTop: '2.5em' }}>
                  <div className="alert-icon big">
                    <div className="alert-triangle" />!
                  </div>
                </div>
                <div className={LIST}>
                  <ul>
                    <li>
                      Il n'y a plus de variables calculées dans votre
                      questionnaire.{' '}
                      <strong>
                        Si ce n'est pas une action voulue de votre part
                      </strong>
                      , il s'agit probablement d'une erreur de l'application.
                      Dans ce cas, veuillez contacter au plus vite{' '}
                      <a href="mailto:atelier-conception-enquetes@insee.fr;service-numerique-atelier-conception-enquetes@insee.fr">
                        l'équipe de l'atelier de conception
                      </a>{' '}
                      pour que nous corrigions ce problème.
                    </li>
                    <li>
                      Par ailleurs, si vous quittez votre questionnaire
                      maintenant sans le sauvegarder, vous retrouverez les
                      variables calculées en retournant sur le questionnaire.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <ErrorsIntegrityPanel
            errorsIntegrity={errorsIntegrity}
            componentsStore={componentsStore}
            setSelectedComponentId={setSelectedComponentId}
          />

          {/* Questionnaire components */}

          <div id="questionnaire-items">
            {renderComponentsByParent(questionnaire.id)}
          </div>

          {/* Questionnaire edit */}
          {showQuestionnaireModal && (
            <ReactModal
              ariaHideApp={false}
              shouldCloseOnOverlayClick={false}
              isOpen={showQuestionnaireModal}
              onRequestClose={() => setShowQuestionnaireModal(false)}
              contentLabel={Dictionary.questionnaireDetail}
            >
              <div className="popup">
                <div className="popup-header">
                  <h3>{Dictionary.questionnaireDetail}</h3>

                  <button
                    type="button"
                    onClick={() => setShowQuestionnaireModal(false)}
                  >
                    <span>X</span>
                  </button>
                </div>
                <div className="popup-body">
                  <QuestionnaireEdit
                    onCancel={() => setShowQuestionnaireModal(false)}
                    onSuccess={() => setShowQuestionnaireModal(false)}
                  />
                </div>
              </div>
            </ReactModal>
          )}

          {/* Component edit */}
          {showComponentModal && (
            <ReactModal
              ariaHideApp={false}
              shouldCloseOnOverlayClick={false}
              isOpen={showComponentModal}
              onRequestClose={() => setShowComponentModal(false)}
              contentLabel={componentHeader}
            >
              <div className="popup">
                <div className="popup-header">
                  <h3>{componentHeader}</h3>
                  <button
                    type="button"
                    onClick={() => setShowComponentModal(false)}
                  >
                    <span>X</span>
                  </button>
                </div>
                <div className="popup-body">
                  <ComponentEdit
                    onCancel={() => setShowComponentModal(false)}
                    onSuccess={() => setShowComponentModal(false)}
                  />
                </div>
              </div>
            </ReactModal>
          )}

          {/* Remove dialog */}
          {showRemoveQuestionnaireDialog && (
            <ConfirmDialog
              showConfirmModal={showRemoveQuestionnaireDialog}
              confirm={() =>
                removeQuestionnaire(questionnaire.id, token).then(() =>
                  navigate('/'),
                )
              }
              closePopup={() => setShowRemoveQuestionnaireDialog(false)}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Prop types and default Props
QuestionnaireListComponents.propTypes = {
  token: PropTypes.string,
  questionnaire: PropTypes.object.isRequired,
  componentsStore: PropTypes.object,
  errorsIntegrity: PropTypes.object,

  selectedComponentId: PropTypes.string.isRequired,
  editingComponentId: PropTypes.string.isRequired,

  setSelectedComponentId: PropTypes.func.isRequired,
  setEditingComponentId: PropTypes.func.isRequired,
  removeComponent: PropTypes.func.isRequired,
  removeQuestionnaireRef: PropTypes.func.isRequired,
  dragComponent: PropTypes.func.isRequired,
  duplicateComponentAndVariables: PropTypes.func.isRequired,
  removeQuestionnaire: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
  activeCalculatedVariables: PropTypes.object,
  calculatedVariables: PropTypes.object,
};

QuestionnaireListComponents.defaultProps = {
  token: '',
  componentsStore: {},
  errorsIntegrity: {},
  activeCalculatedVariables: {},
  calculatedVariables: {},
};

export default DragDropContext(HTML5Backend)(QuestionnaireListComponents);
