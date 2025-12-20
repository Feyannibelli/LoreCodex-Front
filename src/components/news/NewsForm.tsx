import React, { useState, useEffect } from 'react';
import { NewsForm as NewsFormData } from '../../interfaces/News';
import UnifiedContentEditor from '../UnifiedContentEditor';
import ProEditorLayout from '../layout/ProEditorLayout';
import ProInput from '../ui/ProInput';
import Button from '../Button';
import { Save, Image as ImageIcon, Hash, FileText, Newspaper, Calendar, AlignLeft } from 'lucide-react';

interface NewsFormProps {
    initialData?: NewsFormData;
    onSubmit: (data: NewsFormData) => Promise<void>;
    submitLabel?: string;
    pageTitle: string;
    breadcrumbs: { label: string; href?: string }[];
    isSubmitting?: boolean;
}

const NewsForm: React.FC<NewsFormProps> = ({
    initialData,
    onSubmit,
    submitLabel = 'Publish News',
    pageTitle,
    breadcrumbs,
    isSubmitting = false
}) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [summary, setSummary] = useState(initialData?.summary || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
    const [publishedAt, setPublishedAt] = useState(initialData?.publishedAt || '');
    // Tag Input State (Local to allow typing commas without immediate format/wipe)
    const [tagInput, setTagInput] = useState(initialData?.tags?.join(", ") || "");

    // Status for Layout
    const [status, setStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');

    useEffect(() => {
        if (
            title !== (initialData?.title || '') ||
            summary !== (initialData?.summary || '') ||
            content !== (initialData?.content || '') ||
            coverImage !== (initialData?.coverImage || '') ||
            publishedAt !== (initialData?.publishedAt || '') ||
            tagInput !== (initialData?.tags?.join(', ') || '') // compare with initial formatted string
        ) {
            setStatus('unsaved');
        }
    }, [title, summary, content, coverImage, publishedAt, tagInput, initialData]);

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            return;
        }

        setStatus('saving');
        await onSubmit({
            title,
            summary: summary.trim() || undefined,
            content,
            coverImage: coverImage.trim() || undefined,
            publishedAt: publishedAt || undefined,
            tags: tagInput.split(',').map(t => t.trim()).filter(Boolean)
        });
        setStatus('saved');
    };

    const Actions = (
        <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="gap-2"
        >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
    );

    return (
        <ProEditorLayout
            title={pageTitle}
            breadcrumbs={breadcrumbs}
            actions={Actions}
            status={isSubmitting ? 'saving' : status}
            className="pb-20"
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Properties */}
                <div className="space-y-6 lg:col-span-1">
                    <div className="rounded-xl border border-white/5 bg-card/60 backdrop-blur-sm p-5 space-y-6 sticky top-24">
                        <div className="flex items-center gap-2 text-muted-foreground pb-2 border-b border-white/5">
                            <Newspaper className="h-4 w-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">News Details</h3>
                        </div>

                        <ProInput
                            label="Headline"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter catchy headline..."
                            required
                            icon={Hash}
                        />

                        <ProInput
                            label="Summary"
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            placeholder="Brief summary for previews..."
                            helperText="Optional short description"
                            icon={AlignLeft}
                        />

                        <ProInput
                            label="Cover Image URL"
                            value={coverImage}
                            onChange={(e) => setCoverImage(e.target.value)}
                            placeholder="https://..."
                            icon={ImageIcon}
                        />

                        {coverImage && (
                            <div className="rounded-lg overflow-hidden border border-white/10 aspect-video bg-black/50">
                                <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                            </div>
                        )}

                        <ProInput
                            label="Publish Date"
                            type="datetime-local"
                            value={publishedAt}
                            onChange={(e) => setPublishedAt(e.target.value)}
                            helperText="Optional: defaults to now"
                            icon={Calendar}
                        />

                        <ProInput
                            label="Tags"
                            value={tagInput}
                            onChange={(e) => {
                                setTagInput(e.target.value);
                            }}
                            placeholder="news, update, event"
                            helperText="Comma separated"
                            icon={Hash}
                        />
                        {/* Tags Preview Pills */}
                        {tagInput.split(',').map(t => t.trim()).filter(Boolean).length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {tagInput.split(',').map(t => t.trim()).filter(Boolean).map((tag, i) => (
                                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Content */}
                <div className="space-y-6 lg:col-span-2">
                    <div className="rounded-xl border border-white/5 bg-card/60 backdrop-blur-sm p-5 space-y-4">
                        <div className="flex items-center gap-2 text-muted-foreground pb-2 border-b border-white/5">
                            <FileText className="h-4 w-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">Article Content</h3>
                        </div>

                        <UnifiedContentEditor
                            value={content}
                            onChange={setContent}
                            rows={20}
                            placeholder="Write your article here..."
                            helpText="Supports Markdown. Use ## for headers, * for lists."
                        />
                    </div>
                </div>
            </div>
        </ProEditorLayout>
    );
};

export default NewsForm;
