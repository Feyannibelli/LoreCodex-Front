import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
    const { user } = useAuth();
    const userInitial = user?.username.charAt(0).toUpperCase() || 'U';

    return (
        <div className="flex flex-col items-center p-8">
            {/* Encabezado del perfil */}
            <div
                className="flex flex-col md:flex-row items-center gap-8 w-full max-w-5xl bg-white dark:bg-[#313E3F] shadow-md rounded-lg p-8">
                {/* Imagen o inicial */}
                <div
                    className="flex items-center justify-center h-32 w-32 rounded-full bg-gray-300 text-4xl font-bold text-white overflow-hidden">
                    {user?.profilePicture ? (
                        <img src={user.profilePicture} alt="Profile" className="h-full w-full object-cover"/>
                    ) : (
                        <span>{userInitial}</span>
                    )}
                </div>

                {/* Información del usuario */}
                <div className="flex flex-col items-center md:items-start">
                    <h1 className="text-3xl font-bold text-[#0C0C0C] dark:text-white">{user?.username}</h1>
                    <p className="text-gray-600 dark:text-gray-300">Member since {user?.createdAt || "recently"}</p>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 w-full max-w-5xl">
                <div className="flex flex-col items-center p-6 bg-white dark:bg-[#313E3F] rounded-lg shadow-md">
                    <p className="text-2xl font-bold">56</p>
                    <p className="text-gray-600 dark:text-gray-300">Total games played</p>
                </div>
                <div className="flex flex-col items-center p-6 bg-white dark:bg-[#313E3F] rounded-lg shadow-md">
                    <p className="text-2xl font-bold">2</p>
                    <p className="text-gray-600 dark:text-gray-300">Played this year</p>
                </div>
                <div className="flex flex-col items-center p-6 bg-white dark:bg-[#313E3F] rounded-lg shadow-md">
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-gray-600 dark:text-gray-300">Guides made</p>
                </div>
            </div>

            {/* Sección de listas/juegos jugados */}
            <div className="w-full max-w-5xl mt-12">
                <h2 className="text-2xl font-bold mb-6 text-[#0C0C0C] dark:text-white">Recently Played</h2>
                {/* Acá después irán las tarjetas de juegos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-[#313E3F] p-6 rounded-lg shadow-md text-center">
                        Game Name
                    </div>
                    <div className="bg-white dark:bg-[#313E3F] p-6 rounded-lg shadow-md text-center">
                        Game Name
                    </div>
                    <div className="bg-white dark:bg-[#313E3F] p-6 rounded-lg shadow-md text-center">
                        Game Name
                    </div>
                </div>
            </div>
            <div className="flex justify-end w-full max-w-5xl mt-8">
                <button
                    className="bg-[#F47E00] hover:bg-[#DB7100] text-white font-bold py-2 px-6 rounded-lg transition-colors">
                    Edit Profile
                </button>
            </div>
        </div>
    );
};

export default Profile;
