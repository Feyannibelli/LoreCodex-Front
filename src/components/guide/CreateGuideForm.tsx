import React, { useState } from 'react';
import axios from 'axios';
import UnifiedContentEditor from '../UnifiedContentEditor';

const CreateGuideForm: React.FC = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            alert('El título es obligatorio');
            return;
        }

        if (!content.trim()) {
            alert('El contenido es obligatorio');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:8081/guides/create',
                { title, content },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert('¡Guía creada exitosamente!');
            setTitle('');
            setContent('');
        } catch (error) {
            console.error('Error creating guide:', error);
            alert('Error al crear la guía');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Crear Nueva Guía
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Título */}
                <div className="bg-white dark:bg-[#313E3F] rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Título *
                    </label>
                    <input
                        type="text"
                        placeholder="Título de tu guía"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                    />
                </div>

                {/* Contenido - UNIFICADO */}
                <div className="bg-white dark:bg-[#313E3F] rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <UnifiedContentEditor
                        label="Contenido *"
                        value={content}
                        onChange={setContent}
                        rows={15}
                        placeholder="Escribe tu guía usando Markdown y menciones...

# Título Principal
## Subtítulo

**Texto en negrita** y *texto en cursiva*

Menciona contenido relacionado:
• /games/ para juegos
• /guides/ para otras guías
• /challenges/ para desafíos"
                        helpText="Usa Markdown para formato y menciones para referenciar contenido."
                    />
                </div>

                {/* Botón de envío */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Creando...
                            </span>
                        ) : (
                            'Crear Guía'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateGuideForm;
