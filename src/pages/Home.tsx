import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Home.css";

import { Game } from "../interfaces/Game";
import gameService from "../services/gameService";
import newsService from "../services/newsService";
import { News } from "../interfaces/News";
import api from "@/services/api";
import {Guide} from "@/interfaces/Guide.ts";

const Home: React.FC = () => {
    /* ---------- estado ---------- */
    const [popularGuides, setPopularGuides] = useState<Guide[]>([]);

    const [recentlyAdded, setRecentlyAdded] = useState<Game[]>([]);
    const [popularGames,  setPopularGames]  = useState<Game[]>([]);
    const [latestNews,    setLatestNews]    = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const navigate = useNavigate();
    const popularReviews = [1, 2, 3]; // (placeholder)

    /* ---------- efectos ---------- */
    /* guías publicadas */
    useEffect(() => {
        api.get("/guides/all/published")
            .then(res => setPopularGuides(res.data))
            .catch(err => console.error("Error fetching guides:", err));
    }, []);

    /* juegos */
    useEffect(() => { loadGames(); }, []);

    /* noticias recientes */
    useEffect(() => {
        newsService.getRecent(5)                       // ⬅️  NUEVO
            .then(res => setLatestNews(res.data))
            .catch(err => console.error("Error loading news:", err));
    }, []);

    /* ---------- helpers ---------- */
    const loadGames = async () => {
        try {
            setLoading(true);
            const allGames = await gameService.getAllGames();

            const recent  = [...allGames]
                .sort((a, b) => +new Date(b.releaseDate) - +new Date(a.releaseDate))
                .slice(0, 10);

            const popular = [...allGames]
                .sort((a, b) => (b.likes || 0) - (a.likes || 0))
                .slice(0, 8);

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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/games?search=${encodeURIComponent(searchTerm)}`);
        }
    };

    /* ---------- render ---------- */
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
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="search-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                             viewBox="0 0 16 16">
                            <path
                                d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398l3.85 3.85a1 1 0 0 0 1.415-1.415l-3.85-3.85zm-5.242 1.656a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
                        </svg>
                    </button>
                </form>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="content-grid">
                {/* -------- Latest News -------- */}
                <div className="content-section">
                    <div className="section-header">
                        <span className="section-title">Latest News</span>
                        <Link to="/news" className="view-more">More +</Link>
                    </div>

                    <div className="news-list">
                        {latestNews.length === 0 ? (
                            <div className="p-2 text-gray-500">No news yet.</div>
                        ) : (
                            latestNews.map(item => (
                                <div key={item.id} className="news-item">
                                    <Link to={`/news/${item.id}`} className="item-card">
                                        {item.coverImage && (
                                            <img
                                                src={item.coverImage}
                                                alt={item.title}
                                                className="h-24 w-full object-cover rounded mb-2"
                                            />
                                        )}
                                        <div className="item-title font-semibold">{item.title}</div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </div>
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* -------- Recently Added Games -------- */}
                <div className="content-section">
                    <div className="section-header">
                        <span className="section-title">Recently Added</span>
                        <Link to="/games" className="view-more">More +</Link>
                    </div>

                    <div className="content-items">
                        {loading ? (
                            <div className="loading">Loading...</div>
                        ) : recentlyAdded.length ? (
                            recentlyAdded.map(game => (
                                <Link to={`/games/${game.id}`} key={game.id} className="item-card">
                                    <div className="item-image">
                                        {game.imageUrl ? <img src={game.imageUrl} alt={game.name} /> : "Game"}
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

            {/* -------- Popular Games -------- */}
            <div className="content-section">
                <div className="section-header">
                    <span className="section-title">Popular Games</span>
                    <Link to="/games" className="view-more">More +</Link>
                </div>

                <div className="content-items">
                    {loading ? (
                        <div className="loading">Loading...</div>
                    ) : popularGames.length ? (
                        popularGames.map(game => (
                            <Link to={`/games/${game.id}`} key={game.id} className="item-card">
                                <div className="item-image">
                                    {game.imageUrl ? <img src={game.imageUrl} alt={game.name} /> : "Game"}
                                </div>
                                <div className="item-title">{game.name}</div>
                                <div className="item-meta"><span>❤️ {game.likes || 0}</span></div>
                            </Link>
                        ))
                    ) : (
                        <div>No games found</div>
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
