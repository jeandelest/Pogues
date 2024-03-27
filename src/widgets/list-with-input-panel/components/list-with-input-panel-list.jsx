import React from 'react';
import PropTypes from 'prop-types';

import ListWithInputPanelItem from './list-with-input-panel-item';

import { WIDGET_LIST_WITH_INPUT_PANEL } from '../../../constants/dom-constants';
import Dictionary from '../../../utils/dictionary/dictionary';
import { markdownVtlToString } from '../../../forms/controls/rich-textarea/utils/rich-textarea-utils';

const { LIST_CLASS, LIST_EMPTY_CLASS } = WIDGET_LIST_WITH_INPUT_PANEL;

// PropTypes and defaultProps

export const propTypes = {
  fields: PropTypes.object.isRequired,
  select: PropTypes.func.isRequired,
  errors: PropTypes.array,
};

export const defaultProps = {
  errors: [],
};

// Component

function ListWithInputPanelList({ fields, select, errors }) {
  const name = fields.name.split('.')[1];

  return (
    <ul className={LIST_CLASS}>
      {fields.length === 0 && (
        <li className={LIST_EMPTY_CLASS}>{Dictionary[`no_${name}`]}</li>
      )}
      {fields.map((key, index, listFields) => {
        const item = listFields.get(index);
        let errorsItem = [];

        if (item.id) {
          errorsItem = errors.filter(e => e.itemListId === item.id);
        }
        let prefix = '';
        if (item.x || item.y) {
          prefix += `(${item.x}`;
          if (item.y) prefix += `,${item.y}`;
          prefix += ') ';
        }
        return (
          <ListWithInputPanelItem
            key={key}
            select={() => select(index)}
            invalid={errorsItem.length > 0}
          >
            {prefix}
            {markdownVtlToString(item.label)}
          </ListWithInputPanelItem>
        );
      })}
    </ul>
  );
}

ListWithInputPanelList.propTypes = propTypes;
ListWithInputPanelList.defaultProps = defaultProps;

export default ListWithInputPanelList;
