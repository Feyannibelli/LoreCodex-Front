import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
  placeholder?: string;
  className?: string;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Search...",
  className,
  onKeyPress,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn(
        "flex items-center w-full max-w-2xl",
        className
      )}
    >
      <div className="relative flex-1 group">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search className="h-5 w-5 text-text-muted group-focus-within:text-brand-500 transition-colors" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          className={cn(
            "w-full pl-12 pr-4 py-3",
            "bg-surface-2 border border rounded-l-lg",
            "text-text placeholder:text-placeholder",
            "focus:outline-none focus:ring-2 focus:ring-brand-300/50 focus:border-transparent",
            "transition-all duration-200",
            "hover:border-brand-500/30"
          )}
        />
      </div>
      <button
        type="submit"
        className={cn(
          "px-6 py-3 rounded-r-lg",
          "bg-brand-500 text-white",
          "hover:bg-brand-600 active:bg-brand-700",
          "focus:outline-none focus:ring-2 focus:ring-brand-300/50 focus:ring-offset-2 focus:ring-offset-bg",
          "transition-all duration-200",
          "font-medium",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <Search className="h-5 w-5" />
      </button>
    </form>
  );
};

export default SearchBar;

