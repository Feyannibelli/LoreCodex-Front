// src/components/MarkdownEditor.tsx
import { useState } from "react";

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
                                                           value,
                                                           onChange,
                                                           placeholder = "Escribe tu contenido en markdown...",
                                                           rows = 10
                                                       }) => {
    const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'help'>('edit');

    // Función simple para convertir markdown a HTML
    const parseMarkdown = (text: string): string => {
        let html = text;

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2 mt-4">$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3 mt-4">$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 mt-4">$1</h1>');

        // Bold
        html = html.replace(/\*\*(.*)\*\*/gim, '<strong class="font-bold">$1</strong>');

        // Italic
        html = html.replace(/\*(.*)\*/gim, '<em class="italic">$1</em>');

        // Code inline
        html = html.replace(/`([^`]*)`/gim, '<code class="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono">$1</code>');

        // Links
        html = html.replace(/\[([^\]]*)\]\(([^)]*)\)/gim, '<a href="$2" class="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

        // Lists
        html = html.replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc">$1</li>');
        html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>');

        // Blockquotes
        html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 dark:text-gray-400 my-2">$1</blockquote>');

        // Line breaks
        html = html.replace(/\n/gim, '<br>');

        return html;
    };

    const markdownGuide = [
        { syntax: "# Título", description: "Título principal" },
        { syntax: "## Subtítulo", description: "Subtítulo" },
        { syntax: "### Título menor", description: "Título de tercer nivel" },
        { syntax: "**texto**", description: "Texto en negrita" },
        { syntax: "*texto*", description: "Texto cursiva" },
        { syntax: "`código`", description: "Código en línea" },
        { syntax: "[texto](URL)", description: "Enlace" },
        { syntax: "* elemento", description: "Lista con viñetas" },
        { syntax: "1. elemento", description: "Lista numerada" },
        { syntax: "> cita", description: "Cita o blockquote" },
    ];

    const insertMarkdown = (syntax: string) => {
        const textarea = document.querySelector(`textarea[data-markdown-editor="true"]`) as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);

        let newText = '';

        switch (syntax) {
            case 'bold':
                newText = value.substring(0, start) + `**${selectedText || 'texto'}**` + value.substring(end);
                break;
            case 'italic':
                newText = value.substring(0, start) + `*${selectedText || 'texto'}*` + value.substring(end);
                break;
            case 'code':
                newText = value.substring(0, start) + `\`${selectedText || 'código'}\`` + value.substring(end);
                break;
            case 'link':
                newText = value.substring(0, start) + `[${selectedText || 'texto del enlace'}](URL)` + value.substring(end);
                break;
            case 'h1':
                newText = value.substring(0, start) + `# ${selectedText || 'Título'}` + value.substring(end);
                break;
            case 'h2':
                newText = value.substring(0, start) + `## ${selectedText || 'Subtítulo'}` + value.substring(end);
                break;
            case 'list':
                newText = value.substring(0, start) + `* ${selectedText || 'elemento de lista'}` + value.substring(end);
                break;
            case 'quote':
                newText = value.substring(0, start) + `> ${selectedText || 'cita'}` + value.substring(end);
                break;
            default:
                return;
        }

        onChange(newText);

        // Restaurar foco
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + newText.length - value.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    return (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b bg-gray-50 dark:bg-gray-700">
                <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    className={`px-4 py-2 text-sm font-medium ${
                        activeTab === 'edit'
                            ? 'bg-white dark:bg-gray-800 border-b-2 border-orange-500 text-orange-600'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                >
                    ✏️ Edit
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`px-4 py-2 text-sm font-medium ${
                        activeTab === 'preview'
                            ? 'bg-white dark:bg-gray-800 border-b-2 border-orange-500 text-orange-600'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                >
                    👁️ Preview
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('help')}
                    className={`px-4 py-2 text-sm font-medium ${
                        activeTab === 'help'
                            ? 'bg-white dark:bg-gray-800 border-b-2 border-orange-500 text-orange-600'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                >
                    ❓ Ayuda
                </button>
            </div>

            {/* Toolbar (solo visible en modo edición) */}
            {activeTab === 'edit' && (
                <div className="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <button
                        type="button"
                        onClick={() => insertMarkdown('h1')}
                        className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Título principal"
                    >
                        H1
                    </button>
                    <button
                        type="button"
                        onClick={() => insertMarkdown('h2')}
                        className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Subtítulo"
                    >
                        H2
                    </button>
                    <button
                        type="button"
                        onClick={() => insertMarkdown('bold')}
                        className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 font-bold"
                        title="Negrita"
                    >
                        B
                    </button>
                    <button
                        type="button"
                        onClick={() => insertMarkdown('italic')}
                        className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 italic"
                        title="Cursiva"
                    >
                        I
                    </button>
                    <button
                        type="button"
                        onClick={() => insertMarkdown('code')}
                        className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 font-mono"
                        title="Código"
                    >
                        &lt;/&gt;
                    </button>
                    <button
                        type="button"
                        onClick={() => insertMarkdown('link')}
                        className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Enlace"
                    >
                        🔗
                    </button>
                    <button
                        type="button"
                        onClick={() => insertMarkdown('list')}
                        className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Lista"
                    >
                        • Lista
                    </button>
                    <button
                        type="button"
                        onClick={() => insertMarkdown('quote')}
                        className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Cita"
                    >
                        " Cita
                    </button>
                </div>
            )}

            {/* Content */}
            <div className="min-h-[300px]">
                {activeTab === 'edit' && (
                    <textarea
                        data-markdown-editor="true"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        rows={rows}
                        className="w-full p-4 resize-none focus:outline-none font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                )}

                {activeTab === 'preview' && (
                    <div className="p-4 prose prose-slate dark:prose-invert max-w-none">
                        {value ? (
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: parseMarkdown(value)
                                }}
                            />
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 italic">Escribe algo en el editor para ver la vista previa...</p>
                        )}
                    </div>
                )}

                {activeTab === 'help' && (
                    <div className="p-4">
                        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Sintaxis Markdown</h3>
                        <div className="space-y-2">
                            {markdownGuide.map((item, index) => (
                                <div key={index} className="flex gap-4 items-center">
                                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono min-w-[120px]">
                                        {item.syntax}
                                    </code>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.description}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 p-3 bg-indigo-600/10 border border-indigo-600/20 rounded">
                            <p className="text-sm text-indigo-700 dark:text-indigo-300">
                                <strong>Tip:</strong> Puedes seleccionar texto y usar los botones de la barra de herramientas para aplicar formato rápidamente.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarkdownEditor;
