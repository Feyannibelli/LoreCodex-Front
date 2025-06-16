import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import challengeService, { Challenge } from '../../services/challengeService';
import Button from '../../components/Button';
import { Search, Plus, Trophy, Clock } from 'lucide-react';

const ChallengesPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const data = await challengeService.getAllChallenges();
                setChallenges(data);
                setFilteredChallenges(data);
            } catch (error) {
                console.error('Error fetching challenges:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChallenges();
    }, []);

    useEffect(() => {
        let filtered = challenges;

        if (searchTerm) {
            filtered = filtered.filter(challenge =>
                challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                challenge.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (difficultyFilter !== null) {
            filtered = filtered.filter(challenge => challenge.difficulty === difficultyFilter);
        }

        setFilteredChallenges(filtered);
    }, [searchTerm, difficultyFilter, challenges]);

    const handleSearch = async () => {
        if (searchTerm.trim()) {
            try {
                const results = await challengeService.searchChallengesByTitle(searchTerm);
                setFilteredChallenges(results);
            } catch (error) {
                console.error('Error searching challenges:', error);
            }
        } else {
            setFilteredChallenges(challenges);
        }
    };

    const getDifficultyLabel = (difficulty?: number) => {
        const labels = {
            1: 'Super Fácil',
            2: 'Fácil',
            3: 'Normal',
            4: 'Difícil',
            5: 'Super Difícil',
            6: 'Extremo'
        };
        return difficulty ? labels[difficulty as keyof typeof labels] : 'Sin especificar';
    };

    const getDifficultyColor = (difficulty?: number) => {
        const colors = {
            1: 'bg-green-100 text-green-800',
            2: 'bg-blue-100 text-blue-800',
            3: 'bg-yellow-100 text-yellow-800',
            4: 'bg-orange-100 text-orange-800',
            5: 'bg-red-100 text-red-800',
            6: 'bg-purple-100 text-purple-800'
        };
        return difficulty ? colors[difficulty as keyof typeof colors] : 'bg-gray-100 text-gray-800';
    };

    if (loading) {
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

    {/* Filtros y búsqueda */}
    <div className="mb-6 space-y-4">
    <div className="flex gap-4 items-center">
    <div className="flex-1 relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
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

    {/* Filtro de dificultad */}
    <div className="flex gap-2 flex-wrap">
    <button
        onClick={() => setDifficultyFilter(null)}
    className={`px-3 py-1 rounded-full text-sm ${
        difficultyFilter === null
            ? 'bg-[#F47E00] text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }`}
>
    Todos
    </button>
    {Array.from({ length: 6 }, (_, i) => i + 1).map((level) => (
        <button
            key={level}
        onClick={() => setDifficultyFilter(level)}
        className={`px-3 py-1 rounded-full text-sm ${
            difficultyFilter === level
                ? 'bg-[#F47E00] text-white'
                : `${getDifficultyColor(level)} hover:opacity-80`
        }`}
    >
        {getDifficultyLabel(level)}
        </button>
    ))}
    </div>
    </div>

    {/* Lista de challenges */}
    {filteredChallenges.length === 0 ? (
        <div className="text-center py-12">
        <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No se encontraron challenges
    </h3>
    <p className="text-gray-500 dark:text-gray-400">
    {searchTerm || difficultyFilter
        ? 'Intenta con otros filtros de búsqueda'
        : 'Sé el primero en crear un challenge'}
        </p>
        </div>
    ) : (
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
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
        {getDifficultyLabel(challenge.difficulty)}
        </span>
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
    )}
    </div>
);
};

export default ChallengesPage;