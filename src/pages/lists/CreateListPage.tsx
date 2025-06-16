import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import gameService from '../../services/gameService.ts';
import { ListItemRequest } from "../../services/userListService.ts";
import {Game} from "../../interfaces/Game.ts";
import userListService from "../../services/userListService.ts";
import MarkdownViewer from "../../components/MarkdownViewer.tsx";

const CreateListPage: React.FC = () => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPreviewMode, setIsPreviewMode] = useState(false);

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

    const removeGameFromList = (referenceId: number) => {
        setItems(items.filter(item => item.referenceId !== referenceId));
    };

    const handleSubmit = async () => {
        if (!user) return alert('Tienes que estar logueado');
        if (!title.trim()) return alert('La lista necesita un título');
        const body = { title, description, items };
        try {
            const nueva = await userListService.createList(user.id, body);
            // Vuelve a pedir la lista completa por ID
            const listaCompleta = await userListService.getListById(nueva.id);
            alert(`Lista creada: ${listaCompleta.title}`);
            // Aquí podrías redirigir o mostrar los items de listaCompleta
            setTitle('');
            setDescription('');
            setItems([]);
        } catch (err) {
            console.error(err);
            alert('Error al crear la lista');
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Create New List</h1>

            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                </label>
                <input
                    type="text"
                    placeholder="Enter list title..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                />
            </div>

            {/* Description with Markdown */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Description (optional)
                    </label>
                    <button
                        type="button"
                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                        className="text-sm text-gray-600 hover:text-gray-800 underline flex items-center space-x-1"
                    >
                        <span>{isPreviewMode ? '✏️ Edit' : '👁️ Preview'}</span>
                    </button>
                </div>

                {!isPreviewMode ? (
                    <textarea
                        placeholder="Describe your list using Markdown...

# Heading
## Subheading

**Bold text** and *italic text*
`Inline code`

```
Code block
```

- List item 1
- List item 2

1. Numbered item 1
2. Numbered item 2

[Link text](https://example.com)
![Image alt](https://example.com/image.jpg)

> Blockquote text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 font-mono text-sm"
                    />
                ) : (
                    <div className="border border-gray-300 rounded-lg p-4 min-h-[128px] bg-gray-50">
                        {description.trim() ? (
                            <MarkdownViewer content={description} />
                        ) : (
                            <p className="text-gray-400 italic">No description provided</p>
                        )}
                    </div>
                )}

                {/* Markdown Help */}
                <div className="mt-2 text-xs text-gray-500">
                    <details>
                        <summary className="cursor-pointer hover:text-gray-700">
                            Markdown formatting help
                        </summary>
                        <div className="mt-2 ml-2 space-y-1">
                            <p>• <code># ## ###</code> for headings</p>
                            <p>• <code>**bold**</code> and <code>*italic*</code> text</p>
                            <p>• <code>`inline code`</code> and <code>```code blocks```</code></p>
                            <p>• <code>- item</code> for lists and <code>1. item</code> for numbered lists</p>
                            <p>• <code>[text](url)</code> for links</p>
                            <p>• <code>![alt](url)</code> for images</p>
                            <p>• <code>&gt; text</code> for blockquotes</p>
                        </div>
                    </details>
                </div>
            </div>

            {/* Autocomplete de juegos */}
            <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Games
                </label>
                <input
                    type="text"
                    placeholder="Start typing to search for games..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-auto shadow-lg">
                        {suggestions.map(g => (
                            <li
                                key={g.id}
                                onClick={() => addGameToList(g)}
                                className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="text-lg">🎮</span>
                                    <span className="font-medium">{g.name}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Ítems ya añadidos */}
            {items.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selected Games ({items.length})
                    </label>
                    <ul className="space-y-2">
                        {items.map((it, idx) => (
                            <li key={idx} className="flex items-center justify-between border border-gray-200 p-3 rounded-lg bg-gray-50">
                                <div className="flex items-center space-x-3">
                                    <span className="text-lg">🎮</span>
                                    <span className="font-medium">
                                        {suggestions.find(g => g.id === it.referenceId)?.name || `Game ID: ${it.referenceId}`}
                                    </span>
                                    <span className="text-xs text-gray-500">#{idx + 1}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeGameFromList(it.referenceId)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                    title="Remove from list"
                                >
                                    ✕
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                <button
                    onClick={handleSubmit}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                    Create List
                </button>

                {/* Preview Toggle for Mobile */}
                <button
                    type="button"
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className="sm:hidden bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    {isPreviewMode ? '✏️ Edit Description' : '👁️ Preview Description'}
                </button>
            </div>
        </div>
    );
};

export default CreateListPage;