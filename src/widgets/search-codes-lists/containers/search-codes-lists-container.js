import { connect } from 'react-redux';
import { change } from 'redux-form';
import PropTypes from 'prop-types';

import SearchCodesLists from '../components/search-codes-lists';
import {
  getCodeDepth,
  getCodeWeight,
} from 'utils/codes-lists/codes-lists-utils';
import { getToken } from 'reducers/selectors';

const propTypes = {
  path: PropTypes.string,
};

export const defaultProps = {
  path: '',
};

const mapStateToProps = state => ({
  token: getToken(state),
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    storeCodesLists(codesList) {
      const codes = codesList.Code.map(code => {
        const par = code.Parent ? code.Parent : '';
        return {
          label: code.Label,
          value: code.Value,
          parent: par,
        };
      });

      const codesWithDepth = codes.map(code => {
        return {
          ...code,
          depth: getCodeDepth(codes, code),
        };
      });
      const codesWithDepthAndWeight = codesWithDepth.map(code => {
        return {
          ...code,
          weight: getCodeWeight(codesWithDepth, code),
        };
      });

      dispatch(change('component', `${ownProps.path}label`, codesList.Label));
      dispatch(
        change('component', `${ownProps.path}codes`, codesWithDepthAndWeight),
      );
      dispatch(change('component', `${ownProps.path}panel`, 'NEW'));
    },
  };
};

const SearchCodesListsContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchCodesLists);

SearchCodesListsContainer.propTypes = propTypes;
SearchCodesListsContainer.defaultProps = defaultProps;

export default SearchCodesListsContainer;
