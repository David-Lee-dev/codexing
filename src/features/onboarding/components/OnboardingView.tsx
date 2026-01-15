'use client';

import React from 'react';

export interface OnboardingViewProps {
  onStart: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onStart }) => {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-onboarding-warm overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-onboarding-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-30%] left-[-15%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-onboarding-accent/3 rounded-full blur-3xl" />
      </div>

      {/* 메인 카드 */}
      <div className="relative z-10 w-full max-w-md mx-4 sm:mx-6 max-h-[calc(100vh-3rem)] flex flex-col opacity-0 animate-card-reveal">
        <div className="bg-onboarding-cream rounded-2xl shadow-xl shadow-black/5 border border-onboarding-border-subtle p-5 sm:p-7 lg:p-9 flex flex-col min-h-0">
          {/* 로고/아이콘 */}
          <div className="flex justify-center mb-4 sm:mb-6 opacity-0 animate-fade-up-1 flex-shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-onboarding-accent to-onboarding-accent-hover flex items-center justify-center shadow-lg shadow-onboarding-accent/20">
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
          </div>

          {/* 타이틀 */}
          <div className="text-center mb-4 sm:mb-6 opacity-0 animate-fade-up-2 flex-shrink-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-onboarding-text-primary mb-1 sm:mb-2">
              Welcome to Memo
            </h1>
            <p className="text-onboarding-text-secondary text-xs sm:text-sm leading-relaxed">
              생각을 자유롭게 기록하고 정리하세요.
              <br />
              당신만의 공간이 준비되었습니다.
            </p>
          </div>

          {/* 기능 소개 */}
          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 opacity-0 animate-fade-up-3 flex-shrink min-h-0">
            <FeatureItem
              icon={
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>
              }
              title="간편한 노트 작성"
              description="블록 기반 에디터로 빠르게 기록"
            />
            <FeatureItem
              icon={
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                  />
                </svg>
              }
              title="탭으로 관리"
              description="여러 노트를 동시에 열고 작업"
            />
            <FeatureItem
              icon={
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                  />
                </svg>
              }
              title="자동 저장"
              description="작성 중인 내용이 안전하게 보관"
            />
          </div>

          {/* 시작 버튼 */}
          <div className="opacity-0 animate-fade-up-4 flex-shrink-0">
            <button
              onClick={onStart}
              className="
                w-full py-2.5 sm:py-3 rounded-xl font-medium text-white text-sm sm:text-base
                bg-gradient-to-r from-onboarding-accent to-onboarding-accent-hover
                hover:shadow-lg hover:shadow-onboarding-accent/25
                transform hover:-translate-y-0.5
                transition-all duration-200 ease-out
                cursor-pointer
              "
            >
              시작하기
            </button>
          </div>

          {/* 저장 위치 선택 안내 */}
          <div className="mt-3 sm:mt-4 text-center opacity-0 animate-fade-up-5 flex-shrink-0">
            <p className="text-[10px] sm:text-xs text-onboarding-text-muted">
              시작하면 노트 저장 위치를 선택합니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Feature Item 컴포넌트
interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-xl hover:bg-onboarding-warm/50 transition-colors">
      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-onboarding-accent/10 flex items-center justify-center text-onboarding-accent">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-xs sm:text-sm font-medium text-onboarding-text-primary">
          {title}
        </h3>
        <p className="text-[10px] sm:text-xs text-onboarding-text-muted mt-0.5">
          {description}
        </p>
      </div>
    </div>
  );
};
