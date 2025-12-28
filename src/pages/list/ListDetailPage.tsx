import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Gamepad2, Book, Trophy, FileText, ChevronRight, Edit, Trash2, List } from 'lucide-react';
import { listService, UserListResponse, ListItemType } from '../../services/listService';
import { useAuth } from '../../context/AuthContext';
import CommentSection from '../../components/comments/CommentSection';
import Button from '../../components/Button';
import UnifiedContentRenderer from '../../components/UnifiedContentRenderer';

const ListDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [list, setList] = useState<UserListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            fetchListDetail();
        }
    }, [id]);

    const fetchListDetail = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const listData = await listService.getListById(parseInt(id));
            setList(listData);
        } catch (error) {
            console.error('Error fetching list:', error);
            setError('Failed to load list');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteList = async () => {
        if (!list || !user || user.id !== list.userId) return;

        if (!window.confirm('Are you sure you want to delete this list?')) {
            return;
        }

        try {
            await listService.deleteList(list.id);
            navigate('/my-lists');
        } catch (error) {
            console.error('Error deleting list:', error);
            alert('Error deleting list. Please try again.');
        }
    };



    // Helper to get Lucide icon component
    const TypeIcon = ({ type, className }: { type: ListItemType, className?: string }) => {
        switch (type) {
            case ListItemType.GAME:
                return <Gamepad2 className={className} />;
            case ListItemType.GUIDE:
                return <Book className={className} />;
            case ListItemType.CHALLENGE:
                return <Trophy className={className} />;
            default:
                return <FileText className={className} />;
        }
    };

    const getItemRoute = (item: any) => {
        switch (item.type) {
            case ListItemType.GAME:
                return `/games/${item.referenceId}`;
            case ListItemType.GUIDE:
                return `/guides/${item.referenceId}`;
            case ListItemType.CHALLENGE:
                return `/challenges/${item.referenceId}`;
            default:
                return '#';
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !list) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="text-center max-w-md space-y-4">
                    <h2 className="text-2xl font-bold text-red-400">Error Loading List</h2>
                    <p className="text-muted-foreground">{error || 'List not found or removed.'}</p>
                    <Button onClick={() => navigate('/lists')} variant="outline">
                        Back to Lists
                    </Button>
                </div>
            </div>
        );
    }

    const isOwner = user && user.id === list.userId;

    return (
        <div className="min-h-screen bg-background pb-20 pt-24">
            {/* Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-32 -ml-32 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto max-w-5xl px-4 relative z-10 space-y-8">

                {/* Header Card */}
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/60 backdrop-blur-xl shadow-2xl">
                    {/* Header Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-50" />

                    <div className="relative p-8 md:p-12 space-y-6">
                        {/* Meta & Title */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-primary font-medium tracking-wider text-xs uppercase">
                                <span className="bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
                                    Collection
                                </span>
                                <span>•</span>
                                <span>{new Date(list.createdAt).toLocaleDateString()}</span>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <h1 className="text-4xl md:text-5xl font-black text-foreground leading-tight">
                                    {list.title}
                                </h1>

                                {isOwner && (
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/lists/edit/${list.id}`)}
                                            className="gap-2"
                                        >
                                            <Edit className="w-4 h-4" /> Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleDeleteList}
                                            className="gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" /> Delete
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <Link to={`/profile/${list.userId}`} className="flex items-center gap-3 group">
                                    <div className="h-10 w-10 rounded-full bg-secondary ring-2 ring-background group-hover:ring-primary/50 transition-all flex items-center justify-center overflow-hidden">
                                        {/* Ideally we'd have the avatarUrl here in the list response, otherwise fallback to initials */}
                                        <span className="text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors">
                                            {list.username.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                            {list.username}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Curator</p>
                                    </div>
                                </Link>
                                <div className="h-4 w-px bg-white/10" />
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <List className="w-4 h-4" />
                                    <span>{list.items.length} items</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {list.description && (
                            <div className="pt-6 border-t border-white/5">
                                <div className="prose prose-invert prose-sm max-w-none text-muted-foreground/90">
                                    <UnifiedContentRenderer content={list.description} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Items List */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <span className="w-1 h-6 bg-primary rounded-full" />
                        Collection Items
                    </h3>

                    {list.items.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-card/30 p-12 text-center text-muted-foreground">
                            <List className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>This list is currently empty.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {list.items
                                .sort((a, b) => a.position - b.position)
                                .map((item, index) => (
                                    <Link
                                        key={item.id}
                                        to={getItemRoute(item)}
                                        className="group relative flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-card/40 hover:bg-card/80 hover:border-primary/30 transition-all duration-300"
                                    >
                                        {/* Index Number */}
                                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary/50 text-muted-foreground text-sm font-bold group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                            {index + 1}
                                        </div>

                                        {/* Thumbnail or Icon Placeholder */}
                                        <div className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-black/40 border border-white/5 group-hover:ring-2 ring-primary/20 transition-all">
                                            {item.thumbnailUrl ? (
                                                <img
                                                    src={item.thumbnailUrl}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                                                    <TypeIcon type={item.type} className="w-6 h-6" />
                                                </div>
                                            )}
                                            {/* Type Badge Overlay */}
                                            <div className="absolute top-1 right-1">
                                                <div className="bg-black/60 backdrop-blur-sm p-1 rounded text-[10px] text-white/80 border border-white/10">
                                                    <TypeIcon type={item.type} className="w-3 h-3" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 pr-4">
                                            <h4 className="text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                {item.title}
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                <span className="capitalize">{item.type.toLowerCase()}</span>
                                                {/* Could add more metadata here if available in item */}
                                            </div>
                                        </div>

                                        {/* Action Arrow */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                                            <ChevronRight className="w-5 h-5 text-primary" />
                                        </div>
                                    </Link>
                                ))}
                        </div>
                    )}
                </div>

                {/* Comments Section */}
                <div className="rounded-3xl border border-white/5 bg-card/30 p-8 space-y-6">
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <span className="w-1 h-6 bg-primary rounded-full" />
                        Comments
                    </h3>
                    <CommentSection
                        entityType="list"
                        entityId={list.id}
                        currentUser={user ? {
                            id: user.id,
                            username: user.username,
                            isAdmin: isAdmin
                        } : null}
                    />
                </div>
            </div>
        </div>
    );
};

export default ListDetailPage;
