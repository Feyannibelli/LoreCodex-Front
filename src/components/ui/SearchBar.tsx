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
        "flex w-full max-w-2xl relative shadow-lg shadow-black/20 rounded-full",
        className
      )}
    >
      <div className="relative flex-1 group z-10">
        <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          className={cn(
            "w-full pl-12 pr-4 py-4 h-14",
            "bg-card/90 backdrop-blur-sm border border-white/5 rounded-l-full",
            "text-foreground placeholder:text-muted-foreground/70",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-card",
            "transition-all duration-300",
            "text-base"
          )}
        />
      </div>
      <button
        type="submit"
        className={cn(
          "px-8 py-3 rounded-r-full h-14 z-20",
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
          "transition-all duration-300 transform active:scale-[0.98]",
          "font-semibold tracking-wide",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "-ml-2"
        )}
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;

