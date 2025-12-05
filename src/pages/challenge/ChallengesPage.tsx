import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import challengeService, { Challenge } from '../../services/challengeService';
import Button from '../../components/Button';
import { Search, Plus, Trophy, Clock } from 'lucide-react';
import { useInfiniteScroll } from '../../hook/useInfiniteScroll';
import InfiniteScrollTrigger from '../../components/InfiniteScrollTrigger';

const ChallengesPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([]);

    // Función para cargar challenges paginados
    const fetchChallenges = useCallback(async (page: number, pageSize: number): Promise<Challenge[]> => {
        return await challengeService.getAllChallengesPaginated(page, pageSize);
    }, []);

    // Hook de infinite scroll
    const {
        items: challenges,
        loading,
        hasMore,
        error,
        loadMore
    } = useInfiniteScroll({
        fetchFunction: fetchChallenges,
        pageSize: 12
    });

    // Filtrar challenges localmente cuando cambia el término de búsqueda
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredChallenges(challenges);
        } else {
            const filtered = challenges.filter(challenge =>
                challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                challenge.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredChallenges(filtered);
        }
    }, [searchTerm, challenges]);

    const handleSearch = () => {
        // El filtrado se hace automáticamente con el useEffect de arriba
        // Esta función se puede usar si quieres hacer búsqueda en el backend
        console.log('Searching for:', searchTerm);
    };

    // Loading inicial
    if (loading && challenges.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F47E00]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Challenges
                </h1>
                {isAuthenticated && (
                    <Link to="/challenges/create">
                        <Button className="flex items-center gap-2">
                            <Plus size={20} /> Crear Challenge
                        </Button>
                    </Link>
                )}
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="flex gap-4 items-center">
                    <div className="flex-1 relative">
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Buscar challenges..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F47E00] focus:border-transparent"
                        />
                    </div>
                    <Button onClick={handleSearch}>
                        Buscar
                    </Button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Lista de challenges */}
            {filteredChallenges.length === 0 ? (
                <div className="text-center py-12">
                    <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No se encontraron challenges
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        {searchTerm
                            ? 'Intenta con otros filtros de búsqueda'
                            : 'Sé el primero en crear un challenge'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredChallenges.map((challenge) => (
                            <div
                                key={challenge.id}
                                className="bg-white dark:bg-[#313E3F] rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
                            >
                                {/* Media preview */}
                                {challenge.mediaUrl && (
                                    <div className="aspect-video rounded-t-lg overflow-hidden">
                                        {challenge.mediaType === 'image' ? (
                                            <img
                                                src={challenge.mediaUrl}
                                                alt={challenge.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : challenge.mediaType === 'video' ? (
                                            <video
                                                src={challenge.mediaUrl}
                                                className="w-full h-full object-cover"
                                                muted
                                                loop
                                                poster=""
                                            />
                                        ) : null}
                                    </div>
                                )}

                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {challenge.title}
                                        </h3>
                                    </div>

                                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                                        {challenge.description}
                                    </p>

                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <Clock size={16} />
                                            <span>{challenge.items.length} tareas</span>
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            por {challenge.creatorUsername}
                                        </div>
                                    </div>

                                    <Link to={`/challenges/${challenge.id}`}>
                                        <Button className="w-full">
                                            Ver Challenge
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Infinite Scroll Trigger - solo si no hay búsqueda activa */}
                    {searchTerm === '' && (
                        <InfiniteScrollTrigger
                            onIntersect={loadMore}
                            loading={loading}
                            hasMore={hasMore}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default ChallengesPage;
