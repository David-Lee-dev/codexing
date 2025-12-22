'use client';

import { useState, useEffect } from 'react';
import { OnboardingScreen } from '../features/onboarding/components/OnboardingScreen';
import { MemoView } from '../features/note/components/MemoView';
import { getConfig } from '../features/config/api/configApi';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const config = await getConfig();

        // storage_path가 없으면 온보딩 화면으로
        if (!config.storage_path) {
          setIsOnboarding(true);
        } else {
        }
      } catch (error) {
        console.error('[Home] Config 로드 실패:', error);
        // 에러 시 온보딩 화면으로
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
      if (config.storage_path) {
        setIsOnboarding(false);
      }
    } catch (error) {
      console.error('[Home] 저장소 선택 후 Config 확인 실패:', error);
    }
  };

  // 로딩 화면
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <p className="text-gray-500 font-light animate-pulse">Codexing...</p>
      </div>
    );
  }

  // 온보딩 화면
  if (isOnboarding) {
    return (
      <div className="animate-in fade-in duration-700">
        <OnboardingScreen onSelectStorage={handleStorageSelect} />
      </div>
    );
  }

  // 메모 화면
  return <MemoView />;
}
