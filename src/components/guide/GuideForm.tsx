import { useState } from "react";
import { GuideForm as Form } from "../../interfaces/Guide";
import { MentionInput } from "../../components/MentionInput";
import { MentionDisplay, useMentions } from "../MentionDisplay.tsx";

interface Props {
    initial?: Form;
    submitLabel: string;                // texto del botón principal
    onSubmit: (data: Form) => void;     // callback principal
    onPublish?: (data: Form) => void;   // callback opcional "Publish"
    publishLabel?: string;
}

const GuideForm: React.FC<Props> = ({
                                        initial,
                                        submitLabel,
                                        onSubmit,
                                        onPublish,
                                        publishLabel = "Create Guide"
                                    }) => {
    const [form, setForm] = useState<Form>(
        initial ?? {
            title: "",
            content: "",
            coverImageUrl: "",
            tags: [],
            published: false,
            draft: true
        }
    );

    // Preview mode para mostrar cómo se verán las menciones
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const { hasMentions, mentionCount } = useMentions(form.content);

    const handle = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? (e.target as HTMLInputElement).checked
                    : value,
        }));
    };

    const handleContentChange = (value: string) => {
        setForm(prev => ({ ...prev, content: value }));
    };

    const handleTags = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(prev => ({
            ...prev,
            tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean),
        }));

    const handleMentionClick = (mention: any) => {
        // Aquí puedes manejar clicks en menciones (ej: abrir modal, navegar, etc.)
        console.log('Mention clicked:', mention);
    };

    return (
        <div className="space-y-4 max-w-4xl mx-auto">
            <form
                onSubmit={e => {
                    e.preventDefault();
                    onSubmit(form);
                }}
                className="space-y-6"
            >
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                    </label>
                    <input
                        name="title"
                        value={form.title}
                        onChange={handle}
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter guide title..."
                        required
                    />
                </div>

                {/* Cover Image URL */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cover Image URL (optional)
                    </label>
                    <input
                        name="coverImageUrl"
                        value={form.coverImageUrl ?? ""}
                        onChange={handle}
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                    />
                    {form.coverImageUrl && (
                        <div className="mt-2">
                            <img
                                src={form.coverImageUrl}
                                alt="Cover preview"
                                className="max-w-xs h-32 object-cover rounded border"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Content with Mentions */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Content
                        </label>
                        <div className="flex items-center space-x-4">
                            {hasMentions && (
                                <span className="text-sm text-blue-600">
                                    {mentionCount} mention{mentionCount !== 1 ? 's' : ''}
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsPreviewMode(!isPreviewMode)}
                                className="text-sm text-gray-600 hover:text-gray-800 underline"
                            >
                                {isPreviewMode ? 'Edit' : 'Preview'}
                            </button>
                        </div>
                    </div>

                    {!isPreviewMode ? (
                        <MentionInput
                            value={form.content}
                            onChange={handleContentChange}
                            multiline={true}
                            rows={12}
                            className="min-h-[300px] font-mono text-sm"
                            placeholder="Write your guide content here...

Use mentions to reference other content:
• /games/Game Name - to mention games
• /guides/Guide Title - to reference other guides
• /challenges/Challenge Title - to mention challenges
• /lists/List Name - to reference lists
• /news/Article Title - to mention news articles"
                        />
                    ) : (
                        <div className="border border-gray-300 rounded-lg p-4 min-h-[300px] bg-gray-50">
                            <div className="prose prose-slate max-w-none">
                                <MentionDisplay
                                    text={form.content}
                                    onMentionClick={handleMentionClick}
                                    className="whitespace-pre-wrap"
                                />
                            </div>
                        </div>
                    )}

                    {/* Mention Help */}
                    <div className="mt-2 text-xs text-gray-500">
                        <details>
                            <summary className="cursor-pointer hover:text-gray-700">
                                How to use mentions
                            </summary>
                            <div className="mt-2 space-y-1">
                                <p>• Type <code>/games/</code> and start typing a game name</p>
                                <p>• Type <code>/guides/</code> to reference other guides</p>
                                <p>• Type <code>/challenges/</code> to mention challenges</p>
                                <p>• Type <code>/lists/</code> to reference lists</p>
                                <p>• Type <code>/news/</code> to mention news articles</p>
                                <p className="text-blue-600">Use arrow keys to navigate suggestions, Enter to select</p>
                            </div>
                        </details>
                    </div>
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags (optional)
                    </label>
                    <input
                        name="tags"
                        onChange={handleTags}
                        value={form.tags?.join(", ") ?? ""}
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="tutorial, beginner, strategy (comma-separated)"
                    />
                    {form.tags && form.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {form.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                    {/* Primary Save Button */}
                    <button
                        type="button"
                        onClick={() => onSubmit(form)}
                        className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                        {submitLabel}
                    </button>

                    {/* Publish Button (if available) */}
                    {onPublish && (
                        <button
                            type="button"
                            onClick={() => onPublish({ ...form, published: true, draft: false })}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                            {publishLabel}
                        </button>
                    )}

                    {/* Preview Toggle for Mobile */}
                    <button
                        type="button"
                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                        className="sm:hidden bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        {isPreviewMode ? '✏️ Edit Mode' : '👁️ Preview Mode'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GuideForm;