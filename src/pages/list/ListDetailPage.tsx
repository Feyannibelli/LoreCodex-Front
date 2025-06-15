import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listService, UserListResponse, ListItemType } from '../../services/listService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';

const ListDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [list, setList] = useState<UserListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            fetchListDetail();
        }
    }, [id]);

    const fetchListDetail = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const listData = await listService.getListById(parseInt(id));
            setList(listData);
        } catch (error) {
            console.error('Error fetching list:', error);
            setError('Failed to load list');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteList = async () => {
        if (!list || !user || user.id !== list.userId) return;

        if (!window.confirm('Are you sure you want to delete this list?')) {
            return;
        }

        try {
            await listService.deleteList(list.id);
            navigate('/my-lists');
        } catch (error) {
            console.error('Error deleting list:', error);
            alert('Error deleting list. Please try again.');
        }
    };

    const getItemIcon = (type: ListItemType) => {
        switch (type) {
            case ListItemType.GAME:
                return '🎮';
            case ListItemType.GUIDE:
                return '📖';
            case ListItemType.CHALLENGE:
                return '🏆';
            default:
                return '📄';
        }
    };

    const getItemRoute = (item: any) => {
        switch (item.type) {
            case ListItemType.GAME:
                return `/games/${item.referenceId}`;
            case ListItemType.GUIDE:
                return `/guides/${item.referenceId}`;
            case ListItemType.CHALLENGE:
                return `/challenges/${item.referenceId}`;
            default:
                return '#';
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">Loading list...</div>
            </div>
        );
    }

    if (error || !list) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-600 mb-4">{error || 'List not found'}</p>
                    <Button onClick={() => navigate('/lists')} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                        Back to Lists
                    </Button>
                </div>
            </div>
        );
    }

    const isOwner = user && user.id === list.userId;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{list.title}</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                            <span>By {list.username || 'Anonymous'}</span>
                            <span>•</span>
                            <span>{list.items.length} items</span>
                            <span>•</span>
                            <span>Created {new Date(list.createdAt).toLocaleDateString()}</span>
                        </div>
                        {list.description && (
                            <p className="text-gray-700 leading-relaxed">{list.description}</p>
                        )}
                    </div>

                    {isOwner && (
                        <div className="flex gap-2 ml-4">
                            <Link to={`/lists/edit/${list.id}`}>
                                <Button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
                                    Edit
                                </Button>
                            </Link>
                            <Button
                                onClick={handleDeleteList}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                            >
                                Delete
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Items List */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Items</h2>

                {list.items.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">This list is empty.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {list.items
                            .sort((a, b) => a.position - b.position)
                            .map((item, index) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold text-sm">
                                        {index + 1}
                                    </div>

                                    <div className="flex items-center gap-3 flex-1">
                                        <span className="text-2xl">{getItemIcon(item.type)}</span>

                                        {item.thumbnailUrl && (
                                            <img
                                                src={item.thumbnailUrl}
                                                alt={item.title}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                        )}

                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800">{item.title}</h3>
                                            <p className="text-sm text-gray-500 capitalize">{item.type.toLowerCase()}</p>
                                        </div>
                                    </div>

                                    <Link
                                        to={getItemRoute(item)}
                                        className="text-blue-500 hover:text-blue-600 font-medium"
                                    >
                                        View →
                                    </Link>
                                </div>
                            ))}
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="mt-8 flex justify-between items-center">
                <Button
                    onClick={() => navigate('/lists')}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                    ← Back to Lists
                </Button>

                {isOwner && (
                    <Link
                        to="/my-lists"
                        className="text-blue-500 hover:text-blue-600 font-medium"
                    >
                        View My Lists →
                    </Link>
                )}
            </div>
        </div>
    );
};

export default ListDetailPage;