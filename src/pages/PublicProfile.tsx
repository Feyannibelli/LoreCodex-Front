import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Guide } from "../interfaces/Guide.ts";
import { Review } from "../interfaces/Review";
import { useAuth } from "../context/AuthContext.tsx";
import { getUserProfileById } from "../services/UserService.ts";
import userListService from "../services/userListService.ts";
import followService from "../services/followService.ts";
import { UserListResponse } from "../interfaces/UserListResponse.ts";
import {
    BookOpen,
    List as ListIcon,
    Star,
    MessageSquare,
    Users,
    UserPlus,
    UserCheck,
    LayoutGrid,
    ChevronRight,
    Calendar
} from 'lucide-react';

// --- Interfaces ---
interface PublicProfileData {
    userId: number;
    username: string;
    avatarUrl?: string; // Note: API might return profilePicture, handled in logic
    bio?: string;
    followersCount: number;
    followingCount: number;
    isFollowedByCurrentUser: boolean;
    guides: Guide[];
    reviews: Review[];
}

// --- Components ---

const ProfileHeaderCard: React.FC<{
    profile: PublicProfileData;
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
    isOwnProfile: boolean;
    onToggleFollow: () => void;
}> = ({ profile, followersCount, followingCount, isFollowing, isOwnProfile, onToggleFollow }) => {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl">
            {/* Background gradient effect */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                {/* Avatar */}
                <div className="flex-shrink-0 relative group">
                    <div className="h-28 w-28 md:h-32 md:w-32 rounded-full ring-4 ring-card bg-neutral-800 flex items-center justify-center text-5xl font-bold text-white uppercase shadow-xl relative z-10 overflow-hidden">
                        {profile.avatarUrl ? (
                            <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
                        ) : (
                            <span>{profile.username.charAt(0)}</span>
                        )}
                    </div>
                    {/* Decorative ring */}
                    <div className="absolute inset-0 rounded-full ring-2 ring-white/10 scale-110" />
                </div>

                {/* Info & Stats */}
                <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">{profile.username}</h1>
                        {profile.bio ? (
                            <p className="text-muted-foreground mt-2 max-w-2xl text-lg">{profile.bio}</p>
                        ) : (
                            <p className="text-muted-foreground/50 italic mt-1">Passionate about game lore</p>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium">
                        <div className="px-4 py-2 rounded-xl bg-background/50 border border-white/5 flex items-center gap-2 text-foreground/80">
                            <Users size={16} className="text-primary" />
                            <span>{followersCount} Followers</span>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-background/50 border border-white/5 flex items-center gap-2 text-foreground/80">
                            <UserCheck size={16} className="text-primary" />
                            <span>{followingCount} Following</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                {!isOwnProfile && (
                    <div className="flex-shrink-0">
                        <button
                            onClick={onToggleFollow}
                            className={`group md:min-w-[140px] px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${isFollowing
                                    ? 'bg-secondary/50 text-foreground hover:bg-destructive/10 hover:text-destructive border border-white/10'
                                    : 'bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5'
                                }`}
                        >
                            {isFollowing ? (
                                <>
                                    <span className="group-hover:hidden">Following</span>
                                    <span className="hidden group-hover:inline">Unfollow</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus size={18} />
                                    <span>Follow</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const EmptyStateCard: React.FC<{
    icon: React.ElementType;
    message: string;
    subMessage?: string;
}> = ({ icon: Icon, message, subMessage }) => (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border border-white/5 bg-card/30 border-dashed">
        <div className="h-16 w-16 rounded-full bg-secondary/30 flex items-center justify-center mb-4 text-muted-foreground ring-1 ring-white/10">
            <Icon size={32} strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">{message}</h3>
        {subMessage && <p className="text-muted-foreground max-w-sm">{subMessage}</p>}
    </div>
);

const GuideCard: React.FC<{ guide: Guide }> = ({ guide }) => (
    <Link
        to={`/guides/${guide.id}`}
        className="group block p-5 rounded-2xl bg-card border border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
    >
        <div className="flex items-start justify-between mb-3">
            <div className="bg-primary/10 text-primary p-2 rounded-lg">
                <BookOpen size={20} />
            </div>
            <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors" size={20} />
        </div>
        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-2">
            {guide.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {guide.content}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(guide.createdAt).toLocaleDateString()}
            </span>
        </div>
    </Link>
);

const UserListCard: React.FC<{ list: UserListResponse }> = ({ list }) => (
    <Link
        to={`/lists/${list.id}`}
        className="group block p-5 rounded-2xl bg-card border border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
    >
        <div className="flex items-start justify-between mb-3">
            <div className="bg-blue-500/10 text-blue-400 p-2 rounded-lg">
                <ListIcon size={20} />
            </div>
            <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors" size={20} />
        </div>
        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-2">
            {list.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {list.description || "No description provided."}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="bg-secondary px-2 py-1 rounded-md">{list.items?.length || 0} games</span>
        </div>
    </Link>
);

const ReviewItem: React.FC<{ review: Review }> = ({ review }) => (
    <Link
        to={`/games/${review.gameId}`}
        className="group block p-5 rounded-2xl bg-card border border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
    >
        <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
                <div className="bg-orange-500/10 text-orange-400 p-2 rounded-lg">
                    <Star size={20} fill="currentColor" className="opacity-20" />
                </div>
                <span className="text-lg font-bold text-orange-400">{review.rating}/10</span>
            </div>
            <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors" size={20} />
        </div>

        <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{review.gameTitle}</h4>
        <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed italic">
            "{review.content}"
        </p>
    </Link>
);

// --- Main Page Component ---

const PublicProfile: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const { user: me } = useAuth();

    const [lists, setLists] = useState<UserListResponse[]>([]);
    const [profile, setProfile] = useState<PublicProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);

    const [activeTab, setActiveTab] = useState<'guides' | 'lists' | 'reviews'>('guides');

    useEffect(() => {
        if (!userId) return;

        const load = async () => {
            setLoading(true);
            try {
                // 1. Fetch Profile
                const prof = await getUserProfileById(+userId);
                // The API might return 'profilePicture' instead of 'avatarUrl', mapping it if needed
                // Assuming prof structure matches or needs slight adaptation:
                const mappedProfile: PublicProfileData = {
                    ...prof,
                    avatarUrl: (prof as any).profilePicture || prof.avatarUrl
                };

                setProfile(mappedProfile);
                setFollowersCount(prof.followersCount);
                setFollowingCount(prof.followingCount);

                // 2. Fetch Lists
                const uLists = await userListService.getForUser(+userId);
                setLists(uLists as UserListResponse[]);

                // 3. Check Follow Status
                if (me) {
                    const follows = await followService.isFollowing(me.id, +userId);
                    setIsFollowing(follows);
                }
            } catch (error) {
                console.error("Error loading profile:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [userId, me]);

    const toggleFollow = async () => {
        if (!me || !userId) return;
        try {
            if (isFollowing) {
                await followService.unfollowUser(me.id, +userId);
                setIsFollowing(false);
                setFollowersCount(c => Math.max(0, c - 1));
            } else {
                await followService.followUser(me.id, +userId);
                setIsFollowing(true);
                setFollowersCount(c => c + 1);
            }
        } catch (error) {
            console.error("Failed to toggle follow status", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-muted-foreground animate-pulse">Loading profile...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
                <div className="p-4 bg-destructive/10 text-destructive rounded-full">
                    <Users size={32} />
                </div>
                <h2 className="text-2xl font-bold">Profile Not Found</h2>
                <p className="text-muted-foreground">The user you are looking for does not exist or may have been removed.</p>
                <Link to="/" className="text-primary hover:underline">Return Home</Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-8 animate-fade-in">
            {/* 1. Header Card */}
            <ProfileHeaderCard
                profile={profile}
                followersCount={followersCount}
                followingCount={followingCount}
                isFollowing={isFollowing}
                isOwnProfile={!!(me?.id === +userId!)}
                onToggleFollow={toggleFollow}
            />

            {/* 2. Navigation Tabs */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2 bg-card/30 p-1.5 rounded-2xl border border-white/5 backdrop-blur-sm">
                    {[
                        { id: 'guides', label: 'Guides', icon: BookOpen },
                        { id: 'lists', label: 'Lists', icon: ListIcon },
                        { id: 'reviews', label: 'Reviews', icon: Star }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${isActive
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 translate-y-[-1px]"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                    }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 3. Content Area */}
            <div className="bg-card/30 backdrop-blur-md rounded-3xl border border-white/5 p-6 md:p-8 min-h-[400px]">

                {/* Guides Tab */}
                {activeTab === 'guides' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <BookOpen className="text-primary" size={24} />
                                Published Guides
                            </h3>
                            <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded-lg">
                                {profile.guides.length} Total
                            </span>
                        </div>

                        {profile.guides.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {profile.guides.map(guide => (
                                    <GuideCard key={guide.id} guide={guide} />
                                ))}
                            </div>
                        ) : (
                            <EmptyStateCard
                                icon={BookOpen}
                                message="No guides published"
                                subMessage={`${profile.username} hasn't written any guides yet.`}
                            />
                        )}
                    </div>
                )}

                {/* Lists Tab */}
                {activeTab === 'lists' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <ListIcon className="text-primary" size={24} />
                                Curated Lists
                            </h3>
                            <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded-lg">
                                {lists.length} Total
                            </span>
                        </div>

                        {lists.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {lists.map(list => (
                                    <UserListCard key={list.id} list={list} />
                                ))}
                            </div>
                        ) : (
                            <EmptyStateCard
                                icon={LayoutGrid}
                                message="No lists created"
                                subMessage={`${profile.username} hasn't created any collections yet.`}
                            />
                        )}
                    </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Star className="text-primary" size={24} />
                                Game Reviews
                            </h3>
                            <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded-lg">
                                {profile.reviews.length} Total
                            </span>
                        </div>

                        {profile.reviews.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                {profile.reviews.map(review => (
                                    <ReviewItem key={review.id} review={review} />
                                ))}
                            </div>
                        ) : (
                            <EmptyStateCard
                                icon={MessageSquare}
                                message="No reviews posted"
                                subMessage={`${profile.username} hasn't reviewed any games yet.`}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicProfile;
