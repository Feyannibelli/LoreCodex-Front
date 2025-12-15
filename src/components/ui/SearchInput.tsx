import React from 'react';

type SearchInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
    ({ className, ...props }, ref) => (
        <input
            ref={ref}
            {...props}
            className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 placeholder-slate-400 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-50 dark:placeholder:text-slate-500 ${className ?? ''}`}
        />
    )
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;
