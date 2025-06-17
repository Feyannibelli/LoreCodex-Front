// src/pages/Profile.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import authService, { UserData } from '../services/authService';
import emailService from '../services/emailService';
import Button from '../components/Button';

const Profile: React.FC = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
    const [updatingNotifications, setUpdatingNotifications] = useState(false);
    const [sendingTestEmail, setSendingTestEmail] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await authService.getCurrentUser();
                setUserData(user);
                // Asumir que el backend devuelve esta propiedad en userData
                setEmailNotificationsEnabled(user.emailNotificationsEnabled || false);
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleEmailNotificationToggle = async (enabled: boolean) => {
        setUpdatingNotifications(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            await emailService.updateEmailNotifications(enabled);
            setEmailNotificationsEnabled(enabled);
            setSuccessMessage(enabled ?
                'Email notifications enabled successfully!' :
                'Email notifications disabled successfully!'
            );
        } catch (error) {
            setErrorMessage('Failed to update email notification settings');
            console.error('Error updating email notifications:', error);
        } finally {
            setUpdatingNotifications(false);
        }
    };

    const handleSendTestEmail = async () => {
        if (!userData?.email) return;

        setSendingTestEmail(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            await emailService.sendTestEmail(userData.email);
            setSuccessMessage('Test email sent successfully!');
        } catch (error) {
            setErrorMessage('Failed to send test email');
            console.error('Error sending test email:', error);
        } finally {
            setSendingTestEmail(false);
        }
    };

    // Auto-hide messages after 5 seconds
    useEffect(() => {
        if (successMessage || errorMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
                setErrorMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, errorMessage]);

    if (loading) return <div className="text-center mt-20 text-lg font-semibold">Loading...</div>;

    if (!userData) return <div className="text-center mt-20 text-lg text-red-600">User not found.</div>;

    const userInitial = userData.username.charAt(0).toUpperCase();

    return (
        <div className="flex flex-col items-center p-8">
            {/* Messages */}
            {successMessage && (
                <div className="w-full max-w-5xl mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="w-full max-w-5xl mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {errorMessage}
                </div>
            )}

            {/* Encabezado del perfil */}
            <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-5xl bg-white dark:bg-[#313E3F] shadow-md rounded-lg p-8">
                {/* Imagen o inicial */}
                <div className="flex items-center justify-center h-32 w-32 rounded-full bg-gray-300 text-4xl font-bold text-white overflow-hidden">
                    <span>{userInitial}</span>
                </div>

                {/* Info básica */}
                <div className="flex flex-col items-center md:items-start">
                    <h1 className="text-3xl font-bold text-[#0C0C0C] dark:text-white">{userData.username}</h1>
                    <p className="text-gray-600 dark:text-gray-300">{userData.email}</p>
                </div>
            </div>

            {/* Configuración de notificaciones por email */}
            <div className="w-full max-w-5xl mt-8 bg-white dark:bg-[#313E3F] shadow-md rounded-lg p-6">
                <h2 className="text-xl font-bold text-[#0C0C0C] dark:text-white mb-4">Email Notifications</h2>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                        <label className="text-lg font-medium text-[#0C0C0C] dark:text-white">
                            Receive email notifications
                        </label>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Get notified about important updates and activities
                        </p>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="emailNotifications"
                            checked={emailNotificationsEnabled}
                            onChange={(e) => handleEmailNotificationToggle(e.target.checked)}
                            disabled={updatingNotifications}
                            className="w-5 h-5 text-[#f47e00] bg-gray-100 border-gray-300 rounded focus:ring-[#f47e00] focus:ring-2"
                        />
                        <label htmlFor="emailNotifications" className="ml-2 text-sm font-medium text-[#0C0C0C] dark:text-white">
                            {emailNotificationsEnabled ? 'Enabled' : 'Disabled'}
                        </label>
                    </div>
                </div>

                {/* Botón para enviar email de prueba */}
                {emailNotificationsEnabled && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <h3 className="text-lg font-medium text-[#0C0C0C] dark:text-white">
                                    Test Email
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Send a test email to verify your notifications are working
                                </p>
                            </div>
                            <Button
                                onClick={handleSendTestEmail}
                                disabled={sendingTestEmail}
                                className="bg-[#f47e00] hover:bg-[#d56b00] text-white font-semibold py-2 px-4 rounded"
                            >
                                {sendingTestEmail ? 'Sending...' : 'Send Test Email'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Sección de navegación a contenido del usuario */}
            <div className="w-full max-w-5xl mt-8 bg-white dark:bg-[#313E3F] shadow-md rounded-lg p-6">
                <h2 className="text-xl font-bold text-[#0C0C0C] dark:text-white mb-6">My Content</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Mis Drafts */}
                    <Link
                        to="/my-drafts"
                        className="flex flex-col items-center p-6 bg-gradient-to-br from-[#f47e00] to-[#d56b00] text-white rounded-lg hover:from-[#d56b00] hover:to-[#b85800] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        <div className="text-3xl mb-3">📝</div>
                        <h3 className="text-lg font-semibold mb-2">My Drafts</h3>
                        <p className="text-sm text-center opacity-90">View and edit your draft guides</p>
                    </Link>

                    {/* Mis Listas */}
                    <Link
                        to="/my-lists"
                        className="flex flex-col items-center p-6 bg-gradient-to-br from-[#00a8ff] to-[#0078d4] text-white rounded-lg hover:from-[#0078d4] hover:to-[#005a9e] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        <div className="text-3xl mb-3">📋</div>
                        <h3 className="text-lg font-semibold mb-2">My Lists</h3>
                        <p className="text-sm text-center opacity-90">Manage your curated content lists</p>
                    </Link>

                    {/* Mis Challenges */}
                    <Link
                        to="/my-challenges"
                        className="flex flex-col items-center p-6 bg-gradient-to-br from-[#7b68ee] to-[#6a5acd] text-white rounded-lg hover:from-[#6a5acd] hover:to-[#483d8b] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        <div className="text-3xl mb-3">🏆</div>
                        <h3 className="text-lg font-semibold mb-2">My Challenges</h3>
                        <p className="text-sm text-center opacity-90">Track your created challenges</p>
                    </Link>

                    {/* Mis Guides */}
                    <Link
                        to="/my-guides"
                        className="flex flex-col items-center p-6 bg-gradient-to-br from-[#20b2aa] to-[#008b8b] text-white rounded-lg hover:from-[#008b8b] hover:to-[#006666] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        <div className="text-3xl mb-3">📚</div>
                        <h3 className="text-lg font-semibold mb-2">My Guides</h3>
                        <p className="text-sm text-center opacity-90">View your published guides</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Profile;