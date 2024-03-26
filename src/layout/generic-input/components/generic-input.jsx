import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import NavigationPrompt from 'react-router-navigation-prompt';
import { COMPONENT_TYPE } from 'constants/pogues-constants';
import { GENERIC_INPUT } from 'constants/dom-constants';
import Dictionary from 'utils/dictionary/dictionary';
import { VisualizeDropdown } from 'widgets/visualize-dropdown';
import { ExternalQuestionnaireDropdown } from 'widgets/external-questionnaire-dropdown';
import { ComponentNew } from 'layout/component-new';
import Loader from 'layout/loader';

const { QUESTION, SEQUENCE, SUBSEQUENCE, LOOP, FILTER, EXTERNAL_ELEMENT } =
  COMPONENT_TYPE;
const { COMPONENT_ID } = GENERIC_INPUT;

// PropTypes and defaultProps

export const propTypes = {
  activeQuestionnaire: PropTypes.object,
  placeholders: PropTypes.object.isRequired,
  isLoadingVisualization: PropTypes.bool,
  saveActiveQuestionnaire: PropTypes.func.isRequired,
  isQuestionnaireHaveError: PropTypes.bool,
  isQuestionnaireModified: PropTypes.bool,
  isQuestionnaireValid: PropTypes.bool.isRequired,
  isLoopsValid: PropTypes.bool.isRequired,
  token: PropTypes.string,
  selectedComponent: PropTypes.object,
  removeVisualizationError: PropTypes.func,
  showVisualizationErrorPopup: PropTypes.string,
};

export const defaultProps = {
  activeQuestionnaire: {},
  isLoadingVisualization: false,
  isQuestionnaireHaveError: false,
  isQuestionnaireModified: false,
  token: undefined,
  selectedComponent: undefined,
  removeVisualizationError: undefined,
  showVisualizationErrorPopup: '',
};

// Components

export const customLoopModalStyles = {
  content: {
    display: 'absolute',
    textAlign: 'center',
    verticalAlign: 'middle',
    top: '25%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    width: '800px',
    alignItems: 'center',
    transform: 'translate(-50%, -50%)',
  },
};

export const customModalbuttonStyles = {
  background: '#15417a',
  color: 'white',
  boxShadow: 'none',
  border: 'none',
  width: '70px',
  height: '30px',
  marginRight: '10px',
};

