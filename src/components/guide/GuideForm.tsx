import { useState } from "react";
import { GuideForm as Form } from "../../interfaces/Guide";
import UnifiedContentEditor from "../UnifiedContentEditor";

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
                                        publishLabel = "Publicar Guía"
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
        <div className="space-y-6 max-w-4xl mx-auto">
            <form
                onSubmit={e => {
                    e.preventDefault();
                    onSubmit(form);
                }}
                className="space-y-6"
            >
                {/* Title */}
                <div className="bg-white dark:bg-[#313E3F] rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Título de la Guía *
                    </label>
                    <input
                        name="title"
                        value={form.title}
                        onChange={handle}
                        className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Ej: Guía completa para principiantes..."
                        required
                    />
                </div>

                {/* Cover Image URL */}
                <div className="bg-white dark:bg-[#313E3F] rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Imagen de Portada (URL) - Opcional
                    </label>
                    <input
                        name="coverImageUrl"
                        value={form.coverImageUrl ?? ""}
                        onChange={handle}
                        className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="https://ejemplo.com/imagen.jpg"
                    />
                    {form.coverImageUrl && (
                        <div className="mt-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Vista previa:</p>
                            <img
                                src={form.coverImageUrl}
                                alt="Cover preview"
                                className="max-w-xs h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Content - UNIFICADO */}
                <div className="bg-white dark:bg-[#313E3F] rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <UnifiedContentEditor
                        label="Contenido de la Guía *"
                        value={form.content}
                        onChange={handleContentChange}
                        rows={18}
                        placeholder="Escribe tu guía usando Markdown y menciones...

# Título Principal
## Subtítulo
### Sección

**Texto en negrita** y *texto en cursiva*

- Elemento de lista 1
- Elemento de lista 2

[Texto del enlace](https://ejemplo.com)

`fragmento de código`

> Esto es una cita

Puedes mencionar contenido:
• /games/ para mencionar juegos
• /guides/ para referenciar otras guías
• /challenges/ para mencionar desafíos
• /lists/ para referenciar listas
• /news/ para mencionar noticias"
                        helpText="Escribe tu guía completa. Usa Markdown para formato enriquecido y menciones para referenciar otros contenidos de la plataforma."
                    />
                </div>

                {/* Tags */}
                <div className="bg-white dark:bg-[#313E3F] rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Etiquetas - Opcional
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            (Separadas por comas)
                        </span>
                    </label>
                    <input
                        name="tags"
                        onChange={handleTags}
                        value={form.tags?.join(", ") ?? ""}
                        className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="tutorial, principiante, estrategia"
                    />
                    {form.tags && form.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {form.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {/* Primary Save Button */}
                    <button
                        type="submit"
                        className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-sm flex items-center justify-center gap-2"
                    >
                        💾 {submitLabel}
                    </button>

                    {/* Publish Button (if available) */}
                    {onPublish && (
                        <button
                            type="button"
                            onClick={() => onPublish({ ...form, published: true, draft: false })}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm flex items-center justify-center gap-2"
                        >
                            🚀 {publishLabel}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default GuideForm;
