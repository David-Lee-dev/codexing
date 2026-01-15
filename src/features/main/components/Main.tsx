'use client';

import React from 'react';

import { MainView } from './MainView';

export const Main: React.FC = () => {
  // 더미 데이터 (디자인 확인용)
  const hasActiveDocument = true;
  const documentTitle = 'Welcome Note';

  return (
    <MainView
      hasActiveDocument={hasActiveDocument}
      documentTitle={documentTitle}
    />
  );
};
