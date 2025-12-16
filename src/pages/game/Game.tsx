import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Game as GameType } from "../../interfaces/Game.ts";
import gameService from "../../services/gameService.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import ReviewList from "../../components/ReviewList.tsx";
// import "../../css/Game.css";
import GameNotesSection from "../../components/GameNotesSection.tsx";
import ratingService, { RatingSummaryDto } from "../../services/ratingService.ts";
import { Calendar, Star, Tag } from "lucide-react";
import RatingPopover from "../../components/game/RatingPopover";

const Game: React.FC = () => {
    const { id, igdbId } = useParams<{ id: string; igdbId: string }>();
    const [game, setGame] = useState<GameType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>("reviews");
    const [summary, setSummary] = useState<RatingSummaryDto | null>(null);

    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadGame();
    }, [id, igdbId]);

    useEffect(() => {
        const fetchSummary = async () => {
            // Only fetch summary if we have a local ID
            if (id) {
                try {
                    const res = await ratingService.getRatingSummary(parseInt(id));
                    setSummary(res);
                } catch (err) {
                    console.error("Error fetching rating summary:", err);
                }
            }
        };
        fetchSummary();
    }, [id, game]); // add game to deps to retry if needed? Actually id is enough logic-wise.


    const loadGame = async () => {
        try {
            setLoading(true);
            setError(null);
            if (id) {
                // Load Local Game
                const gameData = await gameService.getGameById(parseInt(id));
                setGame(gameData);
            } else if (igdbId) {
                // Load IGDB Game
                const gameData = await gameService.getIGDBGameDetail(parseInt(igdbId));
                setGame(gameData);
            }
        } catch (err) {
            console.error("Error loading game:", err);
            setError("Error loading game. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Helper to ensure game is imported before action
    const ensureGameImported = async (): Promise<number | null> => {
        if (id) return parseInt(id); // Already local
        if (igdbId && game) {
            try {
                // Import!
                const importedGame = await gameService.importIGDBGame(parseInt(igdbId));
                // Update local state and navigate to local route?
                // User spec 4 says "Invocalo cuando un usuario interactúe... responde con GameDetailResponse".
                // We should probably switch URL to local ID to avoid re-importing.
                // But for seamlessness, can we just update state?
                // Better to navigate so URL reflects reality (canonical ID).
                navigate(`/games/${importedGame.id}`, { replace: true });
                return importedGame.id;
            } catch (err) {
                console.error("Import failed:", err);
                setError("Failed to import game for interaction.");
                return null;
            }
        }
        return null;
    };

    // Update Rating Handler to use ensureGameImported
    const handleRate = async (newRating: number) => {
        if (!isAuthenticated) return;

        const localId = await ensureGameImported();
        if (localId) {
            try {
                // Save the rating
                await ratingService.setRating(localId, newRating);

                // Refresh summary
                const res = await ratingService.getRatingSummary(localId);
                setSummary(res);

                // Re-load game to get updated average
                await loadGame();
            } catch (err) {
                console.error('Error saving rating:', err);
                // Optimistically update
                setSummary(prev => prev ? { ...prev, mine: newRating } : { average: 0, mine: newRating, count: 1 });
            }
        }
    };

    // Clear Rating Handler
    const handleClearRating = async () => {
        if (!isAuthenticated) return;

        const localId = await ensureGameImported();
        if (localId) {
            try {
                // Delete the rating
                await ratingService.deleteRating(localId);

                // Refresh summary
                const res = await ratingService.getRatingSummary(localId);
                setSummary(res);

                // Re-load game to get updated average
                await loadGame();
            } catch (err) {
                console.error('Error clearing rating:', err);
            }
        }
    };


    /*
    const handleLike = async () => {
        if (!isAuthenticated) {
            setError("You must be logged in to like");
            return;
        }

        try {
            if (id) {
                const updatedGame = await gameService.likeGame(parseInt(id));
                setGame(updatedGame);
                setLikeSuccess(true);
                setTimeout(() => setLikeSuccess(false), 3000);
            }
        } catch (err) {
            console.error("Error liking game:", err);
            setError("Error liking the game. Please try again later.");
        }
    };

    const handleRatingChange = (value: number) => {
        setUserRating(value);
    };

    const fetchAverageRating = async () => {
        if (id) {
            try {
                const rating = await gameService.getAverageRating(parseInt(id));
                setAverageRating(rating);
            } catch (err) {
                console.error("Error fetching average rating:", err);
            }
        }
    };

    const submitRating = async () => {
        if (!isAuthenticated) {
            setError("You must be logged in to rate");
            return;
        }

        try {
            if (id && userRating > 0) {
                const updatedGame = await gameService.rateGame(parseInt(id), userRating);
                setGame(updatedGame);
                await fetchAverageRating(); //actualizar el promedio
                setRatingSuccess(true);
                setTimeout(() => setRatingSuccess(false), 3000);
            }
        } catch (err) {
            console.error("Error rating game:", err);
            setError("Error rating the game. Please try again later.");
        }
    };
    */


    // Show loading indicator while checking auth and loading game
    if (authLoading || loading) return (
        <div className="min-h-screen pt-24 pb-12 flex justify-center items-start bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );
    if (error) return (
        <div className="min-h-screen pt-24 pb-12 flex justify-center items-start bg-background">
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-destructive font-medium">{error}</div>
        </div>
    );
    if (!game) return (
        <div className="min-h-screen pt-24 pb-12 flex justify-center items-start bg-background">
            <div className="text-muted-foreground font-medium">Game not found</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background relative selection:bg-primary/30">
            {/* 1. Immersive Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                {game.coverImage && (
                    <img
                        src={game.coverImage}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover blur-[60px] opacity-20 scale-110"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/60"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-black/20 to-transparent"></div>
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20 animate-fade-in">

                {/* 2. Hero Section */}
                <div className="flex flex-col md:flex-row gap-8 lg:gap-12 mb-16">
                    {/* Left: Cover Art */}
                    <div className="w-full md:w-[320px] lg:w-[380px] flex-shrink-0 animate-fade-in-up">
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative group">
                            {game.coverImage ? (
                                <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            ) : (
                                <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">No image</div>
                            )}
                            {/* Reflection effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>


                    </div>

                    {/* Right: Metadata & Info */}
                    <div className="flex-grow flex flex-col justify-end animate-fade-in-up delay-100">
                        {/* Tags / Genres */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {game.genres?.map((g) => (
                                <span key={g} className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                    {g}
                                </span>
                            ))}
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight drop-shadow-lg">
                            {game.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8 bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/5 w-fit">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{game.releaseDate ? new Date(game.releaseDate).getFullYear() : 'TBA'}</span>
                            </div>
                            {summary && summary.average > 0 && (
                                <>
                                    <div className="w-px h-4 bg-white/10"></div>
                                    <div className="flex items-center gap-2">
                                        <Star className="h-4 w-4 text-primary fill-primary" />
                                        <span className="text-foreground font-bold">{summary.average.toFixed(1)}</span>
                                        <span>Rating</span>
                                    </div>
                                </>
                            )}
                            {isAuthenticated && id && (
                                <>
                                    <div className="w-px h-4 bg-white/10"></div>
                                    <RatingPopover
                                        currentRating={summary?.mine || 0}
                                        onSave={handleRate}
                                        onClear={handleClearRating}
                                    />
                                </>
                            )}
                        </div>

                        {/* About Section - Moved here */}
                        <div className="bg-card/50 backdrop-blur-md rounded-3xl border border-white/5 p-8 lg:p-10 max-w-3xl">
                            <h3 className="text-2xl font-bold text-foreground mb-6">About {game.title}</h3>
                            <div className="prose prose-invert prose-lg max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                                {game.description || "No description available."}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Main Content & Tabs */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Sidebar: Details */}
                    <div className="lg:col-span-4 space-y-8 animate-fade-in-up delay-200">
                        <div className="bg-card/50 backdrop-blur-md rounded-3xl border border-white/5 p-8">
                            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                                <Tag className="h-5 w-5 text-primary" />
                                Game Details
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Publishers / Developers</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {game.developersAndPublishers && game.developersAndPublishers.length > 0 ? (
                                            game.developersAndPublishers.map((dev, i) => (
                                                <span key={i} className="text-sm text-foreground bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                                                    {dev}
                                                </span>
                                            ))
                                        ) : <span className="text-sm text-muted-foreground">Unknown</span>}
                                    </div>
                                </div>
                                <div className="h-px bg-white/5"></div>
                                <div>
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Release Date</h4>
                                    <p className="text-foreground text-sm font-medium">
                                        {game.releaseDate ? new Date(game.releaseDate).toLocaleDateString('en-US', { dateStyle: 'long' }) : 'TBA'}
                                    </p>
                                </div>
                                <div className="h-px bg-white/5"></div>
                                <div>
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Tags</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {game.tags?.map((t) => (
                                            <span key={t} className="text-xs text-muted-foreground bg-black/20 px-2 py-1 rounded-md border border-white/5">
                                                #{t}
                                            </span>
                                        )) || <span className="text-xs text-muted-foreground">No tags</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-8 animate-fade-in-up delay-300 space-y-8">
                        {/* Tab Navigation */}
                        <div className="flex flex-wrap items-center gap-2 bg-card/30 p-1.5 rounded-2xl border border-white/5 backdrop-blur-sm w-fit">
                            {[
                                { id: "reviews", label: "Reviews" },
                                { id: "guides", label: "Guides" },
                                { id: "notes", label: "Notes" }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 translate-y-[-1px]"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="bg-card/50 backdrop-blur-md rounded-3xl border border-white/5 p-8 lg:p-10 min-h-[400px]">

                            {activeTab === "reviews" && (
                                <div className="animate-fade-in">
                                    {id ? <ReviewList gameId={parseInt(id)} /> : (
                                        <div className="text-center py-12">
                                            <p className="text-muted-foreground mb-4">Reviews are available for games in the library.</p>
                                            <p className="text-sm opacity-60">Rate this game to add it to the library.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "guides" && (
                                <div className="animate-fade-in text-center py-12">
                                    <h3 className="text-lg font-semibold mb-2">Community Guides</h3>
                                    <p className="text-muted-foreground mb-6">Master this game with community-created guides.</p>
                                    <div className="bg-secondary/20 rounded-2xl p-8 border border-white/5 border-dashed">
                                        <p className="text-sm text-muted-foreground">No guides found for this game yet.</p>
                                    </div>
                                    {isAuthenticated && id && (
                                        <button className="mt-6 bg-secondary hover:bg-secondary/80 text-foreground px-6 py-2.5 rounded-xl font-medium transition-colors border border-white/10">
                                            Write a Guide
                                        </button>
                                    )}
                                </div>
                            )}

                            {activeTab === "notes" && (
                                <div className="animate-fade-in">
                                    {id ? <GameNotesSection gameId={parseInt(id)} /> : (
                                        <div className="text-center py-12">
                                            <p className="text-muted-foreground">Personal notes are available for library games.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Game;
