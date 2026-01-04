import React from 'react';

import { Tab } from '@/types/config';

interface TapBarViewProps {
  tabs: Tab[];
  onAddTab: () => void;
  onSwitchTab: (tab: Tab) => void;
  onCloseTab: (tab?: Tab) => void;
}

const TapBarView: React.FC<TapBarViewProps> = ({
  tabs,
  onAddTab,
  onSwitchTab,
  onCloseTab,
}) => {
  return (
    <div className="w-full h-12 flex-shrink-0 bg-blue-200 flex flex-row items-center gap-2 px-2 mb-0">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all min-w-0 cursor-pointer
            ${tab.focused ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
          `}
          onClick={() => onSwitchTab(tab)}
        >
          <span className="text-sm font-medium truncate max-w-[150px]">
            {tab.id}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCloseTab(tab!);
            }}
            className={`
              flex items-center justify-center w-4 h-4 rounded-full transition-colors
              ${tab.focused ? 'hover:bg-blue-600 text-white' : 'hover:bg-gray-400 text-gray-600'}
            `}
            aria-label="Close tab"
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
      ))}
      <button
        onClick={onAddTab}
        className="
          flex items-center justify-center w-8 h-8 rounded-lg
          bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors
        "
        aria-label="Add tab"
      >
        <svg
          className="w-5 h-5"
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
      </button>
    </div>
  );
};

export default TapBarView;
