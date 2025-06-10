import { useState } from "react";
import { GuideForm as Form } from "@/interfaces/Guide";

interface Props {
    initial?: Form;
    submitLabel: string;                // texto del botón principal
    onSubmit: (data: Form) => void;     // callback principal
    onPublish?: (data: Form) => void;   // callback opcional “Publish”
    publishLabel?: string;
}

const GuideForm: React.FC<Props> = ({ initial, submitLabel, onSubmit, onPublish, publishLabel = "Publish" }) => {
    const [form, setForm] = useState<Form>(
        initial ?? { title: "", content: "", coverImageUrl: "", tags: [], published: false, draft: true }
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

    const handleTags = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(prev => ({
            ...prev,
            tags: e.target.value.split(",").map(t => t.trim()),
        }));

    return (
        <form
            onSubmit={e => {
                e.preventDefault();
                onSubmit(form);
            }}
            className="space-y-4 max-w-2xl mx-auto"
        >
            <input
                name="title"
                value={form.title}
                onChange={handle}
                className="w-full border p-2 rounded"
                placeholder="Title"
                required
            />

            <textarea
                name="content"
                value={form.content}
                onChange={handle}
                className="w-full border p-2 rounded"
                rows={10}
                placeholder="Content"
                required
            />

            <input
                name="coverImageUrl"
                value={form.coverImageUrl ?? ""}
                onChange={handle}
                className="w-full border p-2 rounded"
                placeholder="Cover image URL"
            />

            <input
                name="tags"
                onChange={handleTags}
                value={form.tags?.join(", ") ?? ""}
                className="w-full border p-2 rounded"
                placeholder="Tags, comma-separated"
            />

            <div className="flex gap-4">
                {/* Botón principal (Save draft) */}
                <button
                    type="button"
                    onClick={() => onSubmit(form)}                    // usa callback principal
                    className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
                >
                    {submitLabel}
                </button>

                {/* Botón Publish: solo si onPublish existe */}
                {onPublish && (
                    <button
                        type="button"
                        onClick={() => onPublish({ ...form, published: true, draft: false })}
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                    >
                        Publish
                    </button>
                )}
            </div>
        </form>
    );
};
export default GuideForm;
