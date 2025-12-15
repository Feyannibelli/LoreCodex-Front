import { useState } from "react";
import { GuideForm as Form } from "../../interfaces/Guide";
import UnifiedContentEditor from "../UnifiedContentEditor";
import Input from "../ui/Input";
import Button from "../Button";
import { Save, Send } from "lucide-react";

interface Props {
    initial?: Form;
    submitLabel: string;
    onSubmit: (data: Form) => void;
    onPublish?: (data: Form) => void;
    publishLabel?: string;
}

const GuideForm: React.FC<Props> = ({
    initial,
    submitLabel,
    onSubmit,
    onPublish,
    publishLabel = "Publish Guide"
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

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <form
                onSubmit={e => {
                    e.preventDefault();
                    onSubmit(form);
                }}
                className="space-y-8"
            >
                {/* Title */}
                <div className="space-y-2">
                    <Input
                        label="Guide Title *"
                        name="title"
                        value={form.title}
                        onChange={handle}
                        placeholder="Ex: Complete guide for beginners..."
                        required
                        className="bg-secondary/30 border-white/5 focus:border-primary/50 text-lg py-6"
                    />
                </div>

                {/* Cover Image URL */}
                <div className="space-y-4">
                    <Input
                        label="Cover Image URL (Optional)"
                        name="coverImageUrl"
                        value={form.coverImageUrl ?? ""}
                        onChange={handle}
                        placeholder="https://example.com/image.jpg"
                        className="bg-secondary/30 border-white/5"
                    />

                    {form.coverImageUrl && (
                        <div className="mt-4 p-4 rounded-xl border border-white/5 bg-secondary/20 backdrop-blur-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                                Preview
                            </p>
                            <div className="relative aspect-video max-w-sm rounded-lg overflow-hidden bg-background shadow-lg">
                                <img
                                    src={form.coverImageUrl}
                                    alt="Cover preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Content - UNIFIED */}
                <div className="space-y-2">
                    <UnifiedContentEditor
                        label="Guide Content *"
                        value={form.content}
                        onChange={handleContentChange}
                        rows={20}
                        placeholder="Write your guide using Markdown...

# Main Title
## Subtitle
### Section

**Bold text** and *italic text*

- List item 1
- List item 2

[Link text](https://example.com)

`code snippet`

> This is a quote

You can mention content:
• /games/ to mention games
• /guides/ to reference other guides
• /challenges/ to mention challenges
• /lists/ to reference lists
• /news/ to mention news"
                        helpText="Write your full guide. Use Markdown for rich formatting and mentions to reference other platform content."
                    />
                </div>

                {/* Tags */}
                <div className="space-y-3">
                    <Input
                        label="Tags (Optional)"
                        name="tags"
                        onChange={handleTags}
                        value={form.tags?.join(", ") ?? ""}
                        helperText="Separate tags with commas"
                        placeholder="tutorial, beginner, strategy"
                        className="bg-secondary/30 border-white/5"
                    />

                    {form.tags && form.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {form.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 shadow-sm"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-white/5">
                    {/* Primary Save Button */}
                    <Button
                        type="submit"
                        variant="secondary"
                        size="lg"
                        className="w-full sm:w-auto font-semibold gap-2"
                    >
                        <Save className="h-4 w-4" />
                        {submitLabel}
                    </Button>

                    {/* Publish Button (if available) */}
                    {onPublish && (
                        <Button
                            type="button"
                            variant="default"
                            size="lg"
                            onClick={() => onPublish({ ...form, published: true, draft: false })}
                            className="w-full sm:w-auto font-bold shadow-lg shadow-primary/20 gap-2"
                        >
                            <Send className="h-4 w-4" />
                            {publishLabel}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default GuideForm;
