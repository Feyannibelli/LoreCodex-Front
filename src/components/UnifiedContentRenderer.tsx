import React from 'react';
import {useNavigate} from 'react-router-dom';
import {ParsedMention, parseMentions} from '../utils/mentionParser';

interface UnifiedContentRendererProps {
    content: string;
    className?: string;
}

/**
 * Componente unificado que renderiza contenido con:
 * - Markdown (headers, bold, italic, code, links, lists, blockquotes)
 * - Menciones (/games/id|name, /guides/id|name, etc.)
 *
 * Detecta automáticamente qué sintaxis usar según el contenido.
 */
const UnifiedContentRenderer: React.FC<UnifiedContentRendererProps> = ({
                                                                           content,
                                                                           className = "prose prose-slate dark:prose-invert max-w-none"
                                                                       }) => {
    const navigate = useNavigate();

    const { mentions } = parseMentions(content);

    const handleMentionClick = (mention: ParsedMention) => {
        const baseUrl = mention.type.endsWith('s') ? mention.type : mention.type + 's';
        navigate(`/${baseUrl}/${mention.id}`);
    };

    const parseUnifiedContent = (text: string): string => {
        let html = text;

        const mentionPlaceholders: { [key: string]: string } = {};
        mentions.forEach((mention, index) => {
            const placeholder = `__MENTION_${index}__`;
            mentionPlaceholders[placeholder] = `<span 
                class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors bg-orange-500/10 text-orange-600 hover:bg-orange-500/20" 
                data-mention-type="${mention.type}" 
                data-mention-id="${mention.id}"
                title="${mention.type.slice(0, -1)}: ${mention.name}"
            >
                ${getMentionIcon(mention.type)} ${mention.name}
            </span>`;
            html = html.replace(mention.fullMatch, placeholder);
        });
        
        // Headers (deben procesarse primero)
        html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2 mt-4">$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3 mt-4">$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 mt-4">$1</h1>');

        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');

        // Italic
        html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

        // Inline code
        html = html.replace(/`([^`]*)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono">$1</code>');

        // Links
        html = html.replace(/\[([^\]]*)]\(([^)]*)\)/g, '<a href="$2" class="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

        // Unordered lists
        html = html.replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc">$1</li>');
        html = html.replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>');

        // Ordered lists
        html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>');

        // Blockquotes
        html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 dark:text-gray-400 my-2">$1</blockquote>');

        // Line breaks
        html = html.replace(/\n\n/g, '<br/><br/>');
        html = html.replace(/\n/g, '<br/>');

        Object.keys(mentionPlaceholders).forEach(placeholder => {
            html = html.replace(placeholder, mentionPlaceholders[placeholder]);
        });

        return html;
    };

    const getMentionIcon = (type: string): string => {
        switch (type) {
            case 'games': return '🎮';
            case 'guides': return '📖';
            case 'challenges': return '🏆';
            case 'lists': return '📝';
            case 'news': return '📰';
            default: return '🔗';
        }
    };

    React.useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const mentionElement = target.closest('[data-mention-type]') as HTMLElement;

            if (mentionElement) {
                e.preventDefault();
                const type = mentionElement.dataset.mentionType;
                const id = mentionElement.dataset.mentionId;

                if (type && id) {
                    const mention: ParsedMention = {
                        type: type as never,
                        id: parseInt(id),
                        name: mentionElement.textContent?.trim() || '',
                        fullMatch: '',
                        startIndex: 0,
                        endIndex: 0
                    };
                    handleMentionClick(mention);
                }
            }
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [handleMentionClick]);

    return (
        <div
            className={className}
            dangerouslySetInnerHTML={{
                __html: parseUnifiedContent(content)
            }}
        />
    );
};

export default UnifiedContentRenderer;
