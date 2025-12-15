import React from 'react';
import { parseMentions, ParsedMention } from '../utils/mentionParser';

interface MentionDisplayProps {
    text: string;
    className?: string;
    onMentionClick?: (mention: ParsedMention) => void;
}

interface MentionLinkProps {
    mention: ParsedMention;
    onClick?: (mention: ParsedMention) => void;
}

const MentionLink: React.FC<MentionLinkProps> = ({ mention, onClick }) => {
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();

        if (onClick) {
            onClick(mention);
        } else {
            // Navegación por defecto usando el ID
            const baseUrl = mention.type.endsWith('s') ? mention.type : mention.type + 's';
            const targetUrl = `/${baseUrl}/${mention.id}`;
            window.location.href = targetUrl;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'games':
                return 'bg-indigo-600/10 text-indigo-700 hover:bg-indigo-600/20';
            case 'guides':
                return 'bg-green-100 text-green-800 hover:bg-green-200';
            case 'challenges':
                return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
            case 'lists':
                return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
            case 'news':
                return 'bg-red-100 text-red-800 hover:bg-red-200';
            default:
                return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'games':
                return '🎮';
            case 'guides':
                return '📖';
            case 'challenges':
                return '🏆';
            case 'lists':
                return '📝';
            case 'news':
                return '📰';
            default:
                return '🔗';
        }
    };

    const getSingularType = (type: string) => {
        return type.endsWith('s') ? type.slice(0, -1) : type;
    };

    return (
        <span
            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${getTypeColor(mention.type)}`}
            onClick={handleClick}
            title={`${getSingularType(mention.type)}: ${mention.name}`}
        >
            <span className="mr-1">{getTypeIcon(mention.type)}</span>
            {mention.name}
        </span>
    );
};

/**
 * Componente para mostrar texto con menciones renderizadas como enlaces/chips
 */
export const MentionDisplay: React.FC<MentionDisplayProps> = ({
                                                                  text,
                                                                  className = "",
                                                                  onMentionClick
                                                              }) => {
    const parsed = parseMentions(text);

    if (parsed.mentions.length === 0) {
        return <span className={className}>{text}</span>;
    }

    // Construir el contenido con menciones renderizadas
    const renderContent = () => {
        const elements: React.ReactNode[] = [];
        let lastIndex = 0;

        parsed.mentions.forEach((mention, index) => {
            // Agregar texto antes de la mención
            if (mention.startIndex > lastIndex) {
                elements.push(
                    <span key={`text-${index}`}>
                        {text.slice(lastIndex, mention.startIndex)}
                    </span>
                );
            }

            // Agregar la mención como componente
            elements.push(
                <MentionLink
                    key={`mention-${index}`}
                    mention={mention}
                    onClick={onMentionClick}
                />
            );

            lastIndex = mention.endIndex;
        });

        // Agregar texto restante después de la última mención
        if (lastIndex < text.length) {
            elements.push(
                <span key="text-final">
                    {text.slice(lastIndex)}
                </span>
            );
        }

        return elements;
    };

    return (
        <span className={className}>
            {renderContent()}
        </span>
    );
};

/**
 * Hook para extraer menciones de un texto
 */
export const useMentions = (text: string) => {
    const parsed = parseMentions(text);

    return {
        mentions: parsed.mentions,
        hasMentions: parsed.mentions.length > 0,
        mentionCount: parsed.mentions.length,
        getMentionsByType: (type: string) =>
            parsed.mentions.filter(m => m.type === type)
    };
};
