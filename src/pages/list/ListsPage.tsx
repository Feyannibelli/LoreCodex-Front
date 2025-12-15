import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listService, UserListResponse } from '../../services/listService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import SearchBar from '../../components/ui/SearchBar';

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
            <div className="min-h-screen bg-background py-16">
                <div className="mx-auto flex max-w-6xl items-center justify-center px-4">
                    <div className="text-muted-foreground">Loading lists...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="mx-auto max-w-6xl px-4">
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="relative px-8 py-10">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                                    Community
                                </p>
                                <h1 className="text-4xl font-bold text-foreground mt-1">
                                    Community Lists
                                </h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Save and share your collections of games, guides and more.
                                </p>
                            </div>
                            {isAuthenticated && (
                                <div className="flex flex-wrap gap-3">
                                    <Link to="/my-lists">
                                        <Button variant="outline" type="button">
                                            My Lists
                                        </Button>
                                    </Link>
                                    <Link to="/lists/create">
                                        <Button variant="default" type="button">
                                            + Create List
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 rounded-xl border border-border bg-secondary/50 p-4 shadow-sm">
                            <SearchBar
                                placeholder="Search lists by title or description..."
                                value={searchTerm}
                                onChange={setSearchTerm}
                                className="w-full bg-background border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring"
                            />
                        </div>
                    </div>

                    <div className="px-8 py-10 bg-card border-t border-border space-y-8">
                        {filteredLists.length === 0 ? (
                            <div className="text-center py-12 rounded-xl border border-border bg-secondary/30">
                                <p className="text-lg font-semibold text-foreground">
                                    No lists found.
                                </p>
                                {isAuthenticated && (
                                    <Link to="/lists/create" className="inline-block mt-4">
                                        <Button variant="default" type="button">
                                            Create the first list!
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredLists.map((list) => (
                                    <div
                                        key={list.id}
                                        className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:bg-muted/50"
                                    >
                                        <div className="p-6 flex flex-col gap-4">
                                            <div>
                                                <h3 className="text-2xl font-semibold text-foreground mb-2">
                                                    <Link
                                                        to={`/lists/${list.id}`}
                                                        className="transition hover:text-primary"
                                                    >
                                                        {list.title}
                                                    </Link>
                                                </h3>
                                                <p className="text-base text-muted-foreground line-clamp-3">
                                                    {list.description}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                <span>By {list.username || 'Anonymous'}</span>
                                                <span>{list.items.length} items</span>
                                            </div>
                                            <Link
                                                to={`/lists/${list.id}`}
                                                className="text-primary hover:text-primary/90 font-medium transition-colors"
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