function GenericInput(props) {
  const {
    activeQuestionnaire,
    isLoadingVisualization,
    isLoopsValid,
    isQuestionnaireModified,
    isQuestionnaireValid,
    isQuestionnaireHaveError,
    placeholders,
    token,
    selectedComponent,
    removeVisualizationError,
    saveActiveQuestionnaire,
    showVisualizationErrorPopup,
  } = props;

  const [showNewComponentModal, setShowNewComponentModal] = useState(false);
  const [showNewUnsavedModal, setShowNewUnsavedModal] = useState(false);
  const [showNewLoopModal, setShowNewLoopModal] = useState(false);
  const [typeNewComponent, setTypeNewComponent] = useState('');

  const handleOpenNewComponent = componentType => {
    setShowNewComponentModal(true);
    setTypeNewComponent(componentType);
  };

  const handleCloseNewComponent = () => {
    setShowNewComponentModal(false);
    setShowNewUnsavedModal(false);
    setTypeNewComponent('');
  };

  const handleCloseModal = () => {
    setShowNewUnsavedModal(false);
    setShowNewLoopModal(false);
  };

  const saveQuestionnaire = () => {
    if (!isLoopsValid) {
      setShowNewLoopModal(true);
    } else {
      saveActiveQuestionnaire(token).then(() => {
        if (isQuestionnaireHaveError) {
          setShowNewUnsavedModal(true);
        }
      });
    }
  };

  const testExistFromQuestionnaire = useCallback(
    (crntLocation, nextLocation) =>
      !nextLocation?.pathname.startsWith(crntLocation.pathname) &&
      isQuestionnaireModified,
    [isQuestionnaireModified],
  );

  const newComponentParent = typeNewComponent
    ? placeholders[typeNewComponent].parent
    : '';
  const newComponentWeight = typeNewComponent
    ? placeholders[typeNewComponent].weight
    : 0;

  return (
    <div
      id={COMPONENT_ID}
      style={{ display: showNewComponentModal ? 'none' : 'block' }}
    >
      {isLoadingVisualization && <Loader />}
      <NavigationPrompt renderIfNotActive when={testExistFromQuestionnaire}>
        {({ isActive, onCancel, onConfirm }) => {
          if (isActive) {
            return (
              <ReactModal
                isOpen
                ariaHideApp={false}
                shouldCloseOnOverlayClick={false}
                className="custom-modal"
              >
                <p>{Dictionary.modification}</p>
                <button onClick={onCancel} className="modal-button">
                  {Dictionary.no}
                </button>
                <button onClick={onConfirm} className="modal-button">
                  {Dictionary.yes}
                </button>
              </ReactModal>
            );
          }
          return null;
        }}
      </NavigationPrompt>
      <div className="actionBar">
        <span>{Dictionary.addObject}</span>
        <button
          id="add-question"
          className="btn-white"
          disabled={
            placeholders[QUESTION].parent === ('' || 'idendquest') ||
            (selectedComponent && selectedComponent.type === EXTERNAL_ELEMENT)
          }
          onClick={() => handleOpenNewComponent(QUESTION)}
        >
          <span className="glyphicon glyphicon-plus" />
          {Dictionary.question}
        </button>
        <button
          id="add-subsequence"
          className="btn-white"
          disabled={
            placeholders[SUBSEQUENCE].parent === ('' || 'idendquest') ||
            (selectedComponent && selectedComponent.type === EXTERNAL_ELEMENT)
          }
          onClick={() => handleOpenNewComponent(SUBSEQUENCE)}
        >
          <span className="glyphicon glyphicon-plus" />
          {Dictionary.subSequence}
        </button>
        <button
          id="add-sequence"
          className="btn-white"
          disabled={placeholders[SEQUENCE].parent === ''}
          onClick={() => handleOpenNewComponent(SEQUENCE)}
        >
          <span className="glyphicon glyphicon-plus" />
          {Dictionary.sequence}
        </button>
        <button
          id="add-loop"
          className="btn-white"
          disabled={!placeholders[LOOP]}
          onClick={() => handleOpenNewComponent(LOOP)}
        >
          <span className="glyphicon glyphicon-plus" />
          {Dictionary.loop}
        </button>
        {activeQuestionnaire.dynamiqueSpecified === 'Filtres' && (
          <button
            id="add-loop"
            className="btn-white"
            disabled={!placeholders[FILTER]}
            onClick={() => handleOpenNewComponent(FILTER)}
          >
            <span className="glyphicon glyphicon-plus" />
            {Dictionary.filtre}
          </button>
        )}
        <ExternalQuestionnaireDropdown
          disabled={
            selectedComponent &&
            selectedComponent.type !== SEQUENCE &&
            selectedComponent.type !== EXTERNAL_ELEMENT
          }
          top
        />
        <button
          className="btn-yellow"
          disabled={!isQuestionnaireModified}
          onClick={() => saveQuestionnaire()}
          id="save"
        >
          {Dictionary.save}
          <span className="glyphicon glyphicon-floppy-disk" />
        </button>
        <VisualizeDropdown
          top
          disabled={!isQuestionnaireValid}
          token={token}
          questionnaireId={activeQuestionnaire.id}
        />
        <button className="btn-yellow disabled" id="publish">
          {Dictionary.publishQuestionnaire}
          <span className="glyphicon glyphicon-share-alt" />
        </button>
      </div>
      {showNewComponentModal && (
        <ReactModal
          ariaHideApp={false}
          shouldCloseOnOverlayClick={false}
          isOpen={showNewComponentModal}
          onRequestClose={handleCloseNewComponent}
          contentLabel={
            typeNewComponent
              ? Dictionary[`componentNew${typeNewComponent}`]
              : ''
          }
        >
          <div className="popup">
            <div className="popup-header">
              <h3>
                {typeNewComponent
                  ? Dictionary[`componentNew${typeNewComponent}`]
                  : ''}
              </h3>
              <button type="button" onClick={handleCloseNewComponent}>
                <span>X</span>
              </button>
            </div>
            <div className="popup-body">
              <ComponentNew
                parentId={newComponentParent}
                weight={newComponentWeight}
                type={typeNewComponent}
                onCancel={handleCloseNewComponent}
                onSuccess={handleCloseNewComponent}
              />
            </div>
          </div>
        </ReactModal>
      )}
      {showNewUnsavedModal && (
        <ReactModal
          isOpen={showNewUnsavedModal}
          ariaHideApp={false}
          className="custom-modal"
        >
          <p>{Dictionary.notSaved}</p>
          <button onClick={handleCloseModal} className="modal-button">
            {Dictionary.close}
          </button>
        </ReactModal>
      )}
      {showVisualizationErrorPopup !== '' && (
        <ReactModal
          isOpen={showVisualizationErrorPopup !== ''}
          ariaHideApp={false}
          className="custom-modal"
        >
          <p>{Dictionary.visualizationError}</p>
          <p className="api-error-message">{showVisualizationErrorPopup}</p>
          <button onClick={removeVisualizationError} className="modal-button">
            {Dictionary.close}
          </button>
        </ReactModal>
      )}
      {showNewLoopModal && (
        <ReactModal
          isOpen={showNewLoopModal}
          ariaHideApp={false}
          className="custom-modal"
        >
          <p>{Dictionary.loopNotSaved}</p>
          <button onClick={handleCloseModal} className="modal-button">
            {Dictionary.close}
          </button>
        </ReactModal>
      )}
    </div>
  );
}

GenericInput.propTypes = propTypes;
GenericInput.defaultProps = defaultProps;

export default GenericInput;
