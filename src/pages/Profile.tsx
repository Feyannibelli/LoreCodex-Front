import React, { useEffect, useState } from 'react';
import { Mail, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAuth0 } from '@auth0/auth0-react';
import emailService from '../services/emailService';
import PrimaryButton from '../components/ui/PrimaryButton';
import SecondaryButton from '../components/ui/SecondaryButton';
import PageHero from '../components/ui/PageHero';

type ClaimRecord = Record<string, unknown> | null;

function readCustomClaimString(source: unknown, claimName: string): string | undefined {
    if (!source || typeof source !== 'object') return undefined;
    const record = source as Record<string, unknown>;
    const value = record[claimName];
    return typeof value === 'string' && value.trim() ? value : undefined;
}

const Profile: React.FC = () => {
    const { user: backendUser, loading, logout } = useAuth();
    const { user: auth0User, getIdTokenClaims } = useAuth0();
    const [idTokenClaims, setIdTokenClaims] = useState<ClaimRecord>(null);
    const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
    const [updatingNotifications, setUpdatingNotifications] = useState(false);
    const [sendingTestEmail, setSendingTestEmail] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setEmailNotificationsEnabled(backendUser?.emailNotificationsEnabled || false);
    }, [backendUser?.emailNotificationsEnabled]);

    useEffect(() => {
        let cancelled = false;
        if (!auth0User) {
            setIdTokenClaims(null);
            return;
        }
        (async () => {
            try {
                const claims = await getIdTokenClaims();
                if (!cancelled) setIdTokenClaims((claims ?? {}) as Record<string, unknown>);
            } catch {
                if (!cancelled) setIdTokenClaims(null);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [auth0User, getIdTokenClaims]);

    const handleEmailNotificationToggle = async (enabled: boolean) => {
        setUpdatingNotifications(true);
        setErrorMessage('');
        setSuccessMessage('');
        try {
            await emailService.updateEmailNotifications(enabled);
            setEmailNotificationsEnabled(enabled);
            setSuccessMessage(
                enabled ? 'Email notifications enabled successfully!' : 'Email notifications disabled successfully!'
            );
        } catch {
            setErrorMessage('Failed to update email notification settings');
        } finally {
            setUpdatingNotifications(false);
        }
    };

    const handleSendTestEmail = async () => {
        if (!backendUser?.email) return;
        setSendingTestEmail(true);
        setErrorMessage('');
        setSuccessMessage('');
        try {
            await emailService.sendTestEmail(backendUser.email);
            setSuccessMessage('Test email sent successfully!');
        } catch {
            setErrorMessage('Failed to send test email');
        } finally {
            setSendingTestEmail(false);
        }
    };

    useEffect(() => {
        if (successMessage || errorMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
                setErrorMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, errorMessage]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!backendUser && !auth0User) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 py-16">
                <p className="text-slate-600 text-lg">User not found.</p>
            </div>
        );
    }

    const auth0Username =
        readCustomClaimString(idTokenClaims, 'https://api.lorecodex.com/username') ||
        readCustomClaimString(auth0User, 'https://api.lorecodex.com/username') ||
        auth0User?.nickname ||
        auth0User?.name ||
        auth0User?.email ||
        auth0User?.sub ||
        'User';

    const displayName = backendUser?.username || auth0Username;
    const displayEmail = backendUser?.email || auth0User?.email || '—';
    const profilePicture = backendUser?.profilePicture || auth0User?.picture;
    const userInitial = (displayName?.charAt(0) || 'U').toUpperCase();

    return (
        <div className="bg-slate-50 min-h-screen py-12">
            <div className="mx-auto max-w-5xl space-y-8 px-4">
                {successMessage && (
                    <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 shadow-sm">
                        {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                        {errorMessage}
                    </div>
                )}

                <PageHero
                    title="Your profile"
                    subtitle="Account overview"
                    description="Gestioná tu cuenta, actualizá notificaciones y revisá tus accesos desde este espacio."
                    actions={
                        <SecondaryButton type="button" onClick={logout}>
                            Logout
                        </SecondaryButton>
                    }
                >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-600 text-3xl font-bold text-white shadow-lg">
                            {profilePicture ? (
                                <img src={profilePicture} alt="Profile" className="h-full w-full rounded-2xl object-cover" />
                            ) : (
                                userInitial
                            )}
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-slate-900">{displayName}</p>
                            <p className="flex items-center gap-2 text-sm text-slate-500">
                                <Mail className="h-4 w-4 text-slate-400" />
                                {displayEmail}
                            </p>
                        </div>
                    </div>
                </PageHero>

                <div className="rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-sm space-y-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Email notifications</p>
                            <p className="text-slate-600">Manténte al tanto de novedades y actividades importantes.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                    type="checkbox"
                                    checked={emailNotificationsEnabled}
                                    onChange={(event) => handleEmailNotificationToggle(event.target.checked)}
                                    disabled={updatingNotifications}
                                    className="peer sr-only"
                                />
                                <span className="h-6 w-11 rounded-full border border-slate-300 bg-slate-100 transition peer-checked:border-indigo-600 peer-checked:bg-indigo-600" />
                                <span className="absolute left-0.5 top-0.5 h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                            </label>
                            <span className="text-sm text-slate-600">{emailNotificationsEnabled ? 'Enabled' : 'Disabled'}</span>
                        </div>
                    </div>

                    {emailNotificationsEnabled && (
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Test email</p>
                                    <p className="text-xs text-slate-500">Verificá que tus notificaciones estén activas.</p>
                                </div>
                                <PrimaryButton type="button" onClick={handleSendTestEmail} disabled={sendingTestEmail}>
                                    {sendingTestEmail ? 'Sending…' : 'Send Test Email'}
                                </PrimaryButton>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
                            <p className="text-sm text-slate-500">Auth0 ID</p>
                            <p className="font-semibold text-slate-900">{auth0User?.sub || 'N/A'}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
                            <p className="text-sm text-slate-500">Member since</p>
                            <p className="font-semibold text-slate-900">
                                {backendUser?.createdAt ? new Date(backendUser.createdAt).toLocaleDateString() : '—'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-sm space-y-4">
                    <h2 className="text-xl font-semibold text-slate-900">Account overview</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
                            <p className="text-xs uppercase tracking-widest text-slate-500">Username</p>
                            <p className="font-semibold text-slate-900">{displayName}</p>
                        </div>
                        <div className="space-y-1 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
                            <p className="text-xs uppercase tracking-widest text-slate-500">Email</p>
                            <p className="font-semibold text-slate-900">{displayEmail}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
