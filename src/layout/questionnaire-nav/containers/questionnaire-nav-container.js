import { connect } from 'react-redux';

import QuestionnaireNav from '../components/questionnaire-nav';

import {
  setSelectedComponentId,
  setEditingComponentId,
} from '../../../actions/app-state';

import { removeComponent } from '../../../actions/component';
// Container

const mapStateToProps = state => ({
  questionnaire: state.appState.activeQuestionnaire,
  componentsStore: state.appState.activeComponentsById,
  selectedComponentId: state.appState.selectedComponentId,
  editingComponentId: state.appState.editingComponentId,
});

const mapDispatchToProps = {
  setSelectedComponentId,
  setEditingComponentId,
  removeComponent,
};

export default connect(mapStateToProps, mapDispatchToProps)(QuestionnaireNav);
