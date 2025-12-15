import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listService, UserListResponse } from '../../services/listService';
import { useAuth } from '../../context/AuthContext';
import PrimaryButton from '../../components/ui/PrimaryButton';
import SearchInput from '../../components/ui/SearchInput';
import SecondaryButton from '../../components/ui/SecondaryButton';

const ListsPage: React.FC = () => {
    const [lists, setLists] = useState<UserListResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        fetchAllLists();
    }, []);

    const fetchAllLists = async () => {
        try {
            setLoading(true);
            const allLists = await listService.getAllLists();
            setLists(allLists);
        } catch (error) {
            console.error('Error fetching lists:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLists = lists.filter(list =>
        list.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        list.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 py-16 dark:bg-[#0B1020]">
                <div className="mx-auto flex max-w-6xl items-center justify-center px-4">
                    <div className="text-slate-500 dark:text-slate-400">Loading lists...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B1020] dark:text-slate-100 py-12">
            <div className="mx-auto max-w-6xl px-4">
                <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#EEF2FF_0%,#F8FAFC_55%)] shadow-sm dark:border-white/10 dark:bg-[#0F172A]">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_circle_at_20%_0%,rgba(79,70,229,0.18),transparent_60%)] opacity-0 dark:opacity-100" />
                    <div className="relative px-8 py-10">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                                    Community
                                </p>
                                <h1 className="text-4xl font-bold text-slate-900">
                                    Community Lists
                                </h1>
                                <p className="text-sm text-slate-600 mt-1">
                                    Guarda y comparte tus colecciones de juegos, guías y más.
                                </p>
                            </div>
                            {isAuthenticated && (
                                <div className="flex flex-wrap gap-3">
                                    <Link to="/my-lists">
                                        <SecondaryButton type="button">
                                            📚 My Lists
                                        </SecondaryButton>
                                    </Link>
                                    <Link to="/lists/create">
                                        <PrimaryButton type="button">
                                            + Create List
                                        </PrimaryButton>
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#111C33]">
                            <SearchInput
                                placeholder="Search lists by title or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="px-8 py-10 bg-white border-t border-slate-200 space-y-8 dark:bg-[#0F172A] dark:border-white/10">
                        {filteredLists.length === 0 ? (
                            <div className="text-center py-12 rounded-2xl border border-slate-200 bg-slate-50 shadow-inner dark:border-white/10 dark:bg-[#111C33]">
                                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    No lists found.
                                </p>
                                {isAuthenticated && (
                                    <Link to="/lists/create" className="inline-block mt-4">
                                        <PrimaryButton type="button">
                                            Create the first list!
                                        </PrimaryButton>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredLists.map((list) => (
                                    <div
                                        key={list.id}
                                        className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:border-indigo-200 dark:border-white/10 dark:bg-[#111C33]"
                                    >
                                        <div className="p-6 flex flex-col gap-4">
                                            <div>
                                                <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                                                    <Link
                                                        to={`/lists/${list.id}`}
                                                        className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
                                                    >
                                                        {list.title}
                                                    </Link>
                                                </h3>
                                                <p className="text-base text-slate-600 dark:text-slate-300 line-clamp-3">
                                                    {list.description}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                                                <span>By {list.username || 'Anonymous'}</span>
                                                <span>{list.items.length} items</span>
                                            </div>
                                            <Link
                                                to={`/lists/${list.id}`}
                                                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                                            >
                                                View List →
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListsPage;
