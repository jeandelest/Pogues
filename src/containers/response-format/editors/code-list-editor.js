import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import CodeEditor from './code-editor';
import CodeCreator from './code-creator';
import { editCodeList, loadCodeListIfNeeded } from 'actions/code-list';
import { createCode, editCode, removeCode, moveUpCode, moveDownCode } from 'actions/code';

const mapStateToProps = (state, { id }) => {
  const codeList = state.codeListById[id];
  if (codeList.isSpec && !codeList.loaded)
    return {
      loaded: false,
    };
  return {
    loaded: true,
    label: codeList.label,
    editable: !codeList.isSpec,
    detailedCodes: codeList.codes.map(codeId => state.codeById[codeId]),
  };
};

const mapDispatchToProps = {
  loadCodeListIfNeeded,
  createCode,
  removeCode,
  moveUpCode,
  moveDownCode,
  editCode,
  editCodeList,
};

class CodeListEditor extends Component {
  static propTypes = {
    loadCodeListIfNeeded: PropTypes.func.isRequired,
    createCode: PropTypes.func.isRequired,
    removeCode: PropTypes.func.isRequired,
    moveUpCode: PropTypes.func.isRequired,
    moveDownCode: PropTypes.func.isRequired,
    editCode: PropTypes.func.isRequired,
    loaded: PropTypes.bool.isRequired,
    editCodeList: PropTypes.func.isRequired,
    locale: PropTypes.object.isRequired,
    id: PropTypes.string, // not required, if we cre
    detailedCodes: PropTypes.array, // not required since the codes might not be loaded yet
    label: PropTypes.string,
    editable: PropTypes.bool,
  };

  static defaultProps = {
    id: undefined,
    detailedCodes: undefined,
    label: undefined,
    editable: undefined,
  };

  componentWillMount() {
    this.props.loadCodeListIfNeeded(this.props.id);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.id !== this.props.id) this.props.loadCodeListIfNeeded(nextProps.id);
  }

  render() {
    const {
      id,
      loaded,
      label,
      detailedCodes,
      createCode,
      removeCode,
      editCode,
      locale,
      editCodeList,
      editable,
      moveUpCode,
      moveDownCode,
    } = this.props;
    if (!loaded) return <span className="fa fa-spinner fa-pulse fa-2x" />;
    return (
      <div className="panel panel-default">
        <div className="panel-body bg-primary">
          <div className="form-group">
            <label htmlFor="label" className="col-sm-2 control-label">
              {locale.label}
            </label>
            <div className="col-sm-10">
              <input
                type="text"
                id="label"
                disabled={!editable}
                value={label || ''}
                onChange={e => editCodeList(id, { label: e.target.value })}
                className="form-control"
                placeholder="Code list name"
              />
            </div>
          </div>
          {editable && <CodeCreator locale={locale} hndlEnterKey={val => createCode(id, val)} />}
          {detailedCodes.map(({ id: codeId, label, value }) => (
            <CodeEditor
              key={codeId}
              id={codeId}
              label={label}
              value={value}
              editLabel={label => editCode(codeId, { label })}
              editValue={value => editCode(codeId, { value })}
              remove={() => removeCode(codeId, id)}
              moveUp={() => moveUpCode(codeId, id)}
              moveDown={() => moveDownCode(codeId, id)}
              editable={editable}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CodeListEditor);
