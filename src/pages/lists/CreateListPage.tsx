import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import gameService from '../../services/gameService.ts';
import { ListItemRequest } from "../../services/userListService.ts";
import {Game} from "../../interfaces/Game.ts";
import userListService from "../../services/userListService.ts";



const CreateListPage: React.FC = () => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

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
        <div className="max-w-xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Create New List</h1>

            <input
                type="text"
                placeholder="Título de la lista"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full border px-3 py-2 rounded"
            />

            <textarea
                placeholder="Descripción (opcional)"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full border px-3 py-2 rounded h-24"
            />

            {/* Autocomplete de juegos */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Añadir juego… empieza a escribir"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                />
                {suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border rounded mt-1 max-h-40 overflow-auto">
                        {suggestions.map(g => (
                            <li
                                key={g.id}
                                onClick={() => addGameToList(g)}
                                className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                            >
                                {g.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Ítems ya añadidos */}
            {items.length > 0 && (
                <ul className="space-y-1">
                    {items.map((it, idx) => (
                        <li key={idx} className="flex items-center justify-between border p-2 rounded">
                            <span>🎮 {suggestions.find(g=>g.id===it.referenceId)?.name || it.referenceId}</span>
                            {/* podrías añadir un “X” para quitar */}
                        </li>
                    ))}
                </ul>
            )}

            <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-4 py-2 rounded"
            >
                Create List +
            </button>
        </div>
    );
};

export default CreateListPage;
