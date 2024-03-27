import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';

import InputFilterWithCriteria from '../components/input-filter-with-criteria';

import { STATISTICAL_CONTEXT_FORM_NAME } from '../../../constants/pogues-constants';
import { loadSearchResult } from '../../../actions/search';

// PropTypes and defaultProps

const propTypes = {
  formName: PropTypes.string,
  path: PropTypes.string,
  typeItem: PropTypes.string.isRequired,
  criterias: PropTypes.arrayOf(
    PropTypes.shape({
      remoteName: PropTypes.string.isRequired,
      localName: PropTypes.string.isRequired,
    }),
  ),
  loadOnInit: PropTypes.bool,
};

export const defaultProps = {
  formName: STATISTICAL_CONTEXT_FORM_NAME,
  path: '',
  criterias: [],
  loadOnInit: false,
};

// Container

export const mapStateToProps = (
  state,
  { authType, formName, path, criterias },
) => {
  const selector = formValueSelector(formName);

  return {
    authType,
    criteriaValues: criterias.reduce((acc, cr) => {
      return {
        ...acc,
        [cr.remoteName]: selector(state, `${path}${cr.localName}`),
      };
    }, {}),
  };
};

const mapDispatchToProps = {
  loadSearchResult,
};

const InputFilterWithCriteriaContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(InputFilterWithCriteria);

InputFilterWithCriteriaContainer.propTypes = propTypes;
InputFilterWithCriteriaContainer.defaultProps = defaultProps;

export default InputFilterWithCriteriaContainer;
