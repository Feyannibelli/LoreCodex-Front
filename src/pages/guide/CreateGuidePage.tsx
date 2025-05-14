// src/pages/CreateGuidePage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RichTextEditor from '@/components/RichTextEditor.tsx';
import apiAuth from "@/services/apiAuth.ts";
import guideService from "@/services/guideService.ts";
import '@/css/Guide.css';

const CreateGuidePage = () => {
    const { id } = useParams<{ id: string }>();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [gameId, setGameId] = useState('');
    const [games, setGames] = useState<{ id: number; title: string }[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await apiAuth.get('/games');
                setGames(response.data);
            } catch {
                setGames([
                    { id: 1, title: 'Elden Ring' },
                    { id: 2, title: 'Zelda Breath of the Wild' },
                ]);
            }
        };
        fetchGames();
    }, []);

    const handleSubmit = async (isDraft: boolean) => {
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('isDraft', isDraft.toString());
            formData.append('isPublished', (!isDraft).toString());
            formData.append('gameId', gameId);
            if (coverImage) formData.append('coverImage', coverImage);

            await guideService.createGuide(formData);

            navigate(isDraft ? '/my-drafts' : `/guides/${id}`);
        } catch (error) {
            console.error('Error creating guide:', error);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-[#f47e00] mb-4">Create Guide</h1>

            <label className="block mb-2 font-semibold">Title *</label>
            <input
                type="text"
                className="w-full border border-gray-300 p-2 rounded mb-4"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <label className="block mb-2 font-semibold">Select Game *</label>
            <select
                className="w-full border border-gray-300 p-2 rounded mb-4"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
            >
                <option value="">-- Select a Game --</option>
                {games.map((game) => (
                    <option key={game.id} value={game.id}>
                        {game.title}
                    </option>
                ))}
            </select>

            <label className="block mb-2 font-semibold">Body</label>
            <RichTextEditor content={content} onChange={setContent} />

            <label className="block mt-4 mb-2 font-semibold">Upload Cover Image</label>
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    className="bg-[#f47e00] hover:bg-[#d56b00] text-white py-2 px-4 rounded"
                    onClick={() => document.getElementById('coverImageInput')?.click()}
                >
                    Select Cover Image
                </button>
                {coverImage && <span className="text-sm">{coverImage.name}</span>}
            </div>
            <input
                id="coverImageInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    if (e.target.files?.[0]) setCoverImage(e.target.files[0]);
                }}
            />

            <div className="flex gap-4 mt-6">
                <button
                    className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded"
                    onClick={() => handleSubmit(true)}
                >
                    Save Draft
                </button>
                <button
                    className="bg-[#f47e00] hover:bg-[#d56b00] text-white py-2 px-4 rounded"
                    onClick={() => handleSubmit(false)}
                >
                    Post
                </button>
            </div>
        </div>
    );
};

export default CreateGuidePage;
