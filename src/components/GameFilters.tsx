import React, { useState } from 'react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "./ui/dropdown-menu.tsx";
import Button from '../components/Button';

export interface DateFilter {
    before?: string;
    after?: string;
}

export interface FiltersState {
    genres: string[];
    dateFilter: DateFilter;
    minRating: number | null;
    sortBy: 'popularity' | 'releaseDate' | 'name' | null;
    sortOrder: 'asc' | 'desc';
}

interface GameFiltersProps {
    availableGenres: string[];
    onFilterChange: (filters: FiltersState) => void;
    onReset: () => void;
}

const GameFilters: React.FC<GameFiltersProps> = ({
                                                     availableGenres,
                                                     onFilterChange,
                                                     onReset
                                                 }) => {
    const [filters, setFilters] = useState<FiltersState>({
        genres: [],
        dateFilter: {},
        minRating: null,
        sortBy: null,
        sortOrder: 'desc'
    });

    const [showFilters, setShowFilters] = useState(false);

    const handleGenreChange = (genre: string) => {
        console.log('Genre clicked:', genre); // DEBUG
        const newGenres = filters.genres.includes(genre)
            ? filters.genres.filter(g => g !== genre)
            : [...filters.genres, genre];

        console.log('New genres:', newGenres); // DEBUG
        const newFilters = { ...filters, genres: newGenres };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleDateChange = (type: 'before' | 'after', value: string) => {
        const newDateFilter = { ...filters.dateFilter, [type]: value };
        const newFilters = { ...filters, dateFilter: newDateFilter };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleRatingChange = (value: string) => {
        const rating = value === '' ? null : parseFloat(value);
        const newFilters = { ...filters, minRating: rating };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleSortChange = (sortBy: 'popularity' | 'releaseDate' | 'name') => {
        const newSortOrder: 'asc' | 'desc' = filters.sortBy === sortBy && filters.sortOrder === 'desc' ? 'asc' : 'desc';
        const newFilters = { ...filters, sortBy, sortOrder: newSortOrder };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const resetFilters = () => {
        const initialFilters: FiltersState = {
            genres: [],
            dateFilter: {},
            minRating: null,
            sortBy: null,
            sortOrder: 'desc'
        };
        setFilters(initialFilters);
        onReset();
    };

    return (
        <div className="games-filters">
            <div className="filters-header">
                <h2 className="font-bold text-2xl">Game Filters</h2>
                <Button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`bg-gray-700 hover:bg-gray-800 text-white ${showFilters ? 'active' : ''}`}
                >
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
            </div>

            {showFilters && (
                <div className="filters-container">
                    {/* Genre Filter */}
                    <div className="filter-section">
                        <h3 className="font-semibold text-lg mb-2">Genres</h3>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="dropdown-button w-full">
                                    {filters.genres.length > 0
                                        ? `${filters.genres.length} selected`
                                        : 'Select Genres'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="max-h-80 overflow-y-auto">
                                {availableGenres.length > 0 ? (
                                    availableGenres.map(genre => (
                                        <DropdownMenuCheckboxItem
                                            key={genre}
                                            checked={filters.genres.includes(genre)}
                                            onCheckedChange={() => handleGenreChange(genre)}
                                        >
                                            {genre}
                                        </DropdownMenuCheckboxItem>
                                    ))
                                ) : (
                                    <div className="px-2 py-1 text-sm text-gray-500">
                                        No genres available
                                    </div>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {filters.genres.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {filters.genres.map(genre => (
                                    <span
                                        key={genre}
                                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                                    >
                                        {genre}
                                        <button
                                            onClick={() => handleGenreChange(genre)}
                                            className="ml-1 text-blue-600 hover:text-blue-800"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Release Date Filters */}
                    <div className="filter-section">
                        <h3 className="font-semibold text-lg mb-2">Release Date</h3>
                        <div className="date-filters">
                            <div className="date-filter">
                                <label className="text-sm font-medium">After</label>
                                <input
                                    type="date"
                                    value={filters.dateFilter.after || ''}
                                    onChange={(e) => handleDateChange('after', e.target.value)}
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div className="date-filter">
                                <label className="text-sm font-medium">Before</label>
                                <input
                                    type="date"
                                    value={filters.dateFilter.before || ''}
                                    onChange={(e) => handleDateChange('before', e.target.value)}
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Rating Filter */}
                    <div className="filter-section">
                        <h3 className="font-semibold text-lg mb-2">Minimum Rating</h3>
                        <select
                            value={filters.minRating === null ? '' : filters.minRating.toString()}
                            onChange={(e) => handleRatingChange(e.target.value)}
                            className="w-full px-3 py-2 border rounded bg-white"
                        >
                            <option value="">Any Rating</option>
                            <option value="1">1+ Stars (★)</option>
                            <option value="2">2+ Stars (★★)</option>
                            <option value="3">3+ Stars (★★★)</option>
                            <option value="4">4+ Stars (★★★★)</option>
                            <option value="4.5">4.5+ Stars (★★★★½)</option>
                        </select>
                    </div>

                    {/* Sort Options */}
                    <div className="filter-section">
                        <h3 className="font-semibold text-lg mb-2">Sort By</h3>
                        <div className="sort-buttons">
                            <Button
                                onClick={() => handleSortChange('popularity')}
                                className={`sort-button flex-1 ${filters.sortBy === 'popularity' ? 'active bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                            >
                                Popularity {filters.sortBy === 'popularity' && (filters.sortOrder === 'desc' ? '↓' : '↑')}
                            </Button>
                            <Button
                                onClick={() => handleSortChange('releaseDate')}
                                className={`sort-button flex-1 ${filters.sortBy === 'releaseDate' ? 'active bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                            >
                                Release Date {filters.sortBy === 'releaseDate' && (filters.sortOrder === 'desc' ? '↓' : '↑')}
                            </Button>
                            <Button
                                onClick={() => handleSortChange('name')}
                                className={`sort-button flex-1 ${filters.sortBy === 'name' ? 'active bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                            >
                                Name {filters.sortBy === 'name' && (filters.sortOrder === 'desc' ? '↓' : '↑')}
                            </Button>
                        </div>
                    </div>

                    <div className="filter-actions">
                        <Button onClick={resetFilters} className="reset-button bg-red-500 hover:bg-red-600 text-white">
                            Reset Filters
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameFilters;
