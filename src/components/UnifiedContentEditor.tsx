import React, { useState } from 'react';
import { MentionInput } from './MentionInput';
import UnifiedContentRenderer from './UnifiedContentRenderer.tsx';

interface UnifiedContentEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    label?: string;
    helpText?: string;
}

/**
 * Editor unificado que permite escribir contenido con:
 * - Markdown (botones de ayuda)
 * - Menciones (autocompletado con /games/, /guides/, etc.)
 *
 * Incluye vista previa en tiempo real.
 */
const UnifiedContentEditor: React.FC<UnifiedContentEditorProps> = ({
                                                                       value,
                                                                       onChange,
                                                                       placeholder = "Write your content... Use Markdown for formatting and /games/, /guides/, etc. for mentions",
                                                                       rows = 10,
                                                                       label,
                                                                       helpText
                                                                   }) => {
    const [showPreview, setShowPreview] = useState(false);

    return (
        <div className="space-y-3">
            {/* Label */}
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}

            {/* Tabs: Editar / Vista Previa */}
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                        !showPreview
                            ? 'border-b-2 border-orange-500 text-orange-600'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                >
                    ✏️ Edit
                </button>
                <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                        showPreview
                            ? 'border-b-2 border-orange-500 text-orange-600'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                >
                    👁️ Preview
                </button>
            </div>

            {/* Toolbar con ayuda de Markdown (solo en modo edición) */}
            {!showPreview && (
                <div className="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-t-lg border border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium self-center mr-2">
                    </span>
                    <button
                        type="button"
                        onClick={() => {
                            const textarea = document.querySelector('textarea[data-unified-editor]') as HTMLTextAreaElement;
                            if (textarea) {
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const selected = value.substring(start, end) || 'texto';
                                const newValue = value.substring(0, start) + `**${selected}**` + value.substring(end);
                                onChange(newValue);
                                setTimeout(() => {
                                    textarea.focus();
                                    textarea.setSelectionRange(start + 2, start + 2 + selected.length);
                                }, 0);
                            }
                        }}
                        className="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 font-bold"
                        title="Negrita"
                    >
                        B
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            const textarea = document.querySelector('textarea[data-unified-editor]') as HTMLTextAreaElement;
                            if (textarea) {
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const selected = value.substring(start, end) || 'texto';
                                const newValue = value.substring(0, start) + `*${selected}*` + value.substring(end);
                                onChange(newValue);
                                setTimeout(() => {
                                    textarea.focus();
                                    textarea.setSelectionRange(start + 1, start + 1 + selected.length);
                                }, 0);
                            }
                        }}
                        className="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 italic"
                        title="Cursiva"
                    >
                        I
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            const textarea = document.querySelector('textarea[data-unified-editor]') as HTMLTextAreaElement;
                            if (textarea) {
                                const start = textarea.selectionStart;
                                const newValue = value.substring(0, start) + '\n## ' + value.substring(start);
                                onChange(newValue);
                            }
                        }}
                        className="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                        title="Title"
                    >
                        H
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            const textarea = document.querySelector('textarea[data-unified-editor]') as HTMLTextAreaElement;
                            if (textarea) {
                                const start = textarea.selectionStart;
                                const newValue = value.substring(0, start) + '\n* ' + value.substring(start);
                                onChange(newValue);
                            }
                        }}
                        className="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                        title="List"
                    >
                        •
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            const textarea = document.querySelector('textarea[data-unified-editor]') as HTMLTextAreaElement;
                            if (textarea) {
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const selected = value.substring(start, end) || 'code';
                                const newValue = value.substring(0, start) + `\`${selected}\`` + value.substring(end);
                                onChange(newValue);
                            }
                        }}
                        className="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 font-mono"
                        title="Code"
                    >
                        &lt;/&gt;
                    </button>
                </div>
            )}

            {/* Contenido: Editor o Vista Previa */}
            {showPreview ? (
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 min-h-[300px] bg-gray-50 dark:bg-gray-800">
                    {value.trim() ? (
                        <UnifiedContentRenderer content={value} />
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic text-center py-8">
                            Write something in the editor to see the preview...
                        </p>
                    )}
                </div>
            ) : (
                <MentionInput
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    multiline={true}
                    rows={rows}
                    className="font-mono text-sm"
                />
            )}

            {/* Ayuda */}
            {helpText && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {helpText}
                </p>
            )}

            {/* Instrucciones */}
            {!showPreview && (
                <div className="bg-indigo-600/10 border border-indigo-600/20 rounded-lg p-3">
                    <p className="text-xs text-indigo-700 dark:text-indigo-300">
                        <strong>💡 Tip:</strong> Use <strong>**bold**</strong>, <em>*italic*</em>,
                        <code className="bg-indigo-600/10 px-1 rounded">`code`</code>,
                        <strong>## Titles</strong>, and mentions like <strong>/games/</strong>,
                        <strong>/guides/</strong>, <strong>/challenges/</strong>, <strong>/lists/</strong>,
                        <strong>/news/</strong> to reference content.
                    </p>
                </div>
            )}
        </div>
    );
};

export default UnifiedContentEditor;
