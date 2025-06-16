import React, { useEffect, useState } from 'react';
import {Link, useParams} from 'react-router-dom';
import {Guide} from "../interfaces/Guide.ts";
import {Review} from "../interfaces/Review";
import {useAuth} from "../context/AuthContext.tsx";
import {getUserProfileById} from "../services/UserService.ts";
import userListService from "../services/userListService.ts";
import followService from "../services/followService.ts";
import {UserListResponse} from "../interfaces/UserListResponse.ts";


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
    const { userId } = useParams<{ userId: string }>();
    const { user: me, isAuthenticated } = useAuth();
    const [lists, setLists] = useState<UserListResponse[]>([]);
    const [profile, setProfile] = useState<PublicProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [followersCount, setFollowersCount] = useState(0)
    const [followingCount, setFollowingCount] = useState(0)
    const [isFollowing, setIsFollowing] = useState(false)

    useEffect(() => {
        if (!userId) return
        const load = async () => {
            setLoading(true)
            // 1. Traer perfil (que idealmente ya lleva followersCount, followingCount)
            const prof = await getUserProfileById(+userId)
            setProfile(prof)
            setFollowersCount(prof.followersCount)
            setFollowingCount(prof.followingCount)

            // 2) listas del usuario
            const uLists = await userListService.getForUser(+userId);
            setLists(uLists as UserListResponse[])

            // 3. Consultar si te sigo
            if (me) {
                const follows = await followService.isFollowing(me.id, +userId)
                setIsFollowing(follows)
            }
            setLoading(false)
        }
        load()
    }, [userId])

    const toggleFollow = async () => {
        if (!me || !userId) return;
        if (isFollowing) {
            await followService.unfollowUser(me.id, +userId);
            setIsFollowing(false);
            setFollowersCount(c => c - 1);
        } else {
            await followService.followUser(me.id, +userId);
            setIsFollowing(true);
            setFollowersCount(c => c + 1);
        }
    }

    if (loading) return <div className="p-8 text-center">Cargando perfil…</div>;
    if (!profile) return <div className="p-8 text-center text-red-600">Perfil no encontrado</div>;

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
                        Seguidores: {followersCount} · Siguiendo: {followingCount}
                    </p>
                </div>
                { isAuthenticated && userId && me?.id !== +userId && (
                    <button
                        onClick={toggleFollow}
                        className={`ml-auto px-4 py-1 rounded ${
                            isFollowing ? 'bg-gray-300' : 'bg-blue-600 text-white'
                        }`}
                    >
                        {isFollowing ? 'Siguiendo' : 'Seguir'}
                    </button>
                )}
            </div>

            {/* Bio opcional */}
            {profile.bio && (
                <p className="text-gray-700">{profile.bio}</p>
            )}

            <hr/>

            {/* Secciones */}


            {/* --- Guías --- */}
            <section>
                <h2 className="text-2xl font-semibold mb-2">Guías</h2>
                {profile.guides.length > 0 ? (
                    <ul className="space-y-1">
                        {profile.guides.map(g => (
                            <li key={g.id}>
                                <Link to={`/guides/${g.id}`} className="text-blue-600 hover:underline">
                                    {g.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No ha creado guías.</p>
                )}
            </section>

            {/* --- Listas (nueva sección) --- */}
            <section>
                <h2 className="text-2xl font-semibold mb-2">Listas</h2>
                {lists.length > 0 ? (
                    <ul className="space-y-1">
                        {lists.map(l => (
                            <li key={l.id}>
                                <Link to={`/lists/${l.id}`} className="text-blue-600 hover:underline">
                                    {l.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No ha creado listas.</p>
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
                                    className="text-blue-600 hover:underline"
                                >
                                    {r.gameTitle}: “{r.content.substring(0, 50)}…”
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No ha escrito reviews.</p>
                )}
            </section>
        </div>
    );
};

export default PublicProfile;
