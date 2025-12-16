import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Game as GameType } from "../../interfaces/Game.ts";
import { Guide } from "../../interfaces/Guide.ts";
import gameService from "../../services/gameService.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import ReviewList from "../../components/ReviewList.tsx";
import GameNotesSection from "../../components/GameNotesSection.tsx";
import ratingService, { RatingSummaryDto } from "../../services/ratingService.ts";
import { Calendar, Star, Tag, FileText, User } from "lucide-react";
import RatingPopover from "../../components/game/RatingPopover";
import guideService from "../../services/guideService.ts";
import Button from "../../components/Button.tsx";

const Game: React.FC = () => {
    const { id, igdbId } = useParams<{ id: string; igdbId: string }>();
    const [game, setGame] = useState<GameType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>("reviews");
    const [summary, setSummary] = useState<RatingSummaryDto | null>(null);
    const [relatedGuides, setRelatedGuides] = useState<Guide[]>([]);
    const [guidesLoading, setGuidesLoading] = useState<boolean>(false);

    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadGame();
    }, [id, igdbId]);

    useEffect(() => {
        const fetchSummary = async () => {
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
    }, [id, game]);

    useEffect(() => {
        const fetchRelatedGuides = async () => {
            if (id) {
                setGuidesLoading(true);
                try {
                    const allGuides = await guideService.getPublishedGuides();
                    const filtered = allGuides.filter((guide: Guide) => guide.gameId === parseInt(id));
                    setRelatedGuides(filtered);
                } catch (err) {
                    console.error("Error fetching related guides:", err);
                } finally {
                    setGuidesLoading(false);
                }
            }
        };
        fetchRelatedGuides();
    }, [id]);

    const loadGame = async () => {
        try {
            setLoading(true);
            setError(null);
            if (id) {
                const gameData = await gameService.getGameById(parseInt(id));
                setGame(gameData);
            } else if (igdbId) {
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

    const ensureGameImported = async (): Promise<number | null> => {
        if (id) return parseInt(id);
        if (igdbId && game) {
            try {
                const importedGame = await gameService.importIGDBGame(parseInt(igdbId));
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

    const handleRate = async (newRating: number) => {
        if (!isAuthenticated) return;

        const localId = await ensureGameImported();
        if (localId) {
            try {
                await ratingService.setRating(localId, newRating);
                const res = await ratingService.getRatingSummary(localId);
                setSummary(res);
                await loadGame();
            } catch (err) {
                console.error('Error saving rating:', err);
                setSummary(prev => prev ? { ...prev, mine: newRating } : { average: 0, mine: newRating, count: 1 });
            }
        }
    };

    const handleClearRating = async () => {
        if (!isAuthenticated) return;

        const localId = await ensureGameImported();
        if (localId) {
            try {
                await ratingService.deleteRating(localId);
                const res = await ratingService.getRatingSummary(localId);
                setSummary(res);
                await loadGame();
            } catch (err) {
                console.error('Error clearing rating:', err);
            }
        }
    };

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
            {/* Immersive Background */}
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

                {/* Hero Section */}
                <div className="flex flex-col md:flex-row gap-8 lg:gap-12 mb-16">
                    {/* Left: Cover Art */}
                    <div className="w-full md:w-[320px] lg:w-[380px] flex-shrink-0 animate-fade-in-up">
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative group">
                            {game.coverImage ? (
                                <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            ) : (
                                <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">No image</div>
                            )}
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

                        {/* About Section */}
                        <div className="bg-card/50 backdrop-blur-md rounded-3xl border border-white/5 p-8 lg:p-10 max-w-3xl">
                            <h3 className="text-2xl font-bold text-foreground mb-6">About {game.title}</h3>
                            <div className="prose prose-invert prose-lg max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                                {game.description || "No description available."}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content & Tabs */}
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
                                <div className="animate-fade-in">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold">Community Guides</h3>
                                        {isAuthenticated && id && (
                                            <Link to={`/guides/create?gameId=${id}`}>
                                                <Button size="sm" className="gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    Write Guide
                                                </Button>
                                            </Link>
                                        )}
                                    </div>

                                    {guidesLoading ? (
                                        <div className="flex justify-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        </div>
                                    ) : relatedGuides.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {relatedGuides.map(guide => (
                                                <Link
                                                    key={guide.id}
                                                    to={`/guides/${guide.id}`}
                                                    className="group p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all"
                                                >
                                                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                                                        {guide.title}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                                        {guide.content.substring(0, 100)}...
                                                    </p>
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <User className="h-3 w-3" />
                                                            <span>{guide.authorUsername || 'Unknown'}</span>
                                                        </div>
                                                        <span>{new Date(guide.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                                            <p className="text-muted-foreground mb-4">No guides found for this game yet.</p>
                                            {isAuthenticated && id && (
                                                <Link to={`/guides/create?gameId=${id}`}>
                                                    <Button variant="outline" className="mt-4">
                                                        Be the first to write a guide
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
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
