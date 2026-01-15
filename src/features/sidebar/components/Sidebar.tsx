'use client';

import React, { useState } from 'react';

import { SidebarView } from './SidebarView';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleNewNote = () => {
    console.log('New note');
  };

  const handleSearch = () => {
    console.log('Search');
  };

  return (
    <SidebarView
      isCollapsed={isCollapsed}
      onToggleCollapse={handleToggleCollapse}
      onNewNote={handleNewNote}
      onSearch={handleSearch}
    />
  );
};
