import { useState, useCallback } from 'react';
import gameService from '../services/gameService';
import guideService from '../services/guideService';
import challengeService from '../services/challengeService';
import { listService } from '../services/listService';
import newsService from '../services/newsService';
import { MentionSuggestion } from '../components/MentionInput';

type MentionType = 'games' | 'guides' | 'challenges' | 'lists' | 'news';

export const useMentionSuggestions = () => {
    const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([]);
    const [loading, setLoading] = useState(false);

    const searchItems = useCallback(async (type: MentionType, query: string) => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }

        setLoading(true);

        try {
            let results: MentionSuggestion[] = [];

            switch (type) {
                case 'games':
                    const games = await gameService.searchGamesByName(query);
                    results = games.map(game => ({
                        id: game.id,
                        name: game.name,
                        type: 'games' as const,
                        thumbnailUrl: game.imageUrl
                    }));
                    break;

                case 'guides':
                    // Buscar en guías publicadas
                    const allGuides = await guideService.getPublishedGuides();
                    const filteredGuides = allGuides.filter(guide =>
                        guide.title.toLowerCase().includes(query.toLowerCase())
                    );
                    results = filteredGuides.map(guide => ({
                        id: guide.id,
                        name: guide.title,
                        type: 'guides' as const,
                        thumbnailUrl: guide.coverImageUrl || undefined
                    }));
                    break;

                case 'challenges':
                    const challenges = await challengeService.searchChallengesByTitle(query);
                    results = challenges.map(challenge => ({
                        id: challenge.id,
                        name: challenge.title,
                        type: 'challenges' as const,
                        thumbnailUrl: challenge.mediaUrl && challenge.mediaType === 'image'
                            ? challenge.mediaUrl
                            : undefined
                    }));
                    break;

                case 'lists':
                    // Buscar en todas las listas públicas
                    const allLists = await listService.getAllLists();
                    const filteredLists = allLists.filter(list =>
                        list.title.toLowerCase().includes(query.toLowerCase())
                    );
                    results = filteredLists.map(list => ({
                        id: list.id,
                        name: list.title,
                        type: 'lists' as const,
                        // Usar thumbnail del primer item si existe
                        thumbnailUrl: list.items[0]?.thumbnailUrl
                    }));
                    break;

                case 'news':
                    // Buscar en noticias
                    const newsResponse = await newsService.getAll();
                    const allNews = newsResponse.data;
                    const filteredNews = allNews.filter(news =>
                        news.title.toLowerCase().includes(query.toLowerCase()) && news.published
                    );
                    results = filteredNews.map(news => ({
                        id: news.id,
                        name: news.title,
                        type: 'news' as const,
                        thumbnailUrl: news.coverImage || undefined
                    }));
                    break;

                default:
                    results = [];
            }

            // Limitar resultados a 8 para no sobrecargar la UI
            setSuggestions(results.slice(0, 8));
        } catch (error) {
            console.error(`Error searching ${type}:`, error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const clearSuggestions = useCallback(() => {
        setSuggestions([]);
    }, []);

    return {
        suggestions,
        loading,
        searchItems,
        clearSuggestions
    };
};