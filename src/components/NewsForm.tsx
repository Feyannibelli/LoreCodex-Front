import { useState } from "react";
import { NewsForm as FormValues } from "@/interfaces/News";

interface Props {
    initial?: FormValues;
    onSubmit: (data: FormValues) => void;
    submitLabel: string;
}

const NewsForm: React.FC<Props> = ({ initial, onSubmit, submitLabel }) => {
    const [form, setForm] = useState<FormValues>(
        initial ?? { title: "", content: "", coverImage: "", tags: [] }
    );

    /* maneja cambios genéricos */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    /* tags separados por coma */
    const handleTags = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, tags: e.target.value.split(",").map(t => t.trim()) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
            <input
                name="title"
                placeholder="Title"
                className="w-full border p-2 rounded"
                value={form.title}
                onChange={handleChange}
                required
            />

            <textarea
                name="content"
                placeholder="Content"
                className="w-full border p-2 rounded"
                rows={8}
                value={form.content}
                onChange={handleChange}
                required
            />

            <input
                name="coverImage"
                placeholder="Cover image URL"
                className="w-full border p-2 rounded"
                value={form.coverImage ?? ""}
                onChange={handleChange}
            />

            <input
                name="tags"
                placeholder="Tags (comma-separated)"
                className="w-full border p-2 rounded"
                value={form.tags?.join(", ") ?? ""}
                onChange={handleTags}
            />

            <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
                {submitLabel}
            </button>
        </form>
    );
};

export default NewsForm;
