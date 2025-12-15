// src/pages/lists/ListDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import userListService, { UserListResponse } from '../../services/userListService';
import MarkdownRenderer from '../../components/MarkdownRenderer';

const ListDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const listId = Number(id);
    const [list, setList] = useState<UserListResponse | null>(null);
    const [author, setAuthor] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!listId || isNaN(listId)) {
            setError('ID de lista inválido');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        userListService.getListById(listId)
            .then(l => {
                console.log('Lista cargada:', l);
                setList(l);
            })
            .catch(err => {
                console.error('Error cargando lista:', err);
                setError('Error al cargar la lista');
            })
            .finally(() => setLoading(false));
    }, [listId]);

    useEffect(() => {
        if (!listId || isNaN(listId)) return;

        // Cargar el nombre del autor
        userListService.getListAuthor(listId)
            .then(setAuthor)
            .catch(console.error);
    }, [listId]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-8">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading list...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-8">
                <div className="text-center py-12">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                        <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
                        <p className="text-red-600 mb-4">{error}</p>
                        <Link
                            to="/lists"
                            className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                        >
                            Volver a las listas
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!list) {
        return (
            <div className="max-w-4xl mx-auto p-8">
                <div className="text-center py-12">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Lista no encontrada</h2>
                        <p className="text-gray-600 mb-4">
                            La lista que buscas no existe o ha sido eliminada.
                        </p>
                        <Link
                            to="/lists"
                            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
                        >
                            Explorar otras listas
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{list.title}</h1>

                    {/* Metadatos */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                            <span>👤</span>
                            <span>Por</span>
                            <Link
                                to={`/profile/${list.userId}`}
                                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                            >
                                {author || `Usuario ${list.userId}`}
                            </Link>
                        </div>

                        <div className="flex items-center space-x-1">
                            <span>📅</span>
                            <span>{new Date(list.createdAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                            <span>🎮</span>
                            <span>{list.items.length} juego{list.items.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                </div>

                {/* Descripción con Markdown */}
                {list.description && (
                    <div className="border-t pt-4">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">Descripción</h2>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <MarkdownRenderer
                                content={list.description}
                                className="prose prose-slate dark:prose-invert max-w-none prose-sm"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Lista de juegos */}
            {list.items.length > 0 ? (
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Juegos en la lista
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {list.items
                            .sort((a, b) => (a.position || 0) - (b.position || 0))
                            .map((item, index) => (
                                <div
                                    key={item.id}
                                    className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                                >
                                    <Link to={`/${item.type.toLowerCase()}/${item.referenceId}`}>
                                        {/* Imagen */}
                                        <div className="relative">
                                            <img
                                                src={item.thumbnailUrl || '/placeholder-game.jpg'}
                                                alt={item.title}
                                                className="w-full h-48 object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/placeholder-game.jpg';
                                                }}
                                            />

                                            {/* Número de posición */}
                                            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-sm font-bold px-2 py-1 rounded">
                                                #{index + 1}
                                            </div>

                                            {/* Tipo de contenido */}
                                            <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                                                {item.type}
                                            </div>
                                        </div>

                                        {/* Información */}
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                                                {item.title}
                                            </h3>

                                            {/* `description` no viene en este DTO */}
                                        </div>
                                    </Link>
                                </div>
                            ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Lista vacía</h3>
                        <p className="text-gray-500">
                            Esta lista no tiene juegos agregados aún.
                        </p>
                    </div>
                </div>
            )}

            {/* Navegación */}
            <div className="flex justify-between items-center pt-8 border-t">
                <Link
                    to="/lists"
                    className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                    <span>←</span>
                    <span>Volver a todas las listas</span>
                </Link>

                {/* Acciones adicionales si es el dueño de la lista */}
                {/* Aquí podrías añadir botones de editar/eliminar si el usuario actual es el dueño */}
            </div>
        </div>
    );
};

export default ListDetailPage;
