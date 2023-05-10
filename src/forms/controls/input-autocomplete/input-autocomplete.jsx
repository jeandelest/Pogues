import React, { useEffect, useState } from 'react';
import { fieldInputPropTypes, fieldMetaPropTypes } from 'redux-form';
import PropTypes from 'prop-types';
import ClassSet from 'react-classset';
import debounce from 'lodash.debounce';
import { getControlId, getValuesFromGenericOptions } from 'utils/widget-utils';
import { HighLighter } from 'widgets/highlighter';
import { CONTROL_INPUT_AUTOCOMPLETE } from 'constants/dom-constants';

const {
  COMPONENT_CLASS,
  BUTTON_CLEAR_CLASS,
  NO_OPTION_SELECTED_ICON,
  OPTION_SELECTED_ICON,
  OPTION_CLEAR_ICON,
} = CONTROL_INPUT_AUTOCOMPLETE;

function updateSelectedOption(suggestions, onChange, indexActiveSuggestion) {
  const activeSuggestion =
    indexActiveSuggestion !== undefined && suggestions[indexActiveSuggestion];

  if (activeSuggestion) {
    onChange(activeSuggestion.value);
  }
}

const InputAutocomplete = props => {
  const {
    getOptionLabel,
    numSuggestionsShown,
    caseSensitive,
    input: propsInput,
    children,
    label,
    required,
    meta: { touched, error },
    focusOnInit,
  } = props;

  const options = getValuesFromGenericOptions(children);
  const [indexSelectedOption, setIndexSelectedOption] = useState(undefined);
  const [suggestions, setSuggestions] = useState([]);
  const [indexActiveSuggestion, setIndexActiveSuggestion] = useState(undefined);
  const [inputSearch, setInputSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [input, setInput] = useState(propsInput);

  useEffect(() => {
    if (focusOnInit && input.focus) input.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input.focus, focusOnInit]);

  useEffect(() => {
    const indexSelectedOption = options.map(o => o.value).indexOf(input.value);
    setSuggestions([]);
    setIndexActiveSuggestion(undefined);
    setInputSearch(options[indexSelectedOption]?.label || '');
    setIndexSelectedOption(
      indexSelectedOption !== -1 ? indexSelectedOption : undefined,
    );
    setShowSuggestions(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input.value]);

  const onKeyUp = event => {
    const inputSearchValue = event.currentTarget.value.trim();

    if (event.key === 'ArrowUp') {
      if (indexActiveSuggestion !== undefined) {
        setIndexActiveSuggestion(
          indexActiveSuggestion > 0 ? indexActiveSuggestion - 1 : 0,
        );
      }
    } else if (event.key === 'ArrowDown') {
      setIndexActiveSuggestion(
        indexActiveSuggestion === suggestions.length - 1
          ? suggestions.length - 1
          : indexActiveSuggestion + 1,
      );
    } else if (event.key === 'Enter') {
      updateSelectedOption(suggestions, input.onChange, indexActiveSuggestion);
    } else if (inputSearchValue.length === 0) {
      setSuggestions([]);
      setIndexActiveSuggestion(undefined);
    } else {
      const flags = caseSensitive ? 'g' : 'gi';
      const regEx = new RegExp(inputSearchValue, flags);
      setSuggestions(
        inputSearchValue === ''
          ? []
          : options
              .filter(
                o => getOptionLabel(o.label, o.value).search(regEx) !== -1,
              )
              .splice(0, numSuggestionsShown),
      );
      setIndexActiveSuggestion(0);
      setInputSearch(inputSearchValue);
    }
  };

  const onBlur = () => {
    setShowSuggestions(false);
  };

  const onClick = indexClickedSuggestion => {
    updateSelectedOption(suggestions, input.onChange, indexClickedSuggestion);
  };

  const removeSelectedOption = () => {
    input.onChange('');
  };

  const id = getControlId('input-autocomplete', input.name);
  const searchInputStyle = {
    display: showSuggestions ? 'block' : 'none',
  };

  return (
    <div className={COMPONENT_CLASS}>
      <label htmlFor={id}>
        {label}
        {required && <span className="ctrl-required">*</span>}
      </label>
      <div>
        <input type="hidden" name={input.name} />

        <div className="input-group">
          <div className="input-group-addon">
            <i
              className={ClassSet({
                glyphicon: true,
                [NO_OPTION_SELECTED_ICON]: !indexSelectedOption,
                [OPTION_SELECTED_ICON]: indexSelectedOption,
              })}
            />
          </div>

          {/* This is the search input */}
          <input
            value={inputSearch}
            className="form-control"
            type="text"
            onKeyDown={event => {
              // In this way the form submit is avoided
              if (event.key === 'Enter') event.preventDefault();
            }}
            onKeyUp={event => onKeyUp(event)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={debounce(onBlur, 500)}
            onChange={event => setInputSearch(event.currentTarget.value)}
            ref={node => setInput(node)}
          />
          {input.value && (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <div
              className={`input-group-addon ${BUTTON_CLEAR_CLASS}`}
              onClick={() => {
                removeSelectedOption();
              }}
            >
              <i
                className={`glyphicon form-control-feedback ${OPTION_CLEAR_ICON}`}
              />
            </div>
          )}
        </div>

        {suggestions.length > 0 && (
          <ul style={searchInputStyle}>
            {suggestions.map(
              (
                su,
                index, // eslint-disable-next-line jsx-a11y/no-static-element-interactions
              ) => (
                <li
                  key={su.value}
                  aria-hidden
                  className={ClassSet({
                    active: index === indexActiveSuggestion,
                  })}
                  onClick={() => {
                    onClick(index);
                  }}
                >
                  <HighLighter
                    highlight={inputSearch}
                    caseSensitive={caseSensitive}
                  >
                    {getOptionLabel(su.label, su.value)}
                  </HighLighter>
                </li>
              ),
            )}
          </ul>
        )}
        {touched && error && <span className="form-error">{error}</span>}
      </div>
    </div>
  );
};

InputAutocomplete.propTypes = {
  input: PropTypes.shape(fieldInputPropTypes).isRequired,
  meta: PropTypes.shape(fieldMetaPropTypes).isRequired,
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
  numSuggestionsShown: PropTypes.number,
  getOptionLabel: PropTypes.func,
  caseSensitive: PropTypes.bool,
  focusOnInit: PropTypes.bool,
};

InputAutocomplete.defaultProps = {
  required: false,
  children: [],
  numSuggestionsShown: 10,
  getOptionLabel: label => {
    return label;
  },
  caseSensitive: true,
  focusOnInit: false,
};

export default InputAutocomplete;
