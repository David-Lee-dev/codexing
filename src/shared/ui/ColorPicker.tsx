'use client';

import React, { memo, useCallback, useRef, useState } from 'react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export const ColorPicker = memo(function ColorPicker({
  label,
  value,
  onChange,
}: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(value);

  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newColor = e.target.value;
      setInputValue(newColor);
      onChange(newColor);
    },
    [onChange],
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
        onChange(newValue);
      }
    },
    [onChange],
  );

  const handleSwatchClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-ctp-subtext1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={handleTextChange}
          className="w-20 px-2 py-1 text-xs font-mono text-ctp-text border border-ctp-surface1 rounded-lg bg-ctp-surface0 focus:outline-none focus:ring-1 focus:ring-ctp-lavender"
        />
        <button
          type="button"
          onClick={handleSwatchClick}
          className="w-8 h-8 rounded-lg border border-ctp-surface1 cursor-pointer hover:ring-2 hover:ring-ctp-lavender/50 transition-all"
          style={{ backgroundColor: value }}
        />
        <input
          ref={inputRef}
          type="color"
          value={value}
          onChange={handleColorChange}
          className="sr-only"
        />
      </div>
    </div>
  );
});
