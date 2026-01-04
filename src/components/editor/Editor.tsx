'use client';

import React from 'react';

import EditorView from './EditorView';

const Editor: React.FC = () => {
  const handlePressEnter = (event: KeyboardEvent) => {
    console.log(event);
  };
  const handlePressBackspace = (event: KeyboardEvent) => {
    console.log(event);
  };
  const handlePressArrowUp = (event: KeyboardEvent) => {
    console.log(event);
  };
  const handlePressArrowDown = (event: KeyboardEvent) => {
    console.log(event);
  };
  const handleClickBlock = (event: MouseEvent) => {
    console.log(event);
  };

  return (
    <EditorView
      onPressEnter={handlePressEnter}
      onPressBackspace={handlePressBackspace}
      onPressArrowUp={handlePressArrowUp}
      onPressArrowDown={handlePressArrowDown}
      onClickBlock={handleClickBlock}
    />
  );
};

export default Editor;
