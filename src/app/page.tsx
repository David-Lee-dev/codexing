'use client';

import { useEffect, useState } from 'react';

import { getConfig } from '@/features/config/api/configApi';
import { AppConfig } from '@/features/config/types';
import { initDatabase } from '@/features/database/api/databaseApi';
import { MemoView } from '@/features/note/components/MemoView';
import { OnboardingScreen } from '@/features/onboarding/components/OnboardingScreen';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const config: AppConfig = await getConfig();

        if (config.storage_path) {
          await initDatabase();
        } else {
          setIsOnboarding(true);
        }
      } catch (error) {
        console.error('[Home] Config 로드 실패:', error);
        setIsOnboarding(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleStorageSelect = async () => {
    try {
      const config = await getConfig();
      console.log('config', config);
      if (config.storage_path) {
        setIsOnboarding(false);
      }
    } catch (error) {
      console.error('[Home] 저장소 선택 후 Config 확인 실패:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <p className="text-gray-500 font-light animate-pulse">Codexing...</p>
      </div>
    );
  }

  if (isOnboarding) {
    return (
      <div className="animate-in fade-in duration-700">
        <OnboardingScreen onSelectStorage={handleStorageSelect} />
      </div>
    );
  }

  return <MemoView />;
}
