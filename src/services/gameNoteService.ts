import apiAuth from "./apiAuth";

export interface GameNote {
    id: number;
    content: string;
    createdAt: string; // ISO
}

/* Endpoints q tenemos hasta ahora del abm:
   GET    /notes/{gameId}
   POST   /notes/{gameId}
   PUT    /notes/{gameId}/{noteId}
   DELETE /notes/{gameId}/{noteId}
*/
const gameNoteService = {
    getNotes: (gameId: number) =>
        apiAuth.get<GameNote[]>(`/notes/${gameId}`),

    createNote: (gameId: number, content: string) =>
        apiAuth.post(`/notes/${gameId}`, { content }),

    updateNote: (gameId: number, noteId: number, content: string) =>
        apiAuth.put(`/notes/${gameId}/${noteId}`, { content }),

    deleteNote: (gameId: number, noteId: number) =>
        apiAuth.delete(`/notes/${gameId}/${noteId}`),
};

export default gameNoteService;
