import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { formValueSelector, change } from 'redux-form';
import {
  loadSeriesIfNeeded,
  loadOperationsIfNeeded,
  loadCampaignsIfNeeded,
} from 'actions/metadata';
import { STATISTICAL_CONTEXT_FORM_NAME, TCM } from 'constants/pogues-constants';
import { filterStoreByProp } from 'utils/widget-utils';
import { storeToArray } from 'utils/utils';

import StatisticalContextCriteria from '../components/statistical-context-criteria';
import { getToken, getUser } from 'reducers/selectors';

// PropTypes and defaultProps

const propTypes = {
  formName: PropTypes.string,
  path: PropTypes.string,
  showOperations: PropTypes.bool,
  showCampaigns: PropTypes.bool,
  multipleCampaign: PropTypes.bool,
  required: PropTypes.bool,
  horizontal: PropTypes.bool,
};

export const defaultProps = {
  formName: STATISTICAL_CONTEXT_FORM_NAME,
  path: '',
  showOperations: true,
  showCampaigns: true,
  multipleCampaign: false,
  required: false,
  horizontal: false,
};

// Container

export const mapStateToProps = (
  state,
  { showCampaigns, showOperations, formName, path },
) => {
  const selector = formValueSelector(formName);
  const { stamp } = getUser(state);
  const conditionalProps = {};

  // Selected serie and operation in the form
  const selectedSerie = selector(state, `${path}serie`);

  // Show or not the list of operations
  if (showOperations) {
    const selectedOperation = selector(state, `${path}operation`);

    conditionalProps.selectedOperation = selectedOperation;
    conditionalProps.operations =
      selectedSerie === TCM.id
        ? [{ id: TCM.id, value: TCM.value, label: TCM.label }]
        : filterStoreByProp(
            'serie',
            selectedSerie,
            state.metadataByType.operations,
          );

    // Show or not the list of campaigns
    if (showCampaigns) {
      conditionalProps.campaigns =
        selectedOperation === TCM.id
          ? [{ id: TCM.id, value: TCM.value, label: TCM.label }]
          : filterStoreByProp(
              'operation',
              selectedOperation,
              state.metadataByType.campaigns,
            );
    }
  }

  return {
    ...conditionalProps,
    token: getToken(state),
    series:
      stamp === TCM.owner || stamp === 'FAKEPERMISSION'
        ? [
            { id: TCM.id, value: TCM.value, label: TCM.label },
            ...storeToArray(state.metadataByType.series),
          ]
        : storeToArray(state.metadataByType.series),
    selectedSerie,
    path,
  };
};

const mapDispatchToProps = {
  change: change,
  loadSeriesIfNeeded,
  loadOperationsIfNeeded,
  loadCampaignsIfNeeded,
};

const StatisticalContextCriteriaContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(StatisticalContextCriteria);

StatisticalContextCriteriaContainer.propTypes = propTypes;
StatisticalContextCriteriaContainer.defaultProps = defaultProps;

export default StatisticalContextCriteriaContainer;
