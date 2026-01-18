'use client';

import React from 'react';

import { getStoreActions } from '@/core/store';
import { configApi } from '@/shared/api/config.api';

import { OnboardingView } from './OnboardingView';

export const Onboarding: React.FC = () => {
  const handleStart = async () => {
    const { setIsStorageSelected, setIsDatabaseInitialized, setIsInitialized } =
      getStoreActions();

    const result = await configApi.selectStorage();

    if (!result.success || !result.data) {
      return;
    }
    await configApi.initDatabase();
    await configApi.saveConfig({
      storagePath: result.data,
      isDatabaseInitialized: true,
      tabs: [],
    });

    setIsInitialized(false);
    setIsStorageSelected(true);
    setIsDatabaseInitialized(true);
  };

  return <OnboardingView onStart={handleStart} />;
};
