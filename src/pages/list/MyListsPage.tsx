// src/pages/list/MyListsPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listService, UserListResponse } from '../../services/listService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';

const MyListsPage: React.FC = () => {
    const [lists, setLists] = useState<UserListResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchUserLists();
        }
    }, [user]);

    const fetchUserLists = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const userLists = await listService.getUserLists(user.id);
            setLists(userLists);
        } catch (error) {
            console.error('Error fetching user lists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteList = async (listId: number) => {
        if (!window.confirm('Are you sure you want to delete this list?')) {
            return;
        }

        try {
            await listService.deleteList(listId);
            setLists(lists.filter(list => list.id !== listId));
        } catch (error) {
            console.error('Error deleting list:', error);
            alert('Error deleting list. Please try again.');
        }
    };

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <p className="text-gray-500">Please log in to view your lists.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">Loading your lists...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">My Lists</h1>
                <Link to="/lists/create">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                        Create New List
                    </Button>
                </Link>
            </div>

            {lists.length === 0 ? (
                <div className="text-center py-12">
                    <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">No Lists Yet</h3>
                        <p className="text-gray-500 mb-6">
                            You haven't created any lists yet. Start by creating your first list!
                        </p>
                        <Link to="/lists/create">
                            <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded">
                                Create Your First List
                            </Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lists.map((list) => (
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
                                    {list.description || 'No description provided.'}
                                </p>

                                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                                    <span>{list.items.length} items</span>
                                    <span>{new Date(list.createdAt).toLocaleDateString()}</span>
                                </div>

                                {/* Item Preview */}
                                {list.items.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>
                                        <div className="space-y-1">
                                            {list.items.slice(0, 3).map((item, index) => (
                                                <div key={item.id} className="text-sm text-gray-600 flex items-center">
                                                    <span className="text-xs text-gray-400 mr-2">{index + 1}.</span>
                                                    <span className="truncate">{item.title}</span>
                                                    <span className="text-xs text-gray-400 ml-2">({item.type})</span>
                                                </div>
                                            ))}
                                            {list.items.length > 3 && (
                                                <div className="text-xs text-gray-400">
                                                    +{list.items.length - 3} more items
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Link
                                        to={`/lists/${list.id}`}
                                        className="flex-1 text-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm transition-colors"
                                    >
                                        View
                                    </Link>
                                    <Link
                                        to={`/lists/edit/${list.id}`}
                                        className="flex-1 text-center bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-sm transition-colors"
                                    >
                                        Edit
                                    </Link>
                                    <Button
                                        onClick={() => handleDeleteList(list.id)}
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Back to all lists */}
            <div className="mt-8 text-center">
                <Link
                    to="/lists"
                    className="text-blue-500 hover:text-blue-600 font-medium"
                >
                    ← Browse All Community Lists
                </Link>
            </div>
        </div>
    );
};

export default MyListsPage;