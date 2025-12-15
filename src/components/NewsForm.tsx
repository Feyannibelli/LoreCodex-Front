import { useState } from "react";
import { NewsForm as FormValues } from "../interfaces/News";
import UnifiedContentEditor from "./UnifiedContentEditor";

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

    /* maneja cambios del editor unificado */
    const handleContentChange = (value: string) => {
        setForm(prev => ({ ...prev, content: value }));
    };

    /* tags separados por coma */
    const handleTags = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
            {/* Título */}
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título *
                </label>
                <input
                    id="title"
                    name="title"
                    placeholder="Ingresa el título de la noticia"
                    className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors dark:bg-gray-700 dark:text-white"
                    value={form.title}
                    onChange={handleChange}
                    required
                />
            </div>

            {/* Contenido con editor unificado (Markdown + Menciones) */}
            <div className="bg-white dark:bg-[#313E3F] rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <UnifiedContentEditor
                    label="Contenido *"
                    value={form.content}
                    onChange={handleContentChange}
                    rows={15}
                    placeholder="Escribe el contenido de tu noticia usando Markdown...

Puedes mencionar:
• /games/ para mencionar juegos
• /guides/ para mencionar guías
• /challenges/ para mencionar desafíos
• /lists/ para mencionar listas
• /news/ para mencionar otras noticias"
                    helpText="Escribe tu noticia completa. Puedes usar Markdown para dar formato y menciones para referenciar otros contenidos."
                />
            </div>

            {/* Imagen de portada */}
            <div className="bg-white dark:bg-[#313E3F] rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Imagen de portada
                </label>
                <input
                    id="coverImage"
                    name="coverImage"
                    placeholder="URL de la imagen de portada"
                    className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors dark:bg-gray-700 dark:text-white"
                    value={form.coverImage ?? ""}
                    onChange={handleChange}
                />
                {form.coverImage && (
                    <div className="mt-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Vista previa:</p>
                        <img
                            src={form.coverImage}
                            alt="Vista previa"
                            className="max-w-xs h-auto rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const errorDiv = document.createElement('div');
                                errorDiv.className = 'text-red-500 dark:text-red-400 text-sm mt-2';
                                errorDiv.textContent = '❌ Error al cargar la imagen';
                                e.currentTarget.parentElement?.appendChild(errorDiv);
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Tags */}
            <div className="bg-white dark:bg-[#313E3F] rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Etiquetas
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        (Separadas por comas)
                    </span>
                </label>
                <input
                    id="tags"
                    name="tags"
                    placeholder="tecnología, noticias, actualidad"
                    className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors dark:bg-gray-700 dark:text-white"
                    value={form.tags?.join(", ") ?? ""}
                    onChange={handleTags}
                />
                {form.tags && form.tags.length > 0 && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                        {form.tags.map(tag => (
                            <span
                                key={tag}
                                className="inline-flex items-center text-xs bg-orange-500/10 text-orange-600 px-3 py-1 rounded-full font-medium"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Botón de envío */}
            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-600/20 transition-all font-medium shadow-sm"
                >
                    {submitLabel}
                </button>
            </div>
        </form>
    );
};

export default NewsForm;
