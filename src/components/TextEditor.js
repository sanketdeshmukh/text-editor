import React, { useState, useEffect, useRef, useCallback } from 'react';
import { EditorState, RichUtils, Modifier, convertToRaw, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './editor.css'

const TextEditor = () => {
  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
      const contentState = convertFromRaw(JSON.parse(savedContent));
      return EditorState.createWithContent(contentState);
    } else {
      return EditorState.createEmpty();
    }
  });
  const editor = useRef(null);

  const handleBeforeInput = useCallback((chars, editorState) => {
    const content = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const block = content.getBlockForKey(selection.getStartKey());
    const blockText = block.getText();


    if (chars === ' ' && blockText.startsWith('#')) {
      const newContent = Modifier.removeRange(
        content,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 1,
        }),
        'backward'
      );
      const newEditorState = EditorState.push(editorState, newContent, 'remove-range');
      setEditorState(RichUtils.toggleBlockType(newEditorState, 'header-one'));
      return 'handled';
    }

    if (chars === ' ' && blockText.startsWith('*') && blockText !== "**" && blockText !== "***") {
      const newContent = Modifier.removeRange(
        content,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 1,
        }),
        'backward'
      );

      const newEditorState = EditorState.push(editorState, newContent, 'remove-range');
      const currentInlineStyles = newEditorState.getCurrentInlineStyle();
      const shouldRemoveStyles = currentInlineStyles.contains('BOLD');
      if (shouldRemoveStyles) {
        setEditorState(RichUtils.toggleInlineStyle(newEditorState, 'NORMAL'));
      }
      else {
        setEditorState(RichUtils.toggleInlineStyle(newEditorState, 'BOLD'));
      }
      return 'handled';
    }

    if (chars === ' ' && blockText.startsWith('**') && blockText !== "***") {
      const newContent = Modifier.removeRange(
        content,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 2,
        }),
        'backward'
      );
      const newEditorState = EditorState.push(editorState, newContent, 'remove-range');
      const currentInlineStyles = newEditorState.getCurrentInlineStyle();
      const shouldRemoveStyles = currentInlineStyles.contains('RED');
      if (shouldRemoveStyles) {
        setEditorState(RichUtils.toggleInlineStyle(newEditorState, null));
      }
      else {
        setEditorState(RichUtils.toggleInlineStyle(newEditorState, 'RED'));
      }

      return 'handled';
    }

    if (chars === ' ' && blockText.startsWith('***')) {
      const newContent = Modifier.removeRange(
        content,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 3,
        }),
        'backward'
      );
      const newEditorState = EditorState.push(editorState, newContent, 'remove-range');
      const currentInlineStyles = newEditorState.getCurrentInlineStyle();
      const shouldRemoveStyles = currentInlineStyles.contains('UNDERLINE');
      if (shouldRemoveStyles) {
        setEditorState(RichUtils.toggleInlineStyle(newEditorState, 'noUnderline'));
      }
      else {
        setEditorState(RichUtils.toggleInlineStyle(newEditorState, 'UNDERLINE'));
      }
      return 'handled';
    }

    if (chars === ' ' && blockText.startsWith('````')) {
      const newContent = Modifier.removeRange(
        content,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 4,
        }),
        'backward'
      );
      const newEditorState = EditorState.push(editorState, newContent, 'remove-range');
      setEditorState(RichUtils.toggleCode(newEditorState));
      return 'handled';
    }

    return 'not-handled';
  }, []);

  const handleSaveContent = () => {
    const contentState = editorState.getCurrentContent();
    saveContentToLocalStorage(editorState);
    const rawContent = convertToRaw(contentState);
    console.log(rawContent);
  };

  const saveContentToLocalStorage = (editorState) => {
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    localStorage.setItem('editorContent', JSON.stringify(rawContent));
  };

  const customStyleMap = {
    RED: {
      color: 'red',
    },
    null: {
      color: '',
    },
    UNDERLINE: {
      textDecoration: 'underline',
    },
    noUnderline: {
      textDecoration: 'none'
    },
    NORMAL: {
      fontWeight: 'normal',
    }
  };

  // to unhide the toolbar please remove toolbarHidden attribute

  return (
    <div class="container">
      <h4 class="title">Demo Editor by Sanket Deshmukh</h4>
      <button class="save-button" onClick={handleSaveContent}>Save</button>
      <div class="editor-container">
        <Editor
          editorState={editorState}
          wrapperClassName="demo-wrapper"
          editorClassName="demo-editor"
          onEditorStateChange={setEditorState}
          handleBeforeInput={handleBeforeInput}
          toolbarHidden
          customStyleMap={customStyleMap}
          readOnly={false}
          ref={editor}
        />
      </div>
    </div>
  );
};

export default TextEditor;