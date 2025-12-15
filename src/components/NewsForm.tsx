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
                <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                    Título *
                </label>
                <input
                    id="title"
                    name="title"
                    placeholder="Ingresa el título de la noticia"
                    className="w-full border border-input p-3 rounded-lg focus:ring-2 focus:ring-ring focus:border-input transition-colors bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                    value={form.title}
                    onChange={handleChange}
                    required
                />
            </div>

            {/* Contenido con editor unificado (Markdown + Menciones) */}
            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
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
            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                <label htmlFor="coverImage" className="block text-sm font-medium text-foreground mb-2">
                    Imagen de portada
                </label>
                <input
                    id="coverImage"
                    name="coverImage"
                    placeholder="URL de la imagen de portada"
                    className="w-full border border-input p-3 rounded-lg focus:ring-2 focus:ring-ring focus:border-input transition-colors bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                    value={form.coverImage ?? ""}
                    onChange={handleChange}
                />
                {form.coverImage && (
                    <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-2">Vista previa:</p>
                        <img
                            src={form.coverImage}
                            alt="Vista previa"
                            className="max-w-xs h-auto rounded-lg border border-border shadow-sm"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const errorDiv = document.createElement('div');
                                errorDiv.className = 'text-destructive text-sm mt-2';
                                errorDiv.textContent = '❌ Error al cargar la imagen';
                                e.currentTarget.parentElement?.appendChild(errorDiv);
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Tags */}
            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                <label htmlFor="tags" className="block text-sm font-medium text-foreground mb-2">
                    Etiquetas
                    <span className="text-xs text-muted-foreground ml-2">
                        (Separadas por comas)
                    </span>
                </label>
                <input
                    id="tags"
                    name="tags"
                    placeholder="tecnología, noticias, actualidad"
                    className="w-full border border-input p-3 rounded-lg focus:ring-2 focus:ring-ring focus:border-input transition-colors bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                    value={form.tags?.join(", ") ?? ""}
                    onChange={handleTags}
                />
                {form.tags && form.tags.length > 0 && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                        {form.tags.map(tag => (
                            <span
                                key={tag}
                                className="inline-flex items-center text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium"
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
                    className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 focus:ring-4 focus:ring-ring transition-all font-medium shadow-sm"
                >
                    {submitLabel}
                </button>
            </div>
        </form>
    );
};

export default NewsForm;
