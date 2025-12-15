import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button";
import { Search, ArrowUpDown, Gamepad2, Plus, Calendar, Star, Users } from "lucide-react";
import { cn } from "../../lib/utils.ts";
// Mock data for now since we haven't integrated game service fully yet
// In real app this would come from gameService
interface Game {
    id: string;
    title: string;
    description: string;
    coverUrl: string;
    genre: string[];
    releaseDate: string;
    rating: number;
    playerCount: string;
}

const MOCK_GAMES: Game[] = [
    {
        id: "1",
        title: "Elden Ring",
        description: "The Golden Order has been broken. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.",
        coverUrl: "https://image.api.playstation.com/vulcan/ap/rnd/202110/2000/phvVT0qZfcRms5qDAk0SI3CM.png",
        genre: ["RPG", "Open World"],
        releaseDate: "2022-02-25",
        rating: 4.8,
        playerCount: "20M+"
    },
    {
        id: "2",
        title: "Baldur's Gate 3",
        description: "Gather your party using 5th edition D&D rules and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival, and the lure of absolute power.",
        coverUrl: "https://image.api.playstation.com/vulcan/ap/rnd/202302/2321/3098481c9164bb5f33069b37e49fba1a572ea3b8ef4b174eb8862.png",
        genre: ["RPG", "Strategy"],
        releaseDate: "2023-08-03",
        rating: 4.9,
        playerCount: "10M+"
    },
    {
        id: "3",
        title: "Cyberpunk 2077",
        description: "Cyberpunk 2077 is an open-world, action-adventure RPG set in the megalopolis of Night City, where you play as a cyberpunk mercenary wrapped up in a do-or-die fight for survival.",
        coverUrl: "https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg",
        genre: ["Action", "RPG"],
        releaseDate: "2020-12-10",
        rating: 4.5,
        playerCount: "25M+"
    },
    {
        id: "4",
        title: "The Witcher 3: Wild Hunt",
        description: "You are Geralt of Rivia, mercenary monster slayer. Before you stands a war-torn, monster-infested continent you can explore at will.",
        coverUrl: "https://image.api.playstation.com/vulcan/ap/rnd/202211/0711/kh4MUIuMmHlktOHar3lVl6rY.png",
        genre: ["RPG", "Adventure"],
        releaseDate: "2015-05-19",
        rating: 4.9,
        playerCount: "50M+"
    },
    {
        id: "5",
        title: "Hollow Knight",
        description: "Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects and heroes.",
        coverUrl: "https://upload.wikimedia.org/wikipedia/en/0/04/Hollow_Knight_first_cover_art.webp",
        genre: ["Metroidvania", "Indie"],
        releaseDate: "2017-02-24",
        rating: 4.7,
        playerCount: "5M+"
    },
    {
        id: "6",
        title: "Zelda: Tears of the Kingdom",
        description: "In this sequel to The Legend of Zelda: Breath of the Wild, you'll decide your own path through the sprawling landscapes of Hyrule and the mysterious islands floating in the vast skies above.",
        coverUrl: "https://assets.nintendo.com/image/upload/ar_16:9,c_lpad,w_1240/b_white/f_auto/q_auto/ncom/software/switch/70010000063714/desc/d2dfc28591f4229b4348575024d9c75908b877242c752671c61864b490f23f79",
        genre: ["Action", "Adventure"],
        releaseDate: "2023-05-12",
        rating: 4.8,
        playerCount: "18M+"
    }
];

const GamesPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");

    const filters = ["All", "RPG", "Action", "Strategy", "Indie", "Adventure"];

    const filteredGames = MOCK_GAMES.filter(game => {
        const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            game.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === "All" || game.genre.includes(activeFilter);
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-background py-8 md:py-12 mb-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* 1. Header Section - Aligned */}
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-8">
                    <div className="max-w-3xl space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="h-0.5 w-8 bg-primary/60 rounded-full"></span>
                            <p className="text-sm font-bold uppercase tracking-widest text-primary">
                                LIBRARY
                            </p>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                            Explore Games
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                            Dive into the extensive LoreCodex library. Find your favorite worlds and start documenting.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 pb-1">
                        <Link to="/games/request">
                            <Button className="shadow-lg shadow-primary/20 font-semibold px-6 gap-2">
                                <Plus className="h-4 w-4" />
                                Request Game
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* 2. Toolbar Section - Premium Surface */}
                <div className="sticky top-20 z-30 mb-8 rounded-2xl border border-white/5 bg-card/80 p-2 shadow-xl shadow-black/20 backdrop-blur-xl">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center p-2">

                        {/* Search Input - Compact & Local */}
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search games..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-10 w-full rounded-lg border border-white/5 bg-secondary/50 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>

                        {/* Divider on desktop */}
                        <div className="hidden h-6 w-px bg-white/5 md:block"></div>

                        {/* Controls */}
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            <button className="flex h-10 items-center gap-2 rounded-lg border border-white/5 bg-secondary/30 px-4 text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors whitespace-nowrap">
                                <ArrowUpDown className="h-3.5 w-3.5" />
                                <span>Popularity</span>
                            </button>

                            {/* Filter Chips */}
                            <div className="flex items-center gap-1.5 bg-secondary/20 p-1 rounded-lg border border-white/5">
                                {filters.map(filter => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={cn(
                                            "px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap",
                                            activeFilter === filter
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                        )}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredGames.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-card/30 py-24 text-center backdrop-blur-sm">
                            <div className="h-20 w-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6 ring-8 ring-secondary/20">
                                <Gamepad2 className="h-10 w-10 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">No games found</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                                We couldn't find any games matching "{searchTerm}".
                            </p>
                            <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/5 hover:text-primary gap-2">
                                <Plus className="h-4 w-4" />
                                Request to Add
                            </Button>
                        </div>
                    ) : (
                        filteredGames.map(game => (
                            <Link
                                to={`/games/${game.id}`}
                                key={game.id}
                                className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/5 bg-card shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20"
                            >
                                {/* Cover Image - Tall Aspect Ratio for Games */}
                                <div className="aspect-[3/4] w-full overflow-hidden bg-muted relative">
                                    <img
                                        src={game.coverUrl}
                                        alt={game.title}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent opacity-90" />

                                    {/* TOP RIGHT BADGE */}
                                    <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                        <div className="flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-bold text-yellow-400 border border-white/10 shadow-lg">
                                            <Star className="h-3 w-3 fill-yellow-400" />
                                            {game.rating}
                                        </div>
                                    </div>
                                </div>

                                {/* Content Overlay (Bottom) */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-card via-card/95 to-transparent">
                                    <div className="mb-2 flex flex-wrap gap-2">
                                        {game.genre.map(g => (
                                            <span key={g} className="text-[10px] font-bold uppercase tracking-wider text-primary">
                                                {g}
                                            </span>
                                        ))}
                                    </div>

                                    <h2 className="text-2xl font-bold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors">
                                        {game.title}
                                    </h2>

                                    <div className="flex items-center gap-4 text-xs text-muted-foreground/80 mt-2">
                                        <div className="flex items-center gap-1.5">
                                            <Users className="h-3.5 w-3.5" />
                                            {game.playerCount}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {new Date(game.releaseDate).getFullYear()}
                                        </div>
                                    </div>
                                </div>

                                {/* Inner Highlight Border */}
                                <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/5 pointer-events-none group-hover:ring-primary/20 transition-all duration-500" />
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default GamesPage;
