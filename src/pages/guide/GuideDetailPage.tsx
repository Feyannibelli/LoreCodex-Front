import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Guide } from "../../interfaces/Guide";
import UnifiedContentRenderer from "../../components/UnifiedContentRenderer";
import CommentSection from "../../components/comments/CommentSection";
import guideService from "../../services/guideService";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import {
    Calendar,
    Share2,
    Edit,
    Trash2,
    Upload,
    Lock,
    User,
    Gamepad2,
    Tag,
    ChevronRight
} from "lucide-react";

const GuideDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [guide, setGuide] = useState<Guide | null>(null);
    const [loading, setLoading] = useState(true);
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            guideService.getById(+id)
                .then(setGuide)
                .finally(() => setLoading(false));
        }
    }, [id]);

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        // Could use a toast here if available, falling back to alert
        alert('Link copied to clipboard!');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!guide) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold text-white mb-4">Guide Not Found</h2>
                <p className="text-muted-foreground mb-6">The guide you are looking for does not exist or has been deleted.</p>
                <Button onClick={() => navigate('/guides')} variant="outline">
                    Back to Guides
                </Button>
            </div>
        );
    }

    // Permission check: Owner or Admin
    const canEdit = (user && guide.authorId === user.id) || isAdmin;

    return (
        <div className="min-h-screen bg-background relative selection:bg-primary/30 pb-20">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
                {guide.coverImageUrl && (
                    <img
                        src={guide.coverImageUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover blur-[100px] opacity-10"
                    />
                )}
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-fade-in">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* LEFT SIDEBAR (Stick on Desktop) */}
                    <div className="lg:col-span-4 h-fit lg:sticky lg:top-24 space-y-6 order-2 lg:order-1">

                        {/* 1. Related Game Card */}
                        {guide.gameId && (
                            <Link
                                to={`/games/${guide.gameId}`}
                                className="block group bg-card/40 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:border-primary/30 transition-all duration-300"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Gamepad2 className="h-4 w-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Related Game</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <div className="text-lg font-bold text-white group-hover:text-primary transition-colors mb-1">
                                    View Game Details
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Browse more guides and info for this game.
                                </p>
                            </Link>
                        )}

                        {/* 2. Author Card */}
                        <div className="bg-card/40 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                            <Link to={`/profile/${guide.authorId}`} className="flex items-center gap-4 group">
                                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-primary/50 transition-all">
                                    <User className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Written by</div>
                                    <div className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                                        {guide.authorUsername}
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* 3. Manage Guide Actions (Visible to Author/Admin) */}
                        {canEdit && (
                            <div className="bg-card/40 backdrop-blur-sm border border-white/10 rounded-2xl p-5 space-y-3">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Manage Guide</h3>

                                <Link to={`/guides/edit/${guide.id}`} className="block">
                                    <Button variant="outline" className="w-full justify-start border-white/10 hover:border-white/20 hover:bg-white/5">
                                        <Edit className="h-4 w-4 mr-2" /> Edit Guide
                                    </Button>
                                </Link>

                                {guide.published ? (
                                    <Button
                                        onClick={() => guideService.unpublish(guide.id).then(setGuide)}
                                        variant="outline"
                                        className="w-full justify-start border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10"
                                    >
                                        <Lock className="h-4 w-4 mr-2" /> Unpublish
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => guideService.publish(guide.id).then(setGuide)}
                                        className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90"
                                    >
                                        <Upload className="h-4 w-4 mr-2" /> Publish
                                    </Button>
                                )}

                                <Button
                                    onClick={() => {
                                        if (confirm(`Are you sure you want to delete "${guide.title}"?`)) {
                                            guideService.delete(guide.id).then(() => navigate("/guides"));
                                        }
                                    }}
                                    variant="ghost"
                                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/10"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete Guide
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* MAIN CONTENT (Breadcrumb -> Title -> Cover -> Content) */}
                    <div className="lg:col-span-8 flex flex-col gap-8 order-1 lg:order-2">

                        {/* Hero Header */}
                        <div className="flex flex-col gap-4">


                            {/* Title */}
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-[1.1]">
                                {guide.title}
                            </h1>

                            {/* Meta Row */}
                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                {/* Date */}
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(guide.createdAt).toLocaleDateString()}
                                </div>

                                {/* Author Pill */}
                                <Link
                                    to={`/profile/${guide.authorId}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                                >
                                    <User className="h-3 w-3" />
                                    {guide.authorUsername}
                                </Link>

                                {/* Tags */}
                                {guide.tags?.map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-muted-foreground">
                                        <Tag className="h-3 w-3" />
                                        {tag}
                                    </span>
                                ))}

                                <div className="flex-grow" />

                                {/* Share Button */}
                                <Button
                                    onClick={handleShare}
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-foreground hover:bg-white/5"
                                >
                                    <Share2 className="h-4 w-4 mr-2" /> Share
                                </Button>
                            </div>
                        </div>

                        {/* Premium Cover Image */}
                        {guide.coverImageUrl && (
                            <div className="relative w-full aspect-video rounded-2xl border border-white/10 bg-card/40 shadow-2xl overflow-hidden group">
                                {/* Blur Backdrop */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110"
                                    style={{ backgroundImage: `url(${guide.coverImageUrl})` }}
                                />
                                {/* Main Image */}
                                <img
                                    src={guide.coverImageUrl}
                                    alt={guide.title}
                                    className="relative z-10 w-full h-full object-contain"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                            </div>
                        )}

                        {/* Content Body */}
                        <div className="bg-card/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-10 shadow-sm">
                            <article className="prose prose-invert prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-foreground">
                                <UnifiedContentRenderer content={guide.content} />
                            </article>
                        </div>

                        {/* Discussion Section */}
                        <div className="bg-card/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-10">
                            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-primary rounded-full" />
                                Discussion
                            </h3>
                            <CommentSection
                                entityType="guide"
                                entityId={guide.id}
                                currentUser={user ? {
                                    id: user.id,
                                    username: user.username,
                                    isAdmin: isAdmin
                                } : null}
                            />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuideDetailPage;
