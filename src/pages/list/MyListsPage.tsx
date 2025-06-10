import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PopulatedUserList } from '../../interfaces/List';
import listService from '../../services/listService';
import Button from '../../components/Button';
import { Plus, Edit, Trash2, List, Trophy, Calendar, Users } from 'lucide-react';

const MyListsPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [lists, setLists] = useState<PopulatedUserList[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadMyLists();
    }, []);

    const loadMyLists = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            const rawLists = await listService.getMyLists();

            // Poblar cada lista con información completa
            const populatedLists = await Promise.all(
                rawLists.map(list => listService.populateList(list))
            );

            setLists(populatedLists);
        } catch (error) {
            console.error('Error loading lists:', error);
            setError('Error al cargar las listas');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteList = async (listId: number) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta lista?')) {
            return;
        }

        try {
            await listService.deleteList(listId);
            setLists(lists.filter(list => list.id !== listId));
        } catch (error) {
            console.error('Error deleting list:', error);
            alert('Error al eliminar la lista');
        }
    };

    const getCategoryIcon = (category?: string) => {
        if (category === 'TOP') {
            return <Trophy className="w-5 h-5 text-yellow-500" />;
        }
        return <List className="w-5 h-5 text-blue-500" />;
    };

    const getCategoryLabel = (category?: string) => {
        if (category === 'TOP') {
            return 'Lista TOP';
        }
        return 'Lista Relacionada';
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando listas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="text-center py-12">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={loadMyLists}>Reintentar</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Mis Listas
                </h1>
                <Button
                    onClick={() => navigate('/lists/create')}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Crear Lista
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center gap-3">
                        <List className="w-8 h-8 text-blue-500" />
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {lists.length}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">Total de Listas</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-yellow-500" />
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {lists.filter(list => list.category === 'TOP').length}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">Listas TOP</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-green-500" />
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {lists.reduce((acc, list) => acc + list.items.length, 0)}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">Total Elementos</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lists Grid */}
            {lists.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <List className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No tienes listas creadas
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Crea tu primera lista para organizar tus juegos y guías favoritas
                    </p>
                    <Button
                        onClick={() => navigate('/lists/create')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Crear Mi Primera Lista
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lists.map((list) => (
                        <div
                            key={list.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
                        >
                            {/* Lista Header */}
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {getCategoryIcon(list.category)}
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {getCategoryLabel(list.category)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            onClick={() => navigate(`/lists/edit/${list.id}`)}
                                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            onClick={() => handleDeleteList(list.id)}
                                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <Link to={`/lists/${list.id}`}>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-blue-600 cursor-pointer">
                                        {list.title}
                                    </h3>
                                </Link>

                                {list.description && (
                                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                        {list.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(list.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {list.items.length} elementos
                                    </div>
                                </div>
                            </div>

                            {/* Preview de elementos */}
                            {list.items.length > 0 && (
                                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                                    <div className="grid grid-cols-3 gap-2">
                                        {list.items.slice(0, 3).map((item, index) => (
                                            <div key={item.id} className="text-center">
                                                {item.imageUrl ? (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        className="w-full h-16 object-cover rounded mb-1"
                                                    />
                                                ) : (
                                                    <div className="w-full h-16 bg-gray-200 dark:bg-gray-700 rounded mb-1 flex items-center justify-center">
                                                        <span className="text-xs text-gray-500">
                                                            {item.type}
                                                        </span>
                                                    </div>
                                                )}
                                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                    {list.category === 'TOP' ? `#${index + 1}` : ''}
                                                    {item.name}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    {list.items.length > 3 && (
                                        <p className="text-center text-sm text-gray-500 mt-2">
                                            +{list.items.length - 3} más
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Footer */}
                            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                                <Link
                                    to={`/lists/${list.id}`}
                                    className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                    Ver Lista Completa
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyListsPage;