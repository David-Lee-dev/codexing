'use client';

import { memo } from 'react';

import type { Tab } from '@/core/types';

export interface TabbarViewProps {
  tabs: Tab[];
  onSwitchTab: (tab: Tab) => void;
  onCloseTab: (tab: Tab) => void;
  onAddTab: () => void;
}

const TabbarViewComponent: React.FC<TabbarViewProps> = ({
  tabs,
  onSwitchTab,
  onCloseTab,
  onAddTab,
}) => {
  return (
    <div
      className="flex items-center h-10 px-3 bg-stone-100/80 backdrop-blur-sm border-b border-stone-200/60"
      data-tauri-drag-region
    >
      {/* 탭 목록 + 새 탭 버튼 */}
      <div className="flex items-center gap-0.5 flex-1 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <TabItemMemo
            key={tab.documentId}
            tab={tab}
            title={tab.title || 'Untitled'}
            onSwitch={onSwitchTab}
            onClose={onCloseTab}
          />
        ))}

        {/* 새 탭 버튼 - 항상 마지막 탭 오른쪽에 위치 */}
        <button
          className="
            ml-1 w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0
            text-stone-400 hover:text-stone-600 hover:bg-stone-200/80
            transition-all duration-150
          "
          onClick={onAddTab}
          title="New note (⌘N)"
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
              strokeWidth={1.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export const TabbarView = memo(TabbarViewComponent, (prevProps, nextProps) => {
  return (
    prevProps.tabs.length === nextProps.tabs.length &&
    prevProps.tabs.every(
      (tab, idx) =>
        tab.documentId === nextProps.tabs[idx].documentId &&
        tab.isActive === nextProps.tabs[idx].isActive &&
        tab.title === nextProps.tabs[idx].title,
    )
  );
});

// TabItem 컴포넌트
interface TabItemProps {
  tab: Tab;
  title: string;
  onSwitch: (tab: Tab) => void;
  onClose: (tab: Tab) => void;
}

const TabItem: React.FC<TabItemProps> = ({ tab, title, onSwitch, onClose }) => {
  const handleClick = () => onSwitch(tab);
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose(tab);
  };

  return (
    <div
      className={`
        group relative flex items-center gap-1.5 pl-3 pr-2 py-1.5
        rounded-lg cursor-pointer select-none flex-shrink-0
        transition-all duration-150 ease-out
        ${
          tab.isActive
            ? 'bg-white shadow-sm text-stone-800'
            : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
        }
      `}
      onClick={handleClick}
    >
      <svg
        className={`w-3.5 h-3.5 flex-shrink-0 ${
          tab.isActive ? 'text-stone-500' : 'text-stone-400'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>

      {/* 탭 제목 */}
      <span className="text-xs font-medium truncate max-w-[100px]">
        {title}
      </span>

      {/* 닫기 버튼 */}
      <button
        className={`
          w-5 h-5 flex items-center justify-center rounded-md flex-shrink-0
          transition-all duration-150
          ${
            tab.isActive
              ? 'opacity-60 hover:opacity-100 hover:bg-stone-200'
              : 'opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-stone-300/50'
          }
        `}
        onClick={handleClose}
        title="Close tab"
      >
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

const TabItemMemo = memo(TabItem, (prevProps, nextProps) => {
  return (
    prevProps.tab.documentId === nextProps.tab.documentId &&
    prevProps.tab.isActive === nextProps.tab.isActive &&
    prevProps.title === nextProps.title
  );
});

TabItemMemo.displayName = 'TabItem';
