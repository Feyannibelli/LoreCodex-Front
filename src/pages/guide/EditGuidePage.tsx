import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import guideService from '../../services/guideService.ts';
import gameService from '../../services/gameService.ts';
import { Game } from '../../interfaces/Game.ts';
import '@/css/Guide.css';

const EditGuidePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [gameId, setGameId] = useState('');
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [gamesLoading, setGamesLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;

            try {
                setLoading(true);

                // Load games
                setGamesLoading(true);
                const gamesData = await gameService.getAllGames();
                setGames(gamesData);
                setGamesLoading(false);

                // Load guide data
                const guide = await guideService.getGuideById(id);
                setTitle(guide.title || '');
                setContent(guide.content || '');
                setCoverImageUrl(guide.coverImageUrl || '');
                setGameId(guide.gameId?.toString() || '');
            } catch (err) {
                console.error('Error fetching data:', err);
                alert('Error loading guide data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    const handleSubmit = async (publish: boolean) => {
        if (!title.trim()) {
            alert('Title is required');
            return;
        }

        if (!content.trim()) {
            alert('Content is required');
            return;
        }

        if (!gameId) {
            alert('Please select a game');
            return;
        }

        try {
            const guideData = {
                title: title.trim(),
                content: content.trim(),
                coverImageUrl: coverImageUrl.trim() || null,
                gameId: parseInt(gameId),
                isDraft: !publish,
                isPublished: publish
            };

            await guideService.updateGuide(id!, guideData);

            if (publish) {
                navigate(`/guides/${id}`);
            } else {
                alert('Draft saved successfully!');
                navigate('/my-drafts');
            }
        } catch (error) {
            console.error('Error updating guide:', error);
            alert('Failed to update guide. Please try again.');
        }
    };

    if (loading) return (
        <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#f47e00]"></div>
            <div className="mt-2 text-gray-600">Loading guide...</div>
        </div>
    );

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <button
                className="mb-6 text-sm text-[#f47e00] hover:underline flex items-center gap-2 transition-colors"
                onClick={() => navigate('/my-drafts')}
            >
                <span className="text-lg">←</span> Back to My Drafts
            </button>

            <h1 className="text-3xl font-bold text-[#f47e00] mb-6">Edit Guide</h1>

            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                <div>
                    <label className="block mb-2 font-semibold text-gray-700">Title *</label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f47e00] focus:border-transparent"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter your guide title..."
                        maxLength={200}
                    />
                    <div className="text-sm text-gray-500 mt-1">{title.length}/200 characters</div>
                </div>

                <div>
                    <label className="block mb-2 font-semibold text-gray-700">Select Game *</label>
                    {gamesLoading ? (
                        <div className="text-gray-500">Loading games...</div>
                    ) : (
                        <select
                            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f47e00] focus:border-transparent"
                            value={gameId}
                            onChange={(e) => setGameId(e.target.value)}
                        >
                            <option value="">-- Select a Game --</option>
                            {games.map((game) => (
                                <option key={game.id} value={game.id}>
                                    {game.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div>
                    <label className="block mb-2 font-semibold text-gray-700">Cover Image URL (Optional)</label>
                    <input
                        type="url"
                        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f47e00] focus:border-transparent"
                        value={coverImageUrl}
                        onChange={(e) => setCoverImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                    />
                    <div className="text-sm text-gray-500 mt-1">Provide a URL to an image for your guide cover</div>
                    {coverImageUrl && (
                        <div className="mt-2">
                            <img
                                src={coverImageUrl}
                                alt="Cover preview"
                                className="h-32 w-48 object-cover rounded-lg shadow-sm"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                    )}
                </div>

                <div>
                    <label className="block mb-2 font-semibold text-gray-700">Content *</label>
                    <div className="mb-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <strong>Markdown Support:</strong> You can use markdown formatting:
                        <br />• <code># Heading 1</code>, <code>## Heading 2</code>, <code>### Heading 3</code>
                        <br />• <code>**bold text**</code>, <code>*italic text*</code>
                        <br />• <code>- List item</code> or <code>1. Numbered item</code>
                        <br />• <code>`inline code`</code> or <code>```code block```</code>
                        <br />• <code>[link text](url)</code>, <code>![alt text](image-url)</code>
                        <br />• <code>&gt; Quote text</code>
                    </div>
                    <textarea
                        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f47e00] focus:border-transparent font-mono text-sm"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your guide content using markdown formatting..."
                        rows={20}
                    />
                    <div className="text-sm text-gray-500 mt-1">{content.length} characters</div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        className="bg-gray-400 hover:bg-gray-500 text-white py-3 px-6 rounded-lg transition-colors"
                        onClick={() => handleSubmit(false)}
                        disabled={!title.trim() || !content.trim() || !gameId}
                    >
                        Save Changes
                    </button>
                    <button
                        className="bg-[#f47e00] hover:bg-[#d56b00] text-white py-3 px-6 rounded-lg transition-colors"
                        onClick={() => handleSubmit(true)}
                        disabled={!title.trim() || !content.trim() || !gameId}
                    >
                        Publish
                    </button>
                    <button
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-6 rounded-lg transition-colors"
                        onClick={() => navigate('/my-drafts')}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditGuidePage;