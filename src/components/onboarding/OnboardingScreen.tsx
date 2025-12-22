'use client';

import React, { useState } from 'react';
import { selectStorageFolder } from '../../utils/tauri-api';

interface OnboardingScreenProps {
  onSelectStorage: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onSelectStorage }) => {
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelectClick = async () => {
    setIsSelecting(true);
    try {
      const result = await selectStorageFolder();
      if (result) {
        // 성공 시 부모 컴포넌트에 알림
        onSelectStorage();
      }
      // 취소된 경우 (result === null) 아무 동작 없음
    } catch (error) {
      console.error('Failed to select storage folder:', error);
      // 에러 발생 시에도 온보딩 화면 유지
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900 p-8 text-neutral-800 dark:text-neutral-200 transition-colors duration-500">
      <div className="max-w-md w-full space-y-12 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-light tracking-tight text-neutral-900 dark:text-white">
            Cognitive OS
          </h1>
          <p className="text-lg text-neutral-500 dark:text-neutral-400 font-light">
            인지 부하 제로 지식 관리 시스템.
            <br />
            생각이 떠오르는 즉시 기록하세요.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-medium dark:text-white">저장소 설정</h2>
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              메모를 저장할 로컬 폴더를 선택해주세요.
              <br />
              (iCloud, Google Drive 등 동기화 폴더를 권장합니다)
            </p>
          </div>

          <button
            onClick={handleSelectClick}
            disabled={isSelecting}
            className="w-full py-4 px-6 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors active:scale-[0.98] duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSelecting ? '선택 중...' : '저장소 선택하기'}
          </button>
        </div>

        <p className="text-xs text-neutral-400 font-light">
          설정된 폴더에 마크다운(.md) 파일로 저장되어 데이터 주권이 보장됩니다.
        </p>
      </div>
    </div>
  );
};
