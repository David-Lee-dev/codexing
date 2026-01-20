'use client';

import React from 'react';

export interface WelcomeViewProps {
  onCreateNote: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onCreateNote }) => {
  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center bg-ctp-base overflow-y-auto py-12">
      <div className="max-w-2xl w-full px-8 space-y-10">
        {/* 헤더 */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-ctp-text">Codexing</h1>
          <p className="text-ctp-subtext0 text-sm">
            생각을 연결하고 아이디어를 시각화하는 메모 앱
          </p>
        </div>

        {/* 새 노트 버튼 */}
        <div className="flex justify-center">
          <button
            onClick={onCreateNote}
            className="
              inline-flex items-center gap-2 px-8 py-3.5
              bg-ctp-lavender text-ctp-crust text-sm font-semibold rounded-xl
              hover:bg-ctp-blue active:bg-ctp-sapphire
              transition-colors duration-150
              shadow-sm hover:shadow-md
            "
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            새 노트 만들기
          </button>
        </div>

        {/* 주요 기능 소개 */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-ctp-subtext1 text-center">
            주요 기능
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <FeatureCard
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="3" strokeWidth={1.5} />
                  <circle cx="5" cy="8" r="2" strokeWidth={1.5} />
                  <circle cx="19" cy="8" r="2" strokeWidth={1.5} />
                  <circle cx="8" cy="18" r="2" strokeWidth={1.5} />
                  <circle cx="16" cy="18" r="2" strokeWidth={1.5} />
                  <path
                    strokeLinecap="round"
                    strokeWidth={1.5}
                    d="M9.5 10.5L6.5 9M14.5 10.5L17.5 9M10 14l-1 3M14 14l1 3"
                  />
                </svg>
              }
              title="그래프 뷰"
              description="노트와 태그의 관계를 시각적으로 탐색"
              shortcut="⌘+G"
              color="text-ctp-blue"
            />
            <FeatureCard
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                  />
                </svg>
              }
              title="AI 태그 생성"
              description="내용 기반 자동 태그 추천"
              color="text-ctp-mauve"
            />
            <FeatureCard
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776"
                  />
                </svg>
              }
              title="탭 기반 편집"
              description="여러 노트를 동시에 열어 작업"
              shortcut="⌘+T"
              color="text-ctp-green"
            />
            <FeatureCard
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              }
              title="시맨틱 검색"
              description="의미 기반으로 관련 노트 검색"
              color="text-ctp-peach"
            />
          </div>
        </div>

        {/* 자동 저장 안내 */}
        <div className="flex items-center justify-center gap-2 text-ctp-overlay1 text-xs">
          <svg
            className="w-4 h-4 text-ctp-green"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>모든 변경사항은 자동으로 저장됩니다</span>
        </div>

        {/* 핵심 단축키 */}
        <div className="pt-6 border-t border-ctp-surface0">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-ctp-overlay1">
            <span>
              <kbd className="px-1.5 py-0.5 bg-ctp-surface0 rounded text-ctp-subtext1">
                ⌘+T
              </kbd>{' '}
              새 노트
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-ctp-surface0 rounded text-ctp-subtext1">
                ⌘+W
              </kbd>{' '}
              탭 닫기
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-ctp-surface0 rounded text-ctp-subtext1">
                ⌘+G
              </kbd>{' '}
              그래프 토글
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-ctp-surface0 rounded text-ctp-subtext1">
                ⌘+1~9
              </kbd>{' '}
              탭 이동
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  shortcut?: string;
  color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  shortcut,
  color,
}) => {
  return (
    <div className="p-4 rounded-xl bg-ctp-surface0/50 border border-ctp-surface1/50 space-y-2">
      <div className="flex items-center justify-between">
        <div className={`${color}`}>{icon}</div>
        {shortcut && (
          <kbd className="px-1.5 py-0.5 text-[10px] bg-ctp-surface1 rounded text-ctp-overlay1">
            {shortcut}
          </kbd>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-ctp-text">{title}</h3>
        <p className="text-xs text-ctp-subtext0 mt-0.5">{description}</p>
      </div>
    </div>
  );
};
