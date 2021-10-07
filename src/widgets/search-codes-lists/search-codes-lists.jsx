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

  const { token, path, storeCodesLists } = props;

  useEffect(() => {
    if (currentAction === SEARCH) {
      searchCodesLists(searchValue, token)
        .then(response => {
          setCodesLists(response);
        })
        .finally(() => setCurrentAction(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAction]);

  useEffect(() => {
    if (currentAction === FETCH_DETAIL) {
      getCodesListById(selectedCodesList.id, token)
        .then(response => {
          storeCodesLists(response);
        })
        .finally(() => setCurrentAction(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAction]);

  const propsStatisticaContextCriteria = {
    formName: DEFAULT_FORM_NAME,
    path,
    showOperations: false,
    showCampaigns: false,
    horizontal: true,
    disableSeriesChoice: true,
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
        },
        iconOnly: true,
        icon: codeList => {
          return currentAction === FETCH_DETAIL &&
            codeList.id === selectedCodesList.id
            ? 'loader'
            : 'glyphicon-download-alt';
        },
      },
    ],
    values: codesLists,
  };

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
            disabled={!searchValue}
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
        <div className="popup">
          <div className="popup-header">
            <div>
              <h3>{Dictionary.codesListPreview}</h3>
              <button
                type="button"
                onClick={() => {
                  setCurrentAction(null);
                  setSelectedCodesList(null);
                }}
              >
                <span>X</span>
              </button>
            </div>
          </div>
          <h4>{Dictionary.searchResultDescription}</h4>
          <div>{selectedCodesList?.description}</div>
          <h4>{Dictionary.modalities}</h4>
          <ul>
            {selectedCodesList?.modalities.map((modality, index) => (
              <li key={index}>{modality}</li>
            ))}
          </ul>
          <button
            className="btn-yellow"
            onClick={() => {
              setCurrentAction(null);
              setSelectedCodesList(null);
            }}
          >
            {Dictionary.close}
          </button>
        </div>
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
