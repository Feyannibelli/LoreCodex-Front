export interface ParsedMention {
    type: 'games' | 'guides' | 'challenges' | 'lists' | 'news';
    name: string;
    id: number;
    fullMatch: string;
    startIndex: number;
    endIndex: number;
}

export interface ParsedContent {
    text: string;
    mentions: ParsedMention[];
}

// Regex actualizado para capturar el formato /type/id|name
const MENTION_REGEX = /\/(games|guides|challenges|lists|news)\/(\d+)\|([^/\n\r]+)/g;

/**
 * Parsea un texto y extrae todas las menciones encontradas con formato /type/id|name
 */
export const parseMentions = (text: string): ParsedContent => {
    const mentions: ParsedMention[] = [];
    let match;

    // Reset regex
    MENTION_REGEX.lastIndex = 0;

    while ((match = MENTION_REGEX.exec(text)) !== null) {
        mentions.push({
            type: match[1] as ParsedMention['type'],
            id: parseInt(match[2], 10),
            name: match[3].trim(),
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
    return text.replace(MENTION_REGEX, (_, type, id, name) => {
        const typeLabel = type.slice(0, -1); // Remove 's' from plural
        const baseUrl = type;

        // Retornar como HTML link usando el ID
        return `<a href="/${baseUrl}/${id}" class="mention-link" data-type="${type}" data-id="${id}" data-name="${name}" title="${typeLabel}: ${name}">/ν${type}/${name}</a>`;
    });
};

/**
 * Convierte menciones antiguas (solo con nombre) al nuevo formato con ID
 * Esta función es útil para migrar datos existentes
 */
export const migrateMentionsToNewFormat = async (
    text: string,
    searchFunction: (type: string, name: string) => Promise<{ id: number; name: string } | null>
): Promise<string> => {
    // Regex para el formato antiguo /type/name
    const OLD_MENTION_REGEX = /\/(games|guides|challenges|lists|news)\/([^/\s\n\r]+)/g;

    let processedText = text;
    const matches = Array.from(text.matchAll(OLD_MENTION_REGEX));

    // Procesar de atrás hacia adelante para mantener las posiciones correctas
    for (let i = matches.length - 1; i >= 0; i--) {
        const match = matches[i];
        const [fullMatch, type, encodedName] = match;
        const name = decodeURIComponent(encodedName);

        try {
            const result = await searchFunction(type, name);
            if (result) {
                const newMention = `/${type}/${result.id}|${result.name}`;
                processedText = processedText.substring(0, match.index!) +
                    newMention +
                    processedText.substring(match.index! + fullMatch.length);
            }
        } catch (error) {
            console.warn(`Failed to migrate mention: ${fullMatch}`, error);
        }
    }

    return processedText;
};

/**
 * Extrae información de menciones para el backend
 */
export const extractMentionData = (text: string): {
    cleanText: string;
    mentionedItems: { type: string; id: number; name: string }[]
} => {
    const parsed = parseMentions(text);

    const mentionedItems = parsed.mentions.map(mention => ({
        type: mention.type,
        id: mention.id,
        name: mention.name
    }));

    return {
        cleanText: text, // Mantienes el texto original con las menciones
        mentionedItems
    };
};

/**
 * Valida si las menciones tienen el formato correcto y existen
 */
export const validateMentions = async (
    text: string,
    validationFunction: (type: string, id: number) => Promise<boolean>
): Promise<{ isValid: boolean; invalidMentions: ParsedMention[] }> => {
    const parsed = parseMentions(text);
    const invalidMentions: ParsedMention[] = [];

    for (const mention of parsed.mentions) {
        try {
            const isValid = await validationFunction(mention.type, mention.id);
            if (!isValid) {
                invalidMentions.push(mention);
            }
        } catch (error) {
            invalidMentions.push(mention);
            console.warn(`Failed to validate mention: ${mention.fullMatch}`, error);
        }
    }

    return {
        isValid: invalidMentions.length === 0,
        invalidMentions
    };
};

/**
 * Crea una mención con el formato correcto
 */
export const createMention = (type: string, id: number, name: string): string => {
    return `/${type}/${id}|${name}`;
};

/**
 * Extrae solo los nombres visibles de las menciones para mostrar al usuario
 */
export const getVisibleMentionText = (text: string): string => {
    return text.replace(MENTION_REGEX, (_match, type, _id, name) => {
        return `/${type}/${name}`;
    });
};

/**
 * Busca menciones por tipo específico
 */
export const getMentionsByType = (text: string, type: string): ParsedMention[] => {
    const parsed = parseMentions(text);
    return parsed.mentions.filter(mention => mention.type === type);
};

/**
 * Reemplaza una mención específica en el texto
 */
export const replaceMention = (
    text: string,
    oldMention: ParsedMention,
    newId: number,
    newName: string
): string => {
    const newMention = createMention(oldMention.type, newId, newName);
    return text.substring(0, oldMention.startIndex) +
        newMention +
        text.substring(oldMention.endIndex);
};