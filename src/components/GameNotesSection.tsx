import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import gameNoteService, { GameNote } from "@/services/gameNoteService";

interface Props {
    gameId: number;
}

const GameNotesSection: React.FC<Props> = ({ gameId }) => {
    /* ---------- estado ---------- */
    const { isAuthenticated } = useAuth();

    const [notes, setNotes] = useState<GameNote[]>([]);
    const [newNote, setNewNote]   = useState("");

    const [editingId,   setEditingId]   = useState<number | null>(null);
    const [editingText, setEditingText] = useState("");

    /* ---------- helpers ---------- */
    const refresh = () =>
        gameNoteService.getNotes(gameId).then(res => setNotes(res.data));

    /* cargar al montar / cambiar gameId */
    useEffect(() => { refresh(); }, [gameId]);

    const addNote = () => {
        if (!newNote.trim()) return;
        gameNoteService.createNote(gameId, newNote)
            .then(refresh)
            .then(() => setNewNote(""));
    };

    const removeNote = (noteId: number) =>
        gameNoteService.deleteNote(gameId, noteId)
            .then(() => setNotes(prev => prev.filter(n => n.id !== noteId)));

    const saveEdit = (noteId: number) => {
        if (!editingText.trim()) return;
        gameNoteService.updateNote(gameId, noteId, editingText)
            .then(refresh)
            .then(() => {
                setEditingId(null);
                setEditingText("");
            });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingText("");
    };

    /* ---------- UI ---------- */
    return (
        <div className="mt-8 p-4 border rounded-lg">
            <h2 className="text-xl font-bold mb-4">Tus notas</h2>

            {isAuthenticated && (
                <>
          <textarea
              className="w-full border p-2 rounded"
              rows={3}
              value={newNote}
              placeholder="Escribí algo sobre tu sesión…"
              onChange={(e) => setNewNote(e.target.value)}
          />
                    <button
                        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        onClick={addNote}
                        disabled={!newNote.trim()}
                    >
                        Guardar nota
                    </button>
                </>
            )}

            <ul className="space-y-3 mt-6">
                {notes.map(note => (
                    <li key={note.id} className="relative bg-gray-100 p-3 rounded">
                        {/* fecha */}
                        <div className="text-xs text-gray-600 mb-1">
                            {new Date(note.createdAt).toLocaleString()}
                        </div>

                        {/* contenido o textarea dependiendo del modo edición */}
                        {editingId === note.id ? (
                            <>
                <textarea
                    className="w-full border p-2 rounded"
                    rows={3}
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                />
                                <div className="mt-2 space-x-2">
                                    <button
                                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                        onClick={() => saveEdit(note.id)}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                                        onClick={cancelEdit}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p>{note.content}</p>
                        )}

                        {/* iconos de acción */}
                        {isAuthenticated && editingId !== note.id && (
                            <>
                                {/* eliminar */}
                                <button
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                    onClick={() => removeNote(note.id)}
                                    title="Eliminar"
                                >
                                    ✕
                                </button>

                                {/* editar */}
                                <button
                                    className="absolute top-2 right-8 text-gray-500 hover:text-blue-600"
                                    onClick={() => {
                                        setEditingId(note.id);
                                        setEditingText(note.content);
                                    }}
                                    title="Editar"
                                >
                                    ✏️
                                </button>
                            </>
                        )}
                    </li>
                ))}

                {notes.length === 0 && (
                    <li className="text-gray-500 italic">Sin notas todavía.</li>
                )}
            </ul>
        </div>
    );
};

export default GameNotesSection;
