export interface ParsedMention {
    type: 'games' | 'guides' | 'challenges' | 'lists' | 'news';
    name: string;
    fullMatch: string;
    startIndex: number;
    endIndex: number;
}

export interface ParsedContent {
    text: string;
    mentions: ParsedMention[];
}

const MENTION_REGEX = /\/(games|guides|challenges|lists|news)\/([^/\s]+)/g;

/**
 * Parsea un texto y extrae todas las menciones encontradas
 */
export const parseMentions = (text: string): ParsedContent => {
    const mentions: ParsedMention[] = [];
    let match;

    // Reset regex
    MENTION_REGEX.lastIndex = 0;

    while ((match = MENTION_REGEX.exec(text)) !== null) {
        mentions.push({
            type: match[1] as ParsedMention['type'],
            name: decodeURIComponent(match[2]), // Decodificar en caso de caracteres especiales
            fullMatch: match[0],
            startIndex: match.index,
            endIndex: match.index + match[0].length
        });
    }

    return {
        text,
        mentions
    };
};

/**
 * Reemplaza las menciones en el texto con componentes JSX o HTML
 */
export const renderMentionsAsLinks = (text: string): string => {
    return text.replace(MENTION_REGEX, (match, type, name) => {
        const decodedName = decodeURIComponent(name);
        const typeLabel = type.slice(0, -1); // Remove 's' from plural

        // Retornar como HTML link - puedes customizar esto según tu routing
        return `<a href="/${type}/${encodeURIComponent(decodedName)}" class="mention-link" data-type="${type}" data-name="${decodedName}" title="${typeLabel}: ${decodedName}">${match}</a>`;
    });
};

/**
 * Convierte menciones a IDs para enviar al backend
 * Necesitarás implementar la lógica de búsqueda de IDs según tu caso de uso
 */
export const convertMentionsToIds = async (
    text: string,
    searchFunction: (type: string, name: string) => Promise<number | null>
): Promise<{ text: string; mentionedIds: { type: string; id: number; name: string }[] }> => {
    const parsed = parseMentions(text);
    const mentionedIds: { type: string; id: number; name: string }[] = [];
    let processedText = text;

    for (const mention of parsed.mentions) {
        try {
            const id = await searchFunction(mention.type, mention.name);
            if (id !== null) {
                mentionedIds.push({
                    type: mention.type,
                    id,
                    name: mention.name
                });
            }
        } catch (error) {
            console.warn(`Failed to resolve mention: ${mention.fullMatch}`, error);
        }
    }

    return {
        text: processedText,
        mentionedIds
    };
};

/**
 * Valida si una mención existe realmente
 */
export const validateMentions = async (
    text: string,
    validationFunction: (type: string, name: string) => Promise<boolean>
): Promise<{ isValid: boolean; invalidMentions: ParsedMention[] }> => {
    const parsed = parseMentions(text);
    const invalidMentions: ParsedMention[] = [];

    for (const mention of parsed.mentions) {
        try {
            const isValid = await validationFunction(mention.type, mention.name);
            if (!isValid) {
                invalidMentions.push(mention);
            }
        } catch (error) {
            invalidMentions.push(mention);
        }
    }

    return {
        isValid: invalidMentions.length === 0,
        invalidMentions
    };
};

/**
 * Escapa caracteres especiales en nombres para usar en URLs
 */
export const escapeMentionName = (name: string): string => {
    return encodeURIComponent(name.replace(/\s+/g, '-'));
};

/**
 * Desescapa nombres de menciones desde URLs
 */
export const unescapeMentionName = (escapedName: string): string => {
    return decodeURIComponent(escapedName).replace(/-/g, ' ');
};