import React from "react";
import "../css/Home.css";

const Home: React.FC = () => {
    const latestNews = [1, 2, 3, 4];
    const recentlyAdded = Array(10).fill(0);
    const popularGames = Array(8).fill(0);
    const popularReviews = [1, 2, 3];

    return (
        <div className="home-container">
            {/* Barra de busqueda */}
            <div className="search-container">
                <div className="search-bar">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search"
                    />
                    <button className="search-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* contenido general */}
            <div className="content-grid">
                {/* Columna izquierda - noticias */}
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

                {/* columna derecha - juegos recien añadidos */}
                <div className="content-section">
                    <div className="section-header">
                        <span className="section-title">Recently Added</span>
                        <a href="#" className="view-more">More +</a>
                    </div>
                    <div className="content-items">
                        {recentlyAdded.map((_, index) => (
                            <a href="#" key={index} className="item-card">
                                <div className="item-title">Name</div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Juegos populares */}
            <div className="content-section">
                <div className="section-header">
                    <span className="section-title">Popular Games</span>
                    <a href="#" className="view-more">More +</a>
                </div>
                <div className="content-items">
                    {popularGames.map((_, index) => (
                        <a href="#" key={index} className="item-card">
                            <div className="item-title">Name</div>
                        </a>
                    ))}
                </div>
            </div>

            {/* Reviews populares */}
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
                                Texto
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Guias populares */}
            <div className="content-section">
                <div className="section-header">
                    <span className="section-title">Popular Guides</span>
                    <a href="#" className="view-more">More +</a>
                </div>
                <div className="reviews-grid">
                    {popularReviews.map((_, index) => (
                        <div key={index} className="review-card">
                            <div className="review-header">
                                <span className="item-title">Name</span>
                                <div className="rating">User · Game · Guide Name</div>
                            </div>
                            <div className="review-content">
                                Texto
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;