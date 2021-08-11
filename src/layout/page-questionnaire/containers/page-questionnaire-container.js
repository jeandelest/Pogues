import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import PageQuestionnaire from '../components/page-questionnaire';

import { COMPONENT_TYPE } from 'constants/pogues-constants';
import { loadQuestionnaire } from 'actions/questionnaire';
import { loadEnoParameters } from 'actions/enoParameters';
import { loadCampaignsIfNeeded } from 'actions/metadata';
import {
  setActiveQuestionnaire,
  setActiveComponents,
  setActiveCodeLists,
  setActiveVariables,
  loadStatisticalContext,
} from 'actions/app-state';
import { getToken } from 'reducers/selectors';

const { QUESTION } = COMPONENT_TYPE;

// Utils

function getCollectedVariablesByQuestionnaire(
  components = {},
  collectedVariables = {},
) {
  return Object.keys(components)
    .filter(key => components[key].type === QUESTION)
    .filter(key => components[key].collectedVariables.length > 0)
    .reduce((acc, key) => {
      return {
        ...acc,
        [key]: components[key].collectedVariables.reduce(
          (accInner, keyInner) => {
            return {
              ...accInner,
              [keyInner]: { ...collectedVariables[keyInner] },
            };
          },
          {},
        ),
      };
    }, {});
}

// Prop types and default props

const propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }),
  history: PropTypes.object.isRequired,
};

// Container

const mapStateToProps = (
  state,
  {
    match: {
      params: { id },
    },
  },
) => ({
  id,
  token: getToken(state),
  questionnaire: state.questionnaireById[id],
  activeQuestionnaire: state.appState.activeQuestionnaire,
  components: state.componentByQuestionnaire[id],
  codeLists: state.codeListByQuestionnaire[id],
  calculatedVariables: state.calculatedVariableByQuestionnaire[id],
  externalVariables: state.externalVariableByQuestionnaire[id],
  collectedVariablesByQuestion: getCollectedVariablesByQuestionnaire(
    state.componentByQuestionnaire[id],
    state.collectedVariableByQuestionnaire[id],
  ),
  loading: state.questionnaireById.loader,
});

const mapDispatchToProps = {
  loadCampaignsIfNeeded,
  loadStatisticalContext,
  loadEnoParameters,
  setActiveQuestionnaire,
  setActiveComponents,
  setActiveCodeLists,
  setActiveVariables,
  loadQuestionnaire,
};

const PageQuestionnaireContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PageQuestionnaire);

PageQuestionnaireContainer.propTypes = propTypes;

export default PageQuestionnaireContainer;
