import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import gameNoteService, { GameNote } from "@/services/gameNoteService";
import { Edit2, Trash2, Save, X } from "lucide-react";

interface Props {
    gameId: number;
}

const GameNotesSection: React.FC<Props> = ({ gameId }) => {
    /* ---------- state ---------- */
    const { isAuthenticated } = useAuth();

    const [notes, setNotes] = useState<GameNote[]>([]);
    const [newNote, setNewNote] = useState("");

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingText, setEditingText] = useState("");

    /* ---------- helpers ---------- */
    const refresh = () =>
        gameNoteService.getNotes(gameId).then(res => setNotes(res.data));

    /* load on mount / gameId change */
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
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Your Notes</h2>

            {isAuthenticated && (
                <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                    <textarea
                        className="w-full bg-background/50 border border-white/10 rounded-lg p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none"
                        rows={4}
                        value={newNote}
                        placeholder="Write something about your session..."
                        onChange={(e) => setNewNote(e.target.value)}
                    />
                    <button
                        className="mt-4 bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={addNote}
                        disabled={!newNote.trim()}
                    >
                        Save Note
                    </button>
                </div>
            )}

            <div className="space-y-4">
                {notes.map(note => (
                    <div
                        key={note.id}
                        className="relative bg-card/40 backdrop-blur-xl border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all"
                    >
                        {/* Date */}
                        <div className="text-xs text-muted-foreground mb-3">
                            {new Date(note.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>

                        {/* Content or textarea depending on edit mode */}
                        {editingId === note.id ? (
                            <>
                                <textarea
                                    className="w-full bg-background/50 border border-white/10 rounded-lg p-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none"
                                    rows={4}
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                />
                                <div className="mt-3 flex gap-2">
                                    <button
                                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-all"
                                        onClick={() => saveEdit(note.id)}
                                    >
                                        <Save className="h-4 w-4" />
                                        Save
                                    </button>
                                    <button
                                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-foreground px-4 py-2 rounded-lg font-medium transition-all"
                                        onClick={cancelEdit}
                                    >
                                        <X className="h-4 w-4" />
                                        Cancel
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className="text-foreground whitespace-pre-wrap">{note.content}</p>
                        )}

                        {/* Action icons */}
                        {isAuthenticated && editingId !== note.id && (
                            <div className="absolute top-4 right-4 flex gap-2">
                                {/* Edit */}
                                <button
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-primary transition-all"
                                    onClick={() => {
                                        setEditingId(note.id);
                                        setEditingText(note.content);
                                    }}
                                    title="Edit"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>

                                {/* Delete */}
                                <button
                                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
                                    onClick={() => removeNote(note.id)}
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {notes.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p className="text-sm">No notes yet. Start writing your thoughts about this game!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameNotesSection;
