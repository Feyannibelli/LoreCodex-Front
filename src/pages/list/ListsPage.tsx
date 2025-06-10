import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PopulatedUserList, ListCategory } from '../../interfaces/List';
import listService from '../../services/listService';
import Button from '../../components/Button';
import {
    Plus,
    Trophy,
    List as ListIcon,
    Calendar,
    ArrowRight,
    Star,
    Eye
} from 'lucide-react';

const ListsPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [topLists, setTopLists] = useState<PopulatedUserList[]>([]);
    const [recentLists, setRecentLists] = useState<PopulatedUserList[]>([]);
    const [myRecentLists, setMyRecentLists] = useState<PopulatedUserList[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadInitialData();
    }, [user]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            setError(null);

            if (user) {
                // Cargar mis listas recientes
                const rawMyLists = await listService.getMyLists();
                const populatedMyLists = await Promise.all(
                    rawMyLists.slice(0, 3).map(list => listService.populateList(list))
                );
                setMyRecentLists(populatedMyLists);

                // Simulamos listas públicas populares con las del usuario por ahora
                const topListsData = rawMyLists
                    .filter(list => list.category === ListCategory.TOP)
                    .slice(0, 6);
                const populatedTopLists = await Promise.all(
                    topListsData.map(list => listService.populateList(list))
                );
                setTopLists(populatedTopLists);

                // Listas recientes de la comunidad (simuladas)
                const recentListsData = rawMyLists.slice(0, 4);
                const populatedRecentLists = await Promise.all(
                    recentListsData.map(list => listService.populateList(list))
                );
                setRecentLists(populatedRecentLists);
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
            setError('Error al cargar las listas');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (category?: ListCategory) => {
        if (category === ListCategory.TOP) {
            return <Trophy className="w-5 h-5 text-yellow-500" />;
        }
        return <ListIcon className="w-5 h-5 text-blue-500" />;
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando listas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 mb-8 text-white">
                <div className="max-w-4xl">
                    <h1 className="text-4xl font-bold mb-4">
                        Descubre y Crea Listas Increíbles
                    </h1>
                    <p className="text-xl mb-6 opacity-90">
                        Organiza tus juegos, guías y desafíos favoritos. Comparte tus descubrimientos con la comunidad.
                    </p>
                    <div className="flex gap-4">
                        {user ? (
                            <>
                                <Button
                                    onClick={() => navigate('/lists/create')}
                                    className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-6 py-3"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Crear Lista
                                </Button>
                                <Button
                                    onClick={() => navigate('/lists/my-lists')}
                                    className="border border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3"
                                >
                                    Ver Mis Listas
                                </Button>
                            </>
                        ) : (
                            <Button
                                onClick={() => navigate('/login')}
                                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-6 py-3"
                            >
                                Iniciar Sesión para Crear Listas
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-yellow-500" />
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {topLists.length}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">Listas TOP</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center gap-3">
                        <ListIcon className="w-8 h-8 text-blue-500" />
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {recentLists.length}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">Listas Recientes</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mis Listas Recientes (solo si está autenticado) */}
            {user && myRecentLists.length > 0 && (
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Mis Listas Recientes
                        </h2>
                        <Link
                            to="/my-lists"
                            className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                        >
                            Ver todas
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {myRecentLists.map((list) => (
                            <Link
                                key={list.id}
                                to={`/lists/${list.id}`}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 block"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    {getCategoryIcon(list.category)}
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {list.category === ListCategory.TOP ? 'Lista TOP' : 'Lista Relacionada'}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {list.title}
                                </h3>

                                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                    {list.description}
                                </p>

                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span>{list.items.length} elementos</span>
                                    <span>{new Date(list.createdAt).toLocaleDateString()}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Listas TOP Populares */}
            <section className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-yellow-500" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Listas TOP Populares
                        </h2>
                    </div>
                    <Link
                        to="/lists/public?category=TOP"
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                    >
                        Ver todas
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {topLists.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                            No hay listas TOP disponibles aún
                        </p>
                        {user && (
                            <Button
                                onClick={() => navigate('/lists/create')}
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Crear la Primera Lista TOP
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {topLists.map((list) => (
                            <Link
                                key={list.id}
                                to={`/lists/${list.id}`}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden block"
                            >
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Trophy className="w-5 h-5 text-yellow-500" />
                                        <span className="text-sm font-medium text-yellow-600">
                                            Lista TOP
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {list.title}
                                    </h3>

                                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                        {list.description}
                                    </p>

                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span>{list.items.length} elementos</span>
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-4 h-4" />
                                                {Math.floor(Math.random() * 500) + 100}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Star className="w-4 h-4" />
                                                {(Math.random() * 2 + 3).toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Preview de elementos */}
                                {list.items.length > 0 && (
                                    <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                                        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                                            {list.items.slice(0, 5).map((item, index) => (
                                                <div key={item.id} className="flex-shrink-0 text-center">
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            className="w-12 h-12 object-cover rounded"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                                            <span className="text-xs font-bold">
                                                                #{index + 1}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Listas Recientes de la Comunidad */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-blue-500" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Listas Recientes de la Comunidad
                        </h2>
                    </div>
                    <Link
                        to="/lists/public"
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                    >
                        Ver todas
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {recentLists.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <ListIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                            No hay listas recientes disponibles
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {recentLists.map((list) => (
                            <Link
                                key={list.id}
                                to={`/lists/${list.id}`}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 block"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex items-center gap-2">
                                        {getCategoryIcon(list.category)}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                            {list.title}
                                        </h3>

                                        <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                            {list.description}
                                        </p>

                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <span>{list.items.length} elementos</span>
                                            <span>{new Date(list.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Mini preview */}
                                    {list.items.length > 0 && list.items[0].imageUrl && (
                                        <img
                                            src={list.items[0].imageUrl}
                                            alt="Preview"
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Call to Action */}
            {!user && (
                <div className="mt-12 text-center bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        ¿Listo para crear tu primera lista?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Únete a nuestra comunidad y comparte tus descubrimientos favoritos
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button
                            onClick={() => navigate('/register')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                        >
                            Crear Cuenta
                        </Button>
                        <Button
                            onClick={() => navigate('/login')}
                            className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3"
                        >
                            Iniciar Sesión
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListsPage;