// src/pages/Profile.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import authService, { UserData } from '@/services/authService';

const Profile: React.FC = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await authService.getCurrentUser();
                setUserData(user);
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) return <div className="text-center mt-20 text-lg font-semibold">Loading...</div>;

    if (!userData) return <div className="text-center mt-20 text-lg text-red-600">User not found.</div>;

    const userInitial = userData.username.charAt(0).toUpperCase();

    return (
        <div className="flex flex-col items-center p-8">
            {/* Encabezado del perfil */}
            <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-5xl bg-white dark:bg-[#313E3F] shadow-md rounded-lg p-8">
                {/* Imagen o inicial */}
                <div className="flex items-center justify-center h-32 w-32 rounded-full bg-gray-300 text-4xl font-bold text-white overflow-hidden">
                    {/* Acá después podrías poner foto real */}
                    <span>{userInitial}</span>
                </div>

                {/* Info básica */}
                <div className="flex flex-col items-center md:items-start">
                    <h1 className="text-3xl font-bold text-[#0C0C0C] dark:text-white">{userData.username}</h1>
                    <p className="text-gray-600 dark:text-gray-300">{userData.email}</p>
                </div>
            </div>

            {/* Botón para ir a Drafts */}
            <Link
                to="/my-drafts"
                className="mt-6 bg-[#f47e00] hover:bg-[#d56b00] text-white font-semibold py-2 px-6 rounded"
            >
                View My Drafts
            </Link>

            {/* Estadísticas placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 w-full max-w-5xl">
                <div className="flex flex-col items-center p-6 bg-white dark:bg-[#313E3F] rounded-lg shadow-md">
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-gray-600 dark:text-gray-300">Games Played</p>
                </div>
                <div className="flex flex-col items-center p-6 bg-white dark:bg-[#313E3F] rounded-lg shadow-md">
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-gray-600 dark:text-gray-300">Guides Created</p>
                </div>
                <div className="flex flex-col items-center p-6 bg-white dark:bg-[#313E3F] rounded-lg shadow-md">
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-gray-600 dark:text-gray-300">Games in Wishlist</p>
                </div>
            </div>
        </div>
    );
};

export default Profile;
