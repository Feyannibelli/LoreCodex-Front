import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useMentionSuggestions } from '../hook/useMentionSuggestions';

export interface MentionSuggestion {
    id: number;
    name: string;
    type: 'games' | 'guides' | 'challenges' | 'lists' | 'news';
    thumbnailUrl?: string;
}

interface MentionInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    onSubmit?: (value: string) => void;
    multiline?: boolean;
    rows?: number;
}

interface MentionState {
    isOpen: boolean;
    query: string;
    position: { top: number; left: number };
    startIndex: number;
    type: string;
    selectedIndex: number;
}

const MENTION_TRIGGERS = {
    '/games/': 'games',
    '/guides/': 'guides',
    '/challenges/': 'challenges',
    '/lists/': 'lists',
    '/news/': 'news'
} as const;

export const MentionInput: React.FC<MentionInputProps> = ({
                                                              value,
                                                              onChange,
                                                              placeholder = "Escribe tu mensaje... Usa /games/, /guides/, /challenges/, /lists/, /news/ para mencionar",
                                                              className = "",
                                                              onSubmit,
                                                              multiline = false,
                                                              rows = 3
                                                          }) => {
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    const [mentionState, setMentionState] = useState<MentionState>({
        isOpen: false,
        query: '',
        position: { top: 0, left: 0 },
        startIndex: 0,
        type: '',
        selectedIndex: 0
    });

    const { suggestions, loading, searchItems } = useMentionSuggestions();

    // Detectar menciones y obtener sugerencias
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const cursorPosition = e.target.selectionStart || 0;

        onChange(newValue);

        // Buscar trigger de mención antes del cursor
        const textBeforeCursor = newValue.slice(0, cursorPosition);
        let mentionMatch = null;
        let mentionType = '';
        let startIndex = 0;

        for (const [trigger, type] of Object.entries(MENTION_TRIGGERS)) {
            const lastTriggerIndex = textBeforeCursor.lastIndexOf(trigger);
            if (lastTriggerIndex !== -1) {
                const afterTrigger = textBeforeCursor.slice(lastTriggerIndex + trigger.length);
                // Verificar que no hay espacios después del trigger (mención incompleta)
                if (!afterTrigger.includes(' ') && !afterTrigger.includes('\n')) {
                    mentionMatch = afterTrigger;
                    mentionType = type;
                    startIndex = lastTriggerIndex;
                    break;
                }
            }
        }

        if (mentionMatch !== null && mentionType) {
            // Calcular posición del dropdown
            const rect = e.target.getBoundingClientRect();
            const position = calculateCursorPosition(e.target as HTMLElement, cursorPosition);

            setMentionState({
                isOpen: true,
                query: mentionMatch,
                position: {
                    top: rect.top + position.top + 20,
                    left: rect.left + position.left
                },
                startIndex,
                type: mentionType,
                selectedIndex: 0
            });

            // Buscar sugerencias
            searchItems(mentionType as any, mentionMatch);
        } else {
            setMentionState(prev => ({ ...prev, isOpen: false, selectedIndex: 0 }));
        }
    }, [onChange, searchItems]);

    // Manejar navegación con teclado
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!mentionState.isOpen) {
            if (e.key === 'Enter' && !multiline && onSubmit) {
                e.preventDefault();
                onSubmit(value);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setMentionState(prev => ({
                    ...prev,
                    selectedIndex: Math.min(prev.selectedIndex + 1, suggestions.length - 1)
                }));
                break;

            case 'ArrowUp':
                e.preventDefault();
                setMentionState(prev => ({
                    ...prev,
                    selectedIndex: Math.max(prev.selectedIndex - 1, 0)
                }));
                break;

            case 'Enter':
            case 'Tab':
                e.preventDefault();
                if (suggestions[mentionState.selectedIndex]) {
                    selectSuggestion(suggestions[mentionState.selectedIndex]);
                }
                break;

            case 'Escape':
                setMentionState(prev => ({ ...prev, isOpen: false, selectedIndex: 0 }));
                break;
        }
    }, [mentionState, suggestions, value]);

    // Seleccionar una sugerencia
    const selectSuggestion = useCallback((suggestion: MentionSuggestion) => {
        const trigger = Object.keys(MENTION_TRIGGERS).find(
            key => MENTION_TRIGGERS[key as keyof typeof MENTION_TRIGGERS] === suggestion.type
        );

        if (!trigger) return;

        const beforeMention = value.slice(0, mentionState.startIndex);
        const afterCursor = value.slice(mentionState.startIndex + trigger.length + mentionState.query.length);

        // Crear la mención con el formato correcto: /type/id|name
        const mentionText = `${trigger}${suggestion.id}|${suggestion.name}`;

        const newValue = beforeMention + mentionText + afterCursor;
        onChange(newValue);

        setMentionState(prev => ({ ...prev, isOpen: false, selectedIndex: 0 }));

        // Mover cursor después de la mención
        setTimeout(() => {
            if (inputRef.current) {
                const newCursorPosition = beforeMention.length + mentionText.length;
                inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
                inputRef.current.focus();
            }
        }, 0);
    }, [value, mentionState, onChange]);

    // Calcular posición del cursor para el dropdown
    const calculateCursorPosition = (element: HTMLElement, cursorPos: number) => {
        const div = document.createElement('div');
        const span = document.createElement('span');

        const computedStyle = window.getComputedStyle(element);
        div.style.cssText = computedStyle.cssText;
        div.style.position = 'absolute';
        div.style.visibility = 'hidden';
        div.style.height = 'auto';
        div.style.width = computedStyle.width;
        div.style.whiteSpace = 'pre-wrap';
        div.style.wordWrap = 'break-word';

        const textBeforeCursor = (element as HTMLInputElement).value.substring(0, cursorPos);
        div.textContent = textBeforeCursor;
        span.textContent = '|';
        div.appendChild(span);

        document.body.appendChild(div);
        const { offsetTop: top, offsetLeft: left } = span;
        document.body.removeChild(div);

        return { top, left };
    };

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setMentionState(prev => ({ ...prev, isOpen: false, selectedIndex: 0 }));
            }
        };

        if (mentionState.isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [mentionState.isOpen]);

    const InputComponent = multiline ? 'textarea' : 'input';

    return (
        <div className="relative">
            <InputComponent
                ref={inputRef as any}
                type={multiline ? undefined : "text"}
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${className}`}
                rows={multiline ? rows : undefined}
            />

            {mentionState.isOpen && (
                <div
                    ref={suggestionsRef}
                    className="fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto min-w-64"
                    style={{
                        top: mentionState.position.top,
                        left: mentionState.position.left
                    }}
                >
                    {loading ? (
                        <div className="px-3 py-2 text-gray-500 text-sm">
                            Buscando...
                        </div>
                    ) : suggestions.length > 0 ? (
                        suggestions.map((suggestion, index) => (
                            <div
                                key={`${suggestion.type}-${suggestion.id}`}
                                className={`px-3 py-2 cursor-pointer flex items-center space-x-2 ${
                                    index === mentionState.selectedIndex
                                        ? 'bg-orange-500/10 text-orange-600'
                                        : 'hover:bg-gray-100'
                                }`}
                                onClick={() => selectSuggestion(suggestion)}
                            >
                                {suggestion.thumbnailUrl && (
                                    <img
                                        src={suggestion.thumbnailUrl}
                                        alt={suggestion.name}
                                        className="w-6 h-6 rounded object-cover flex-shrink-0"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">
                                        {suggestion.name}
                                    </div>
                                    <div className="text-xs text-gray-500 capitalize">
                                        {suggestion.type.slice(0, -1)} {/* Remove 's' from plural */}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="px-3 py-2 text-gray-500 text-sm">
                            No se encontraron resultados para "{mentionState.query}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
