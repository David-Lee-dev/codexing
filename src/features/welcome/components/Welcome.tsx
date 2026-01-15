'use client';

import React from 'react';

import { WelcomeView } from './WelcomeView';

export const Welcome: React.FC = () => {
  const handleCreateNote = () => {
    console.log('Create new note');
  };

  return <WelcomeView onCreateNote={handleCreateNote} />;
};
