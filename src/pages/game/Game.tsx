import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Game as GameType } from "../../interfaces/Game.ts";
import gameService from "../../services/gameService.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import ReviewList from "../../components/ReviewList.tsx";
// import "../../css/Game.css";
import GameNotesSection from "../../components/GameNotesSection.tsx";
import GameRating from "../../components/GameRating.tsx";
import UserRatingDisplay from "../../components/UserRatingDisplay.tsx";
import ratingService, { RatingSummaryDto } from "../../services/ratingService.ts";

const Game: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [game, setGame] = useState<GameType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>("reviews");
    const [summary, setSummary] = useState<RatingSummaryDto | null>(null);

    //const [userRating, setUserRating] = useState<number>(0);

    // Use the auth context instead of direct auth service calls
    const { isAuthenticated, loading: authLoading } = useAuth();

    useEffect(() => {
        if (id) loadGame();
    }, [id]);

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
    }, [id]);


    const loadGame = async () => {
        try {
            setLoading(true);
            if (id) {
                const gameData = await gameService.getGameById(parseInt(id));
                //const avgRating = await gameService.getAverageRating(parseInt(id));
                setGame(gameData);
                //setAverageRating(avgRating);
                setError(null);
            }
        } catch (err) {
            console.error("Error loading game:", err);
            setError("Error loading game. Please try again later.");
        } finally {
            setLoading(false);
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
        <div className="min-h-screen pt-24 pb-12 flex justify-center items-start">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );
    if (error) return (
        <div className="min-h-screen pt-24 pb-12 flex justify-center items-start">
            <div className="text-destructive font-medium">{error}</div>
        </div>
    );
    if (!game) return (
        <div className="min-h-screen pt-24 pb-12 flex justify-center items-start">
            <div className="text-muted-foreground font-medium">Game not found</div>
        </div>
    );

    return (
        <div className="min-h-screen py-12 px-4 md:px-8 bg-background">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row gap-8 mb-8">
                    <div className="w-full md:w-[300px] h-[400px] flex-shrink-0 bg-muted rounded-xl overflow-hidden shadow-lg border border-border">
                        {game.imageUrl ? (
                            <img src={game.imageUrl} alt={game.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
                        )}
                    </div>
                    <div className="flex-grow flex flex-col">
                        <h1 className="text-4xl font-bold mb-4 text-foreground leading-tight">{game.name}</h1>

                        {/* Componente reutilizable de rating */}
                        <div className="mb-6">
                            <GameRating
                                gameId={id ? parseInt(id, 10) : 0}
                                isAuthenticated={isAuthenticated}
                            />
                        </div>

                        <div className="bg-card rounded-xl border border-border p-6 mb-6">
                            <h2 className="text-xl font-semibold mb-4 text-foreground">Description</h2>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{game.description}</p>
                        </div>

                        <div className="bg-secondary/30 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="flex flex-col">
                                <strong className="text-foreground">Genre:</strong>
                                <span className="text-muted-foreground">{game.genre}</span>
                            </div>
                            <div className="flex flex-col">
                                <strong className="text-foreground">Release date:</strong>
                                <span className="text-muted-foreground">{new Date(game.releaseDate).toLocaleDateString()}</span>
                            </div>
                            {game.awards && (
                                <div className="flex flex-col sm:col-span-2">
                                    <strong className="text-foreground">Awards:</strong>
                                    <span className="text-muted-foreground">{game.awards}</span>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
                <div className="bg-muted/10 rounded-xl p-4 mb-4 border border-border/50">
                    <UserRatingDisplay
                        gameId={parseInt(id!)}
                        isAuthenticated={isAuthenticated}
                        initialRating={summary?.mine ?? null}
                        onRated={async (newRating) => {
                            // Actualiza el summary manteniendo el rating del usuario
                            try {
                                if (id) {
                                    const res = await ratingService.getRatingSummary(parseInt(id));
                                    setSummary({
                                        ...res,
                                        mine: newRating // Asegura que siempre mantenga el rating que acaba de dar
                                    });
                                    await loadGame();
                                }
                            } catch (err) {
                                console.error("Error updating rating summary:", err);
                                // En caso de error, al menos mantiene el rating localmente
                                setSummary(prev => prev ? { ...prev, mine: newRating } : { average: 0, mine: newRating });
                            }
                        }}
                    />
                </div>

                <div className="mt-8 border-t border-border pt-6">
                    <div className="flex flex-wrap gap-2 mb-6 border-b border-border">
                        {[
                            { id: "reviews", label: "Reviews" },
                            { id: "guides", label: "Guides" },
                            { id: "news", label: "News" },
                            { id: "challenges", label: "Challenges" },
                            { id: "more", label: "More Info" },
                            { id: "notes", label: "Notes" }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${activeTab === tab.id
                                    ? "border-primary text-primary bg-primary/5"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
                                    }`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="py-4">
                        {activeTab === "reviews" && (
                            <div className="animate-in fade-in duration-300">
                                {id && <ReviewList gameId={parseInt(id)} />}
                            </div>
                        )}

                        {activeTab === "notes" && id && (
                            <div className="animate-in fade-in duration-300">
                                <GameNotesSection gameId={parseInt(id)} />
                            </div>
                        )}

                        {activeTab === "guides" && (
                            <div className="animate-in fade-in duration-300 text-center py-12 bg-card rounded-xl border border-border">
                                <p className="text-muted-foreground mb-4">No guides available for this game yet.</p>
                                {isAuthenticated && (
                                    <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors text-sm font-medium">Create a guide</button>
                                )}
                            </div>
                        )}

                        {activeTab === "news" && (
                            <div className="animate-in fade-in duration-300 text-center py-12 bg-card rounded-xl border border-border">
                                <p className="text-muted-foreground">No news available for this game.</p>
                            </div>
                        )}

                        {activeTab === "challenges" && (
                            <div className="animate-in fade-in duration-300 text-center py-12 bg-card rounded-xl border border-border">
                                <p className="text-muted-foreground">No challenges available for this game.</p>
                            </div>
                        )}

                        {activeTab === "more" && (
                            <div className="animate-in fade-in duration-300 text-center py-12 bg-card rounded-xl border border-border">
                                <p className="text-muted-foreground">No additional information available for this game.</p>
                            </div>
                        )}


                    </div>
                </div>
            </div>
        </div>
    );
};

export default Game;
