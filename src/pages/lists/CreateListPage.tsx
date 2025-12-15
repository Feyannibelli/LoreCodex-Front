// src/pages/lists/CreateListPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import gameService from '../../services/gameService.ts';
import { ListItemRequest } from "../../services/userListService.ts";
import { Game } from "../../interfaces/Game.ts";
import userListService from "../../services/userListService.ts";
import MarkdownEditor from '../../components/MarkdownEditor';
import Button from '../../components/Button';

const CreateListPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    // para el autocomplete
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Game[]>([]);

    // ítems seleccionados en la lista
    const [items, setItems] = useState<ListItemRequest[]>([]);

    // Busca juegos cada vez que el usuario escribe (debounce 300ms)
    useEffect(() => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }
        const handler = setTimeout(() => {
            gameService
                .searchGamesByName(query)
                .then(setSuggestions)
                .catch(console.error);
        }, 300);
        return () => clearTimeout(handler);
    }, [query]);

    const addGameToList = (game: Game) => {
        // evita duplicados
        if (items.some(i => i.referenceId === game.id)) return;
        setItems([
            ...items,
            {
                type: 'GAME',
                referenceId: game.id,
                position: items.length,
            }
        ]);
        setQuery('');
        setSuggestions([]);
    };

    const removeGameFromList = (gameId: number) => {
        setItems(items.filter(item => item.referenceId !== gameId));
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const newItems = [...items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < newItems.length) {
            [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
            // Actualizar posiciones
            newItems.forEach((item, idx) => {
                item.position = idx;
            });
            setItems(newItems);
        }
    };

    const handleSubmit = async () => {
        if (!user) {
            alert('Tienes que estar logueado');
            return;
        }

        if (!title.trim()) {
            alert('La lista necesita un título');
            return;
        }

        if (items.length === 0) {
            alert('Agrega al menos un juego a la lista');
            return;
        }

        setLoading(true);

        try {
            const body = { title: title.trim(), description: description.trim(), items };
            const nueva = await userListService.createList(user.id, body);

            // Redirigir a la lista creada
            navigate(`/lists/${nueva.id}`);
        } catch (err) {
            console.error(err);
            alert('Error al crear la lista. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="max-w-2xl mx-auto p-6 text-center">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-yellow-800 mb-2">
                        Inicia sesión requerida
                    </h2>
                    <p className="text-yellow-700">
                        Necesitas iniciar sesión para crear una lista.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Crear Nueva Lista
                </h1>
                <p className="text-gray-600">
                    Crea y comparte tu lista de juegos favoritos
                </p>
            </div>

            {/* Formulario */}
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                {/* Título */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Título de la lista *
                    </label>
                    <input
                        id="title"
                        type="text"
                        placeholder="Ej: Mis juegos favoritos de 2024"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        maxLength={100}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        {title.length}/100 caracteres
                    </p>
                </div>

                {/* Descripción con Markdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción
                    </label>
                    <p className="text-sm text-gray-500 mb-3">
                        Describe tu lista. Puedes usar Markdown para dar formato al texto.
                    </p>
                    <MarkdownEditor
                        value={description}
                        onChange={setDescription}
                        placeholder="Describe tu lista... Puedes usar **negrita**, *cursiva*, enlaces [texto](URL), etc."
                        rows={8}
                    />
                </div>

                {/* Agregar juegos */}
                <div>
                    <label htmlFor="game-search" className="block text-sm font-medium text-gray-700 mb-2">
                        Agregar juegos *
                    </label>
                    <div className="relative">
                        <input
                            id="game-search"
                            type="text"
                            placeholder="Buscar juegos para agregar..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        />
                        {suggestions.length > 0 && (
                            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-auto shadow-lg">
                                {suggestions.map((game) => (
                                    <button
                                        key={game.id}
                                        onClick={() => addGameToList(game)}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                                        disabled={items.some(i => i.referenceId === game.id)}
                                    >
                                        <div className="font-medium text-gray-900">{game.name}</div>
                                        {items.some(i => i.referenceId === game.id) && (
                                            <div className="text-sm text-green-600">✓ Ya agregado</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Lista de juegos agregados */}
                {items.length > 0 && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-4">
                            Juegos en la lista ({items.length})
                        </h3>
                        <div className="space-y-2">
                            {items.map((item, index) => {
                                const game = suggestions.find(g => g.id === item.referenceId);
                                return (
                                    <div
                                        key={`${item.referenceId}-${index}`}
                                        className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="text-sm font-medium text-gray-500 bg-white px-2 py-1 rounded">
                                                #{index + 1}
                                            </span>
                                            <div>
                                                <span className="font-medium text-gray-900">
                                                    🎮 {game?.name || `Juego ID: ${item.referenceId}`}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-1">
                                            {/* Botones de orden */}
                                            <button
                                                onClick={() => moveItem(index, 'up')}
                                                disabled={index === 0}
                                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Mover arriba"
                                            >
                                                ↑
                                            </button>
                                            <button
                                                onClick={() => moveItem(index, 'down')}
                                                disabled={index === items.length - 1}
                                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Mover abajo"
                                            >
                                                ↓
                                            </button>

                                            {/* Botón eliminar */}
                                            <button
                                                onClick={() => removeGameFromList(item.referenceId)}
                                                className="p-1 text-red-400 hover:text-red-600 ml-2"
                                                title="Eliminar de la lista"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Botones de acción */}
                <div className="flex justify-between items-center pt-6 border-t">
                    <Button
                        onClick={() => navigate('/lists')}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
                    >
                        Cancelar
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !title.trim() || items.length === 0}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-2 rounded-lg font-medium"
                    >
                        {loading ? 'Creando...' : 'Crear Lista'}
                    </Button>
                </div>
            </div>

            {/* Instrucciones */}
            <div className="bg-indigo-600/10 border border-indigo-600/20 rounded-lg p-4">
                <h3 className="font-medium text-indigo-700 dark:text-indigo-300 mb-2">💡 Consejos para crear una buena lista</h3>
                <ul className="text-sm text-indigo-700 dark:text-indigo-300 space-y-1">
                    <li>• Usa un título descriptivo que explique el tema de tu lista</li>
                    <li>• En la descripción, explica los criterios de selección o el contexto</li>
                    <li>• Puedes usar Markdown para formatear la descripción (negrita, cursiva, enlaces, etc.)</li>
                    <li>• Ordena los juegos de manera lógica (por preferencia, cronológicamente, etc.)</li>
                </ul>
            </div>
        </div>
    );
};

export default CreateListPage;
