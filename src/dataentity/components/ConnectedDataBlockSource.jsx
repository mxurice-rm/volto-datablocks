import { v4 as uuid } from 'uuid';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Icon from '@plone/volto/components/theme/Icon/Icon';

import linkSVG from '@plone/volto/icons/add-on.svg';
import unlinkSVG from '@plone/volto/icons/add-user.svg';
import { addDataEntity } from '../modifiers';
import cx from 'classnames';

import EditorUtils from 'draft-js-plugins-utils';
import { removeEntityOfSelection } from 'volto-addons/drafteditor/utils';
import { EditorState } from 'draft-js';

import EditForm from './EditForm';
import ForceEditorRefresh from './ForceEditorRefresh';
import * as types from '../types';

class DataButton extends Component {
  static propTypes = {
    placeholder: PropTypes.string,
    store: PropTypes.shape({}).isRequired,
    onOverrideContent: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      editorKey: null,
    };
  }

  onMouseDown = event => {
    event.preventDefault();
  };

  onButtonClick = e => {
    e.preventDefault();
    e.stopPropagation();

    // TODO: this needs to be fixed, to be a toggle

    const { getEditorState, setEditorState } = this.props.store;
    const editorState = getEditorState();
    const newState = addDataEntity(editorState, {});

    setEditorState(newState);
  };

  onRemoveBlockAtSelection = e => {
    // TODO: this needs to be implemented!
    // console.log('remove block');

    e.preventDefault();
    e.stopPropagation();

    const { getEditorState, setEditorState } = this.props.store;
    setEditorState(removeEntityOfSelection(getEditorState()));
  };

  onChangeBlock() {
    // console.log('on change block', arguments);
  }

  onChangeEntityData = (entityKey, data) => {
    const { getEditorState, setEditorState } = this.props.store;
    const editorState = getEditorState();
    const contentState = editorState.getCurrentContent();
    const newContentState = contentState.mergeEntityData(entityKey, data);
    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      'change-dataentity',
    );

    // this is needed to force redraw of entity component, should rewrite
    // TODO: use EditorState.forceSelection
    const focusedState = EditorState.moveFocusToEnd(newEditorState);
    setEditorState(focusedState);
    this.setState({ editorKey: uuid() });
  };

  render() {
    const { theme, getEditorState } = this.props;

    const isSelected = EditorUtils.hasEntity(
      getEditorState(),
      types.DATAENTITY,
    );

    const editorState = getEditorState();
    const currentEntityKey = EditorUtils.getCurrentEntityKey(editorState);
    const currentEntity = EditorUtils.getCurrentEntity(editorState);

    const className = cx(theme.button, { [theme.active]: isSelected });

    return (
      <div
        className={theme.buttonWrapper}
        onMouseDown={this.onMouseDown}
        role="presentation"
      >
        <ForceEditorRefresh editorKey={this.state.editorKey} />
        <button
          className={className}
          onClick={
            isSelected ? this.onRemoveBlockAtSelection : this.onButtonClick
          }
          type="button"
        >
          {!isSelected ? (
            <Icon name={linkSVG} size="24px" />
          ) : (
            <Icon name={unlinkSVG} size="24px" />
          )}
        </button>

        {isSelected ? (
          <EditForm
            onChangeBlock={this.onChangeBlock}
            onChangeEntityData={this.onChangeEntityData}
            block="data-entity"
            entityKey={currentEntityKey}
            data={currentEntity.data}
            title="Data block parameters"
          />
        ) : (
          ''
        )}
      </div>
    );
  }
}

export default DataButton;