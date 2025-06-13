// src/pages/PublicProfile.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserProfileById } from '@/services/userService';
import { UserProfileResponse } from '@/interfaces/UserProfileResponse';

const PublicProfile: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [profile, setProfile] = useState<UserProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (!userId) return;
                const data = await getUserProfileById(Number(userId));
                setProfile(data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    if (loading) return <div className="text-center mt-20 text-lg font-semibold">Cargando perfil...</div>;
    if (!profile) return <div className="text-center mt-20 text-lg text-red-600">Perfil no encontrado.</div>;

    return (
        <div className="flex flex-col items-center p-8">
            <div className="w-full max-w-4xl bg-white dark:bg-[#313E3F] p-6 rounded shadow-md">
                <h1 className="text-3xl font-bold mb-2">{profile.username}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                    Seguidores: {profile.followersCount} | Siguiendo: {profile.followingCount}
                </p>
                <p className="mt-2 italic text-gray-600 dark:text-gray-400">
                    {profile.bio || 'Este usuario aún no ha escrito una bio.'}
                </p>
                <div className="mt-4">
                    {/* Acá podrías poner un botón de "Seguir/Dejar de seguir" */}
                    {profile.isFollowedByCurrentUser ? (
                        <button className="bg-gray-500 text-white px-4 py-2 rounded">Siguiendo</button>
                    ) : (
                        <button className="bg-blue-600 text-white px-4 py-2 rounded">Seguir</button>
                    )}
                </div>
            </div>

            {/* Ejemplo de sección de guías */}
            <div className="w-full max-w-4xl mt-8">
                <h2 className="text-2xl font-semibold mb-4">Guías creadas</h2>
                {profile.guides.length === 0 ? (
                    <p>Este usuario no ha creado guías aún.</p>
                ) : (
                    <ul className="space-y-2">
                        {profile.guides.map((guide) => (
                            <li key={guide.id} className="p-4 border rounded bg-white dark:bg-[#1f1f1f]">
                                <h3 className="font-bold text-lg">{guide.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{guide.summary}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default PublicProfile;
