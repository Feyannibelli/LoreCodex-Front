import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PopulatedUserList, ListCategory } from '../../interfaces/List';
import listService from '../../services/listService';
import Button from '../../components/Button';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Trophy,
    List as ListIcon,
    Calendar,
    Users,
    Share2,
    ExternalLink
} from 'lucide-react';

const ListDetailPage: React.FC = () => {
    const { listId } = useParams<{ listId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [list, setList] = useState<PopulatedUserList | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        if (listId) {
            loadList();
        }
    }, [listId, user]);

    const loadList = async () => {
        if (!listId) return;

        try {
            setLoading(true);
            setError(null);

            // Intentar obtener la lista como usuario autenticado primero
            let targetList: PopulatedUserList | null = null;

            if (user) {
                try {
                    const myLists = await listService.getMyLists();
                    const myList = myLists.find(l => l.id === parseInt(listId));

                    if (myList) {
                        targetList = await listService.populateList(myList);
                        setIsOwner(true);
                    }
                } catch (error) {
                    console.log('Not owner or error fetching own lists');
                }
            }

            // Si no es del usuario, intentar obtenerla como lista pública
            if (!targetList) {
                try {
                    // Aquí asumiré que tienes un endpoint para obtener listas públicas
                    // const publicList = await listService.getPublicList(parseInt(listId));
                    // targetList = await listService.populateList(publicList);

                    // Por ahora, mostrar error si no es del usuario
                    throw new Error('Lista no encontrada o no tienes permisos para verla');
                } catch (error) {
                    throw error;
                }
            }

            setList(targetList);
        } catch (error) {
            console.error('Error loading list:', error);
            setError('Lista no encontrada');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteList = async () => {
        if (!list || !isOwner) return;

        if (!window.confirm('¿Estás seguro de que quieres eliminar esta lista?')) {
            return;
        }

        try {
            await listService.deleteList(list.id);
            navigate('/my-lists');
        } catch (error) {
            console.error('Error deleting list:', error);
            alert('Error al eliminar la lista');
        }
    };

    const handleShare = async () => {
        if (!list) return;

        try {
            const url = window.location.href;
            await navigator.clipboard.writeText(url);
            alert('Enlace copiado al portapapeles');
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            alert('No se pudo copiar el enlace');
        }
    };

    const getCategoryInfo = (category?: ListCategory) => {
        if (category === ListCategory.TOP) {
            return {
                icon: <Trophy className="w-6 h-6 text-yellow-500" />,
                label: 'Lista TOP',
                description: 'Ranking ordenado de mejores elementos'
            };
        }
        return {
            icon: <ListIcon className="w-6 h-6 text-blue-500" />,
            label: 'Lista Relacionada',
            description: 'Elementos relacionados por tema o categoría'
        };
    };

    const getItemLink = (item: any) => {
        switch (item.type) {
            case 'GAME':
                return `/games/${item.referenceId}`;
            case 'GUIDE':
                return `/guides/${item.referenceId}`;
            case 'CHALLENGE':
                return `/challenges/${item.referenceId}`;
            default:
                return '#';
        }
    };

    const getItemTypeLabel = (type: string) => {
        switch (type) {
            case 'GAME':
                return 'Juego';
            case 'GUIDE':
                return 'Guía';
            case 'CHALLENGE':
                return 'Desafío';
            default:
                return type;
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando lista...</p>
                </div>
            </div>
        );
    }

    if (error || !list) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center py-12">
                    <p className="text-red-600 mb-4">{error || 'Lista no encontrada'}</p>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={() => navigate(-1)}>
                            Volver
                        </Button>
                        {user && (
                            <Button onClick={() => navigate('/my-lists')}>
                                Mis Listas
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const categoryInfo = getCategoryInfo(list.category);

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Navigation */}
            <div className="flex items-center gap-4 mb-6">
                <Button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver
                </Button>
            </div>

            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            {categoryInfo.icon}
                            <div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {categoryInfo.label}
                                </span>
                                <p className="text-xs text-gray-500">
                                    {categoryInfo.description}
                                </p>
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            {list.title}
                        </h1>

                        {list.description && (
                            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                                {list.description}
                            </p>
                        )}

                        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Creada el {new Date(list.createdAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                {list.items.length} elementos
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                        <Button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        >
                            <Share2 className="w-4 h-4" />
                            Compartir
                        </Button>

                        {isOwner && (
                            <>
                                <Button
                                    onClick={() => navigate(`/lists/edit/${list.id}`)}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                                >
                                    <Edit className="w-4 h-4" />
                                    Editar
                                </Button>
                                <Button
                                    onClick={handleDeleteList}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Eliminar
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Items */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Elementos de la Lista
                </h2>

                {list.items.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <ListIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                            Esta lista no tiene elementos
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {list.items.map((item, index) => (
                            <div
                                key={item.id}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                            >
                                <div className="flex items-center gap-6">
                                    {/* Position/Ranking */}
                                    {list.category === ListCategory.TOP && (
                                        <div className="flex-shrink-0">
                                            <div className={`
                                                flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg
                                                ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                index === 1 ? 'bg-gray-100 text-gray-800' :
                                                    index === 2 ? 'bg-orange-100 text-orange-800' :
                                                        'bg-blue-100 text-blue-800'}
                                            `}>
                                                #{index + 1}
                                            </div>
                                        </div>
                                    )}

                                    {/* Image */}
                                    <div className="flex-shrink-0">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="w-20 h-20 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                <span className="text-xs text-gray-500">
                                                    {getItemTypeLabel(item.type)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`
                                                        px-2 py-1 rounded text-xs font-medium
                                                        ${item.type === 'GAME' ? 'bg-green-100 text-green-800' :
                                                        item.type === 'GUIDE' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-purple-100 text-purple-800'}
                                                    `}>
                                                        {getItemTypeLabel(item.type)}
                                                    </span>
                                                </div>

                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                                    {item.name}
                                                </h3>

                                                {item.gameTitle && (
                                                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                                                        Para: {item.gameTitle}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Action Button */}
                                            <Link
                                                to={getItemLink(item)}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Ver Detalle
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            {isOwner && (
                <div className="mt-8 flex justify-center gap-4">
                    <Button
                        onClick={() => navigate(`/lists/edit/${list.id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                    >
                        Editar Lista
                    </Button>
                    <Button
                        onClick={() => navigate('/lists/create')}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
                    >
                        Crear Nueva Lista
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ListDetailPage;