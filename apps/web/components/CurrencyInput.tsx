'use client';

import { useState, useEffect, useRef } from 'react';
import { formatCurrencyInput, parseCurrencyInput } from '@renovate-tracker/utils';

interface CurrencyInputProps {
  value: string | number;
  onChange: (value: string) => void;
  onBlur?: (value: number) => void;
  placeholder?: string;
  required?: boolean;
  min?: number;
  className?: string;
  disabled?: boolean;
}

export function CurrencyInput({
  value,
  onChange,
  onBlur,
  placeholder,
  required,
  min,
  className = '',
  disabled = false,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorPositionRef = useRef<number>(0);

  // Initialize display value
  useEffect(() => {
    const numValue = typeof value === 'string' ? parseCurrencyInput(value) : (value || 0);
    if (numValue > 0) {
      setDisplayValue(formatCurrencyInput(numValue));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Remove all non-digit characters
    const cleaned = inputValue.replace(/[^\d]/g, '');
    
    // Parse to number
    const numValue = cleaned ? parseInt(cleaned, 10) : 0;
    
    // Don't enforce min during typing, only on blur
    // Allow empty input
    const finalValue = numValue;
    
    // Format immediately
    const formatted = finalValue > 0 ? formatCurrencyInput(finalValue) : '';
    
    // Save cursor position before updating
    const cursorPos = e.target.selectionStart || 0;
    const oldValue = displayValue;
    const oldLength = oldValue.length;
    
    setDisplayValue(formatted);
    onChange(finalValue.toString());
    
    // Restore cursor position after formatting
    setTimeout(() => {
      if (inputRef.current) {
        const newLength = formatted.length;
        const lengthDiff = newLength - oldLength;
        
        // Calculate new cursor position
        // If we're at the end, keep at end
        // Otherwise try to maintain relative position
        let newCursorPos = cursorPos;
        if (cursorPos === oldLength) {
          newCursorPos = newLength;
        } else if (lengthDiff !== 0) {
          // Adjust cursor position based on comma changes
          const beforeCursor = oldValue.substring(0, cursorPos);
          const commasBefore = (beforeCursor.match(/,/g) || []).length;
          const newBeforeCursor = formatted.substring(0, cursorPos + lengthDiff);
          const newCommasBefore = (newBeforeCursor.match(/,/g) || []).length;
          newCursorPos = cursorPos + (newCommasBefore - commasBefore);
        }
        
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleBlur = () => {
    const numValue = parseCurrencyInput(displayValue);
    if (min && numValue < min) {
      const formatted = formatCurrencyInput(min);
      setDisplayValue(formatted);
      onChange(min.toString());
      onBlur?.(min);
    } else {
      onBlur?.(numValue);
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={className}
    />
  );
}

