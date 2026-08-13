import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select option',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-900/60 border border-slate-800/80 rounded-lg text-xs font-semibold text-slate-300 hover:border-slate-700/60 focus:outline-none focus:border-primary-500/50 disabled:bg-slate-950/40 disabled:text-slate-600 disabled:border-slate-800/40 disabled:cursor-not-allowed transition-all text-left select-none cursor-pointer"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`text-slate-500 transition-transform duration-200 ml-2 shrink-0 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-slate-900 border border-slate-800/85 rounded-xl shadow-xl overflow-hidden animate-fade-in left-0">
          <div className="max-h-52 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-slate-800">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-500 italic">No options available</div>
            ) : (
              options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs transition-colors hover:bg-primary-600/10 hover:text-primary-400 cursor-pointer block truncate ${
                    opt.value === value
                      ? 'bg-primary-600/15 text-primary-400 font-semibold'
                      : 'text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
