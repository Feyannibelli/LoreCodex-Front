import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Home.css";
import { Search } from "lucide-react";

import { Game } from "../interfaces/Game";
import gameService from "../services/gameService";
import newsService from "../services/newsService";
import { News } from "../interfaces/News";
import { Guide } from "../interfaces/Guide.ts";
import guideService from "../services/guideService.ts";

const Home: React.FC = () => {
    /* ---------- state ---------- */
    const [popularGuides, setPopularGuides] = useState<Guide[]>([]);
    const [recentlyAdded, setRecentlyAdded] = useState<Game[]>([]);
    const [popularGames,  setPopularGames]  = useState<Game[]>([]);
    const [latestNews,    setLatestNews]    = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const navigate = useNavigate();

    /* ---------- effects ---------- */
    /* published guides */
    useEffect(() => {
        guideService.getPublishedGuides()
            .then((guides: Guide[]) => {
                // Mostrar las 6 más recientes
                const recent = guides
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 6);
                setPopularGuides(recent);
            })
            .catch(err => console.error("Error fetching guides:", err));
    }, []);

    /* games */
    useEffect(() => { loadGames(); }, []);

    /* recent news */
    useEffect(() => {
        newsService.getRecent(5)
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
                        <Search className="h-4 w-4"/>
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
                                            <div className="item-image">
                                                <img
                                                    src={item.coverImage}
                                                    alt={item.title}
                                                />
                                            </div>
                                        )}
                                        <div className="item-title">{item.title}</div>
                                        <div className="item-meta">
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
                                        {game.imageUrl ? (
                                            <img src={game.imageUrl} alt={game.name} />
                                        ) : (
                                            <span>Game</span>
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

            {/* -------- Popular Games -------- */}
            <div className="content-section">
                <div className="section-header">
                    <span className="section-title">Games</span>
                    <Link to="/games" className="view-more">More +</Link>
                </div>

                <div className="content-items">
                    {loading ? (
                        <div className="loading">Loading...</div>
                    ) : popularGames.length ? (
                        popularGames.map(game => (
                            <Link to={`/games/${game.id}`} key={game.id} className="item-card">
                                <div className="item-image">
                                    {game.imageUrl ? (
                                        <img src={game.imageUrl} alt={game.name} />
                                    ) : (
                                        <span>Game</span>
                                    )}
                                </div>
                                <div className="item-title">{game.name}</div>
                                <div className="item-meta">{game.genre}</div>
                            </Link>
                        ))
                    ) : (
                        <div>No games found</div>
                    )}
                </div>
            </div>

            {/* -------- Popular Guides (SOLO PUBLICADAS) -------- */}
            <div className="content-section">
                <div className="section-header">
                    <span className="section-title">Recently Published Guides</span>
                    <Link to="/guides" className="view-more">More +</Link>
                </div>
                <div className="reviews-grid">
                    {popularGuides.length === 0 ? (
                        <div className="p-2 text-gray-500">No published guides yet.</div>
                    ) : (
                        popularGuides.map((guide) => (
                            <div key={guide.id} className="review-card">
                                <div className="review-header">
                                    <Link to={`/guides/${guide.id}`} className="item-title">
                                        {guide.title}
                                    </Link>
                                    <div className="rating text-xs text-gray-500">
                                        {new Date(guide.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="review-content text-sm text-gray-600">
                                    {guide.content.substring(0, 100)}...
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
