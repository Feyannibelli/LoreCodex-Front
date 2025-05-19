import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Home.css";
import { Game } from "../interfaces/Game";
import { Challenge } from "../interfaces/Challenge";
import gameService from "../services/gameService";
import challengeService from "../services/challengeService";
import api from "@/services/api.ts";
import ChallengeCard from "../components/ChallengeCard";

const Home: React.FC = () => {
    const [popularGuides, setPopularGuides] = useState<any[]>([]);
    const [popularChallenges, setPopularChallenges] = useState<Challenge[]>([]);
    const [recentlyAdded, setRecentlyAdded] = useState<Game[]>([]);
    const [popularGames, setPopularGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [challengesLoading, setChallengesLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const navigate = useNavigate();

    const latestNews = [1, 2, 3, 4];
    const popularReviews = [1, 2, 3];

    useEffect(() => {
        api.get("/guides/published")
            .then(response => {
                setPopularGuides(response.data);
            })
            .catch(error => {
                console.error("Error fetching popular guides:", error);
            });
    }, []);

    useEffect(() => {
        loadGames();
        loadChallenges();
    }, []);

    const loadGames = async () => {
        try {
            setLoading(true);
            const allGames = await gameService.getAllGames();

            // Sort by release date (newest first) for recently added
            const recent = [...allGames].sort((a, b) =>
                new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
            ).slice(0, 10);

            // Sort by likes (highest first) for popular games
            const popular = [...allGames].sort((a, b) =>
                (b.likes || 0) - (a.likes || 0)
            ).slice(0, 8);

            setRecentlyAdded(recent);
            setPopularGames(popular);
            setError(null);
        } catch (err) {
            console.error("Error loading games:", err);
            setError("Error loading games. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const loadChallenges = async () => {
        try {
            setChallengesLoading(true);
            // Get all challenges and sort by participation count to get most popular
            const allChallenges = await challengeService.getAllChallenges();
            const popular = [...allChallenges].sort((a, b) =>
                (b.participantsCount || 0) - (a.participantsCount || 0)
            ).slice(0, 4); // Get top 4 challenges

            setPopularChallenges(popular);
        } catch (err) {
            console.error("Error loading challenges:", err);
        } finally {
            setChallengesLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/games?search=${encodeURIComponent(searchTerm)}`);
        }
    };

    return (
        <div className="home-container">
            {/* Search bar */}
            <div className="search-container">
                <form className="search-bar" onSubmit={handleSearch}>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="search-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                        </svg>
                    </button>
                </form>
            </div>

            {/* General content */}
            {error && <div className="error-message">{error}</div>}

            <div className="content-grid">
                {/* Left column - news */}
                <div className="content-section">
                    <div className="section-header">
                        <span className="section-title">Latest News</span>
                        <a href="#" className="view-more">More +</a>
                    </div>
                    <div className="news-list">
                        {latestNews.map((_, index) => (
                            <div key={index} className="news-item">
                                <a href="#" className="item-card">
                                    <div className="item-title">News Title {index + 1}</div>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right column - recently added games */}
                <div className="content-section">
                    <div className="section-header">
                        <span className="section-title">Recently Added</span>
                        <Link to="/games" className="view-more">More +</Link>
                    </div>
                    <div className="content-items">
                        {loading ? (
                            <div className="loading">Loading...</div>
                        ) : recentlyAdded.length > 0 ? (
                            recentlyAdded.map((game) => (
                                <Link to={`/games/${game.id}`} key={game.id} className="item-card">
                                    <div className="item-image">
                                        {game.imageUrl ? (
                                            <img src={game.imageUrl} alt={game.name} />
                                        ) : (
                                            "Game"
                                        )}
                                    </div>
                                    <div className="item-title">{game.name}</div>
                                    <div className="item-meta">{new Date(game.releaseDate).getFullYear()}</div>
                                </Link>
                            ))
                        ) : (
                            <div>No games found</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Popular Games */}
            <div className="content-section">
                <div className="section-header">
                    <span className="section-title">Popular Games</span>
                    <Link to="/games" className="view-more">More +</Link>
                </div>
                <div className="content-items">
                    {loading ? (
                        <div className="loading">Loading...</div>
                    ) : popularGames.length > 0 ? (
                        popularGames.map((game) => (
                            <Link to={`/games/${game.id}`} key={game.id} className="item-card">
                                <div className="item-image">
                                    {game.imageUrl ? (
                                        <img src={game.imageUrl} alt={game.name} />
                                    ) : (
                                        "Game"
                                    )}
                                </div>
                                <div className="item-title">{game.name}</div>
                                <div className="item-meta">
                                    <span>❤️ {game.likes || 0}</span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div>No games found</div>
                    )}
                </div>
            </div>

            {/* Popular Challenges - NEW SECTION */}
            <div className="content-section">
                <div className="section-header">
                    <span className="section-title">Popular Challenges</span>
                    <Link to="/challenges" className="view-more">More +</Link>
                </div>
                <div className="content-items challenges-grid">
                    {challengesLoading ? (
                        <div className="loading">Loading...</div>
                    ) : popularChallenges.length > 0 ? (
                        popularChallenges.map((challenge) => (
                            <ChallengeCard key={challenge.id} challenge={challenge} />
                        ))
                    ) : (
                        <div>No challenges found</div>
                    )}
                </div>
            </div>

            {/* Popular reviews */}
            <div className="content-section">
                <div className="section-header">
                    <span className="section-title">Popular Reviews</span>
                    <a href="#" className="view-more">More +</a>
                </div>
                <div className="reviews-grid">
                    {popularReviews.map((_, index) => (
                        <div key={index} className="review-card">
                            <div className="review-header">
                                <span className="item-title">Name</span>
                                <div className="rating">User · Game</div>
                            </div>
                            <div className="review-content">
                                Text
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Popular guides */}
            <div className="content-section">
                <div className="section-header">
                    <span className="section-title">Recently Published Guides</span>
                    <a href="/guides/published" className="view-more">More +</a>
                </div>
                <div className="reviews-grid">
                    {popularGuides.map((guide) => (
                        <div key={guide.id} className="review-card">
                            <div className="review-header">
                                <Link to={`/guides/${guide.id}`} className="item-title">
                                    {guide.title}
                                </Link>
                                <div className="rating">User · Game · Guide Name</div>
                            </div>
                            <div className="review-content">
                                Text
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;