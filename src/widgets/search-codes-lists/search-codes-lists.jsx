import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { StatisticalContextCriteria } from 'widgets/statistical-context-criteria';
import ReactModal from 'react-modal';
import SearchResults from 'widgets/search-results/components/search-results';
import {
  WIDGET_SEARCH_CODES_LISTS,
  WIDGET_INPUT_FILTER_WITH_CRITERIA,
} from 'constants/dom-constants';
import {
  DEFAULT_FORM_NAME,
  SEARCH_RESULTS_COLUMNS,
} from 'constants/pogues-constants';
import Dictionary from 'utils/dictionary/dictionary';
import { searchCodesLists, getCodesListById } from 'utils/remote-api';
import { change } from 'redux-form';
import { connect } from 'react-redux';
import './search-codes-lists.scss';
import { getToken } from 'reducers/selectors';

const { COMPONENT_CLASS, SEARCH_RESULTS_CLASS, SEARCH_CLASS } =
  WIDGET_SEARCH_CODES_LISTS;

const OPEN_MODAL = 'OPEN_MODAL';
const FETCH_DETAIL = 'FETCH_DETAIL';
const SEARCH = 'SEARCH';

function SearchCodesLists(props) {
  const [searchValue, setSearchValue] = useState('');
  const [codesLists, setCodesLists] = useState([]);
  const [selectedCodesList, setSelectedCodesList] = useState(null);
  const [currentAction, setCurrentAction] = useState(null);
  const [codesListDetail, setCodesListDetail] = useState(null);

  const { token, path, storeCodesLists } = props;
  useEffect(() => {
    // TODO LOIC changer quand le back fera le proxy
    if (currentAction === SEARCH) {
      searchCodesLists(searchValue, token)
        .then(response => {
          setCodesLists(response);
        })
        .finally(() => setCurrentAction(null));
    }
    return () => console.log('useEffect');
  }, [currentAction]);

  useEffect(() => {
    if (currentAction === FETCH_DETAIL) {
      getCodesListById(selectedCodesList.id, token)
        .then(response => {
          setCodesListDetail(response);
          storeCodesLists(response);
        })
        .finally(() => setCurrentAction(null));
    }
  }, [currentAction]);
  console.log('codesListDetail', codesListDetail);
  const propsStatisticaContextCriteria = {
    formName: DEFAULT_FORM_NAME,
    path,
    showOperations: false,
    showCampaigns: false,
    horizontal: true,
  };
  const propsSearchResults = {
    className: SEARCH_RESULTS_CLASS,
    noValuesMessage: Dictionary.codesListsNoResults,
    columns: SEARCH_RESULTS_COLUMNS.CODES_LIST,
    actions: [
      {
        dictionary: 'searchResultActionReuse',
        action: values => {
          setCurrentAction(OPEN_MODAL);
          setSelectedCodesList(values);
        },
        iconOnly: true,
        icon: 'glyphicon-eye-open',
      },
      {
        dictionary: 'searchResultActionReuse',
        action: values => {
          setCurrentAction(FETCH_DETAIL);
          setSelectedCodesList(values);
          console.log('values', values);
        },
        iconOnly: true,
        icon: codeList => {
          console.log('codeList', codeList);
          return currentAction === FETCH_DETAIL &&
            codeList.id === selectedCodesList.id
            ? 'loader'
            : 'glyphicon-download-alt';
        },
      },
    ],
    values: codesLists,
  };
  console.log('currentAction', currentAction);
  return (
    <div className={COMPONENT_CLASS}>
      <div className={SEARCH_CLASS}>
        <StatisticalContextCriteria {...propsStatisticaContextCriteria} />
        <div className={WIDGET_INPUT_FILTER_WITH_CRITERIA.COMPONENT_CLASS}>
          <div className={WIDGET_INPUT_FILTER_WITH_CRITERIA.PANEL_INPUT_CLASS}>
            <label htmlFor="codes-lists-search">
              {Dictionary.searchInputCodesListsLabel}
            </label>
            <div>
              {' '}
              <input
                id="codes-lists-search"
                className={WIDGET_INPUT_FILTER_WITH_CRITERIA.SEARCH_INPUT_CLASS}
                type="text"
                placeholder={Dictionary.searchInputCodesListsLabel}
                onChange={e => setSearchValue(e.target.value)}
              />
            </div>
          </div>
          <button
            type="button"
            className={WIDGET_INPUT_FILTER_WITH_CRITERIA.BUTTON_SEARCH_CLASS}
            onClick={() => setCurrentAction(SEARCH)}
          >
            {Dictionary.searchInputButton}
          </button>
        </div>
      </div>
      <SearchResults {...propsSearchResults} />

      <ReactModal
        isOpen={currentAction === OPEN_MODAL}
        ariaHideApp={false}
        shouldCloseOnOverlayClick={false}
      >
        <div>{selectedCodesList?.description}</div>
        <ul>
          {selectedCodesList?.modalities.map((modality, index) => (
            <li key={index}>{modality}</li>
          ))}
        </ul>
        <button
          onClick={() => {
            setCurrentAction(null);
            setSelectedCodesList(null);
          }}
        >
          close
        </button>
      </ReactModal>
    </div>
  );
}

SearchCodesLists.propTypes = {
  path: PropTypes.string,
};

SearchCodesLists.defaultProps = {
  path: '',
};

const mapStateToProps = state => ({
  token: getToken(state),
});

const mapDispatchToProps = (dispatch, ownProps) => {
  console.log('path', ownProps.path);

  return {
    storeCodesLists(codesList) {
      const codes = codesList.Code.map(({ Label, Value }, index) => {
        return {
          label: Label,
          value: Value,
          parent: '',
          depth: 1,
          weight: index + 1,
        };
      });
      dispatch(change('component', `${ownProps.path}label`, codesList.Label));
      dispatch(change('component', `${ownProps.path}codes`, codes));
      dispatch(change('component', `${ownProps.path}panel`, 'NEW'));
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(SearchCodesLists);
