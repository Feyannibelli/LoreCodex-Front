import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listService, UserListResponse } from '../../services/listService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';

const ListsPage: React.FC = () => {
    const [lists, setLists] = useState<UserListResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();

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
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">Loading lists...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Community Lists</h1>
                {user && (
                    <div className="flex gap-2">
                        <Link to="/lists/create">
                            <Button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                                Create List
                            </Button>
                        </Link>
                        <Link to="/my-lists">
                            <Button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
                                My Lists
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search lists by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Lists Grid */}
            {filteredLists.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No lists found.</p>
                    {user && (
                        <Link to="/lists/create" className="inline-block mt-4">
                            <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded">
                                Create the first list!
                            </Button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLists.map((list) => (
                        <div key={list.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    <Link
                                        to={`/lists/${list.id}`}
                                        className="hover:text-blue-600 transition-colors"
                                    >
                                        {list.title}
                                    </Link>
                                </h3>
                                <p className="text-gray-600 mb-4 line-clamp-3">
                                    {list.description}
                                </p>
                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span>By {list.username || 'Anonymous'}</span>
                                    <span>{list.items.length} items</span>
                                </div>
                                <div className="mt-4">
                                    <Link
                                        to={`/lists/${list.id}`}
                                        className="text-blue-500 hover:text-blue-600 font-medium"
                                    >
                                        View List →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ListsPage;