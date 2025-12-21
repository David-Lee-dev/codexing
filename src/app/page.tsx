'use client';

import { useState, useEffect } from 'react';
import { OnboardingScreen } from '../components/onboarding/OnboardingScreen';
import { MemoView } from '../components/memo/MemoView';
import { getConfig } from '../utils/tauri-api';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const config = await getConfig();
        if (!config.storage_path) {
          setIsOnboarding(true);
        }
      } catch (error) {
        console.error('Failed to check config:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkConfig();
  }, []);

  const handleStorageSelect = () => {
    // 1단계 Mock: 온보딩 완료 처리
    setIsOnboarding(false);
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

  // 저장소 설정이 완료된 경우 MemoView 렌더링
  return <MemoView />;
}
