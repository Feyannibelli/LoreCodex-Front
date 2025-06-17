import { useState } from "react";
import { NewsForm as FormValues } from "../interfaces/News";
import { MentionInput } from "./MentionInput";
import { MentionDisplay } from "./MentionDisplay";

interface Props {
    initial?: FormValues;
    onSubmit: (data: FormValues) => void;
    submitLabel: string;
}

const NewsForm: React.FC<Props> = ({ initial, onSubmit, submitLabel }) => {
    const [form, setForm] = useState<FormValues>(
        initial ?? { title: "", content: "", coverImage: "", tags: [] }
    );
    const [showPreview, setShowPreview] = useState(false);

    /* maneja cambios genéricos */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    /* maneja cambios del editor markdown con menciones */
    const handleContentChange = (value: string) => {
        setForm(prev => ({ ...prev, content: value }));
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
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
            {/* Título */}
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                </label>
                <input
                    id="title"
                    name="title"
                    placeholder="Ingresa el título de la noticia"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={form.title}
                    onChange={handleChange}
                    required
                />
            </div>

            {/* Contenido con editor markdown y sistema de menciones */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Contenido *
                        <span className="text-xs text-gray-500 ml-2">
                            (Usa Markdown y menciones como /games/, /guides/, etc.)
                        </span>
                    </label>
                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
                    >
                        {showPreview ? "📝 Editar" : "👁️ Vista Previa"}
                    </button>
                </div>

                {showPreview ? (
                    <div className="border border-gray-300 rounded-lg p-4 min-h-[300px] bg-gray-50">
                        <div className="prose prose-slate max-w-none">
                            <MentionDisplay text={form.content} />
                        </div>
                    </div>
                ) : (
                    <MentionInput
                        value={form.content}
                        onChange={handleContentChange}
                        placeholder="Escribe el contenido de tu noticia usando Markdown...

Puedes mencionar:
• /games/ para mencionar juegos
• /guides/ para mencionar guías
• /challenges/ para mencionar desafíos
• /lists/ para mencionar listas
• /news/ para mencionar otras noticias"
                        multiline={true}
                        rows={12}
                        className="font-mono text-sm"
                    />
                )}

                {/* Ayuda sobre menciones */}
                <div className="mt-2 p-3 bg-blue-50 rounded text-sm text-blue-700">
                    <strong>💡 Cómo usar menciones:</strong>
                    <ul className="mt-1 space-y-1 text-xs">
                        <li>• Escribe <code>/games/</code> y empieza a escribir el nombre del juego</li>
                        <li>• Usa las flechas ↑↓ para navegar y Enter para seleccionar</li>
                        <li>• Las menciones se mostrarán como enlaces en la vista previa</li>
                    </ul>
                </div>
            </div>

            {/* Imagen de portada */}
            <div>
                <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen de portada
                </label>
                <input
                    id="coverImage"
                    name="coverImage"
                    placeholder="URL de la imagen de portada"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={form.coverImage ?? ""}
                    onChange={handleChange}
                />
                {form.coverImage && (
                    <div className="mt-2">
                        <img
                            src={form.coverImage}
                            alt="Vista previa"
                            className="max-w-xs h-auto rounded border"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement?.appendChild(
                                    Object.assign(document.createElement('div'), {
                                        className: 'text-red-500 text-sm',
                                        textContent: 'Error al cargar la imagen'
                                    })
                                );
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Tags */}
            <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                    Etiquetas
                    <span className="text-xs text-gray-500 ml-2">
                        (Separadas por comas)
                    </span>
                </label>
                <input
                    id="tags"
                    name="tags"
                    placeholder="tecnología, noticias, actualidad"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={form.tags?.join(", ") ?? ""}
                    onChange={handleTags}
                />
                {form.tags && form.tags.length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                        {form.tags.map(tag => (
                            <span
                                key={tag}
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
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
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all font-medium"
                >
                    {submitLabel}
                </button>
            </div>
        </form>
    );
};

export default NewsForm;