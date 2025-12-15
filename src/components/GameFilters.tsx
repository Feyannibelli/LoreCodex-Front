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
    hasAwards: boolean;
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
        hasAwards: false,
        minRating: null,
        sortBy: null,
        sortOrder: 'desc'
    });

    const [showFilters, setShowFilters] = useState(false);

    const handleGenreChange = (genre: string) => {
        const newGenres = filters.genres.includes(genre)
            ? filters.genres.filter(g => g !== genre)
            : [...filters.genres, genre];

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
        const rating = value === '' ? null : parseInt(value, 10);
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
            hasAwards: false,
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
                <h2>Game Filters</h2>
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
                        <h3>Genres</h3>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="dropdown-button">
                                    {filters.genres.length > 0
                                        ? `${filters.genres.length} selected`
                                        : 'Select Genres'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {availableGenres.map(genre => (
                                    <DropdownMenuCheckboxItem
                                        key={genre}
                                        checked={filters.genres.includes(genre)}
                                        onCheckedChange={() => handleGenreChange(genre)}
                                    >
                                        {genre}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Release Date Filters */}
                    <div className="filter-section">
                        <h3>Release Date</h3>
                        <div className="date-filters">
                            <div className="date-filter">
                                <label>After</label>
                                <input
                                    type="date"
                                    value={filters.dateFilter.after || ''}
                                    onChange={(e) => handleDateChange('after', e.target.value)}
                                />
                            </div>
                            <div className="date-filter">
                                <label>Before</label>
                                <input
                                    type="date"
                                    value={filters.dateFilter.before || ''}
                                    onChange={(e) => handleDateChange('before', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Rating Filter */}
                    <div className="filter-section">
                        <h3>Minimum Rating</h3>
                        <select
                            value={filters.minRating === null ? '' : filters.minRating.toString()}
                            onChange={(e) => handleRatingChange(e.target.value)}
                        >
                            <option value="">Any Rating</option>
                            <option value="1">1+ Stars</option>
                            <option value="2">2+ Stars</option>
                            <option value="3">3+ Stars</option>
                            <option value="4">4+ Stars</option>
                            <option value="5">5 Stars</option>
                        </select>
                    </div>

                    {/* Sort Options */}
                    <div className="filter-section">
                        <h3>Sort By</h3>
                        <div className="sort-buttons">
                            <Button
                                onClick={() => handleSortChange('popularity')}
                                className={`sort-button ${filters.sortBy === 'popularity' ? 'active' : ''}`}
                            >
                                Popularity {filters.sortBy === 'popularity' && (filters.sortOrder === 'desc' ? '↓' : '↑')}
                            </Button>
                            <Button
                                onClick={() => handleSortChange('releaseDate')}
                                className={`sort-button ${filters.sortBy === 'releaseDate' ? 'active' : ''}`}
                            >
                                Release Date {filters.sortBy === 'releaseDate' && (filters.sortOrder === 'desc' ? '↓' : '↑')}
                            </Button>
                            <Button
                                onClick={() => handleSortChange('name')}
                                className={`sort-button ${filters.sortBy === 'name' ? 'active' : ''}`}
                            >
                                Name {filters.sortBy === 'name' && (filters.sortOrder === 'desc' ? '↓' : '↑')}
                            </Button>
                        </div>
                    </div>

                    <div className="filter-actions">
                        <Button onClick={resetFilters} className="reset-button">
                            Reset Filters
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameFilters;
