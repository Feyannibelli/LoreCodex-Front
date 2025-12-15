import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Guide } from "../interfaces/Guide.ts";
import { Review } from "../interfaces/Review";
import { useAuth } from "../context/AuthContext.tsx";
import { getUserProfileById } from "../services/UserService.ts";
import userListService from "../services/userListService.ts";
import followService from "../services/followService.ts";
import { UserListResponse } from "../interfaces/UserListResponse.ts";


interface PublicProfileData {
    userId: number;
    username: string;
    avatarUrl?: string;
    bio?: string;
    followersCount: number;
    followingCount: number;
    isFollowedByCurrentUser: boolean;
    guides: Guide[];
    reviews: Review[];
}

const PublicProfile: React.FC = () => {
    // Si hay userId en la URL, es perfil de otro usuario
    // Si no hay userId, es MI perfil (usando el user del contexto)
    const { userId: urlUserId } = useParams<{ userId: string }>();
    const { user: me, isAuthenticated } = useAuth();

    const [lists, setLists] = useState<UserListResponse[]>([]);
    const [profile, setProfile] = useState<PublicProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [followersCount, setFollowersCount] = useState(0)
    const [followingCount, setFollowingCount] = useState(0)
    const [isFollowing, setIsFollowing] = useState(false)

    // Determinar qué userId usar
    const targetUserId = urlUserId ? parseInt(urlUserId) : me?.id;
    const isOwnProfile = !urlUserId || (me && targetUserId === me.id);

    useEffect(() => {
        if (!targetUserId) return
        const load = async () => {
            setLoading(true)
            // 1. Traer perfil
            const prof = await getUserProfileById(targetUserId)
            setProfile(prof)
            setFollowersCount(prof.followersCount)
            setFollowingCount(prof.followingCount)

            // 2) listas del usuario
            const uLists = await userListService.getForUser(targetUserId);
            setLists(uLists as UserListResponse[])

            // 3. Consultar si lo sigo (solo si no es mi propio perfil)
            if (me && !isOwnProfile) {
                const follows = await followService.isFollowing(me.id, targetUserId)
                setIsFollowing(follows)
            }
            setLoading(false)
        }
        load()
    }, [targetUserId, me, isOwnProfile])

    const toggleFollow = async () => {
        if (!me || !targetUserId || isOwnProfile) return;
        if (isFollowing) {
            await followService.unfollowUser(me.id, targetUserId);
            setIsFollowing(false);
            setFollowersCount(c => c - 1);
        } else {
            await followService.followUser(me.id, targetUserId);
            setIsFollowing(true);
            setFollowersCount(c => c + 1);
        }
    }

    if (loading) return <div className="p-8 text-center">Loading profile…</div>;
    if (!profile) return <div className="p-8 text-center text-red-600">Profile not found</div>;

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-8">
            {/* Cabecera */}
            <div className="flex items-center space-x-6">
                <div
                    className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center text-4xl font-bold text-white uppercase"
                >
                    {profile.username.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4">
                    <h1 className="text-3xl font-bold">{profile.username}</h1>
                    <p className="text-sm text-gray-600">
                        Followers: {followersCount} · Following: {followingCount}
                    </p>
                </div>
                {/* Botón de seguir solo si NO es mi propio perfil */}
                {isAuthenticated && !isOwnProfile && (
                    <button
                        onClick={toggleFollow}
                        className={`ml-auto px-4 py-1 rounded transition-colors ${isFollowing
                                ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                    >
                        {isFollowing ? 'Following' : 'Follow'}
                    </button>
                )}
            </div>

            {/* Bio opcional */}
            {profile.bio && (
                <p className="text-gray-700">{profile.bio}</p>
            )}

            <hr />

            {/* Secciones */}

            {/* --- Guías --- */}
            <section>
                <h2 className="text-2xl font-semibold mb-2">Guides</h2>
                {profile.guides.length > 0 ? (
                    <ul className="space-y-1">
                        {profile.guides.map(g => (
                            <li key={g.id}>
                                <Link to={`/guides/${g.id}`} className="text-indigo-600 hover:underline">
                                    {g.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No guides created.</p>
                )}
            </section>

            {/* --- Listas --- */}
            <section>
                <h2 className="text-2xl font-semibold mb-2">Lists</h2>
                {lists.length > 0 ? (
                    <ul className="space-y-1">
                        {lists.map(l => (
                            <li key={l.id}>
                                <Link to={`/lists/${l.id}`} className="text-indigo-600 hover:underline">
                                    {l.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No lists created.</p>
                )}
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-2">Reviews</h2>
                {profile.reviews.length > 0 ? (
                    <ul className="space-y-1">
                        {profile.reviews.map(r => (
                            <li key={r.id}>
                                <a
                                    href={`/games/${r.gameId}`}
                                    className="text-indigo-600 hover:underline"
                                >
                                    {r.gameTitle}: "{r.content.substring(0, 50)}…"
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No reviews written.</p>
                )}
            </section>
        </div>
    );
};

export default PublicProfile;