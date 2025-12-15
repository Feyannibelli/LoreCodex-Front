import React, { useEffect, useState } from 'react';
import { Mail, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAuth0 } from '@auth0/auth0-react';
import emailService from '../services/emailService';
import Button from '../components/Button';
import SettingsLayout from '../components/settings/SettingsLayout';
import SettingsSectionCard from '../components/settings/SettingsSectionCard';

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
            <div className="flex min-h-screen items-center justify-center bg-background py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!backendUser && !auth0User) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background py-16">
                <p className="text-muted-foreground text-lg">User not found.</p>
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
        <SettingsLayout
            breadcrumbs={[
                { label: 'Account', href: '/profile' },
                { label: 'Profile' }
            ]}
            title="Profile"
            description="Manage your account settings and preferences"
            actions={
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="gap-2"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            }
        >
            {/* Success/Error Messages */}
            {successMessage && (
                <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400 shadow-sm backdrop-blur-sm animate-fade-in">
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 shadow-sm backdrop-blur-sm animate-fade-in">
                    {errorMessage}
                </div>
            )}

            {/* Profile Header - Compact */}
            <SettingsSectionCard className="relative overflow-hidden">
                {/* Subtle gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />

                <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    {/* Avatar + Info */}
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="relative group cursor-pointer">
                            <div className="h-20 w-20 rounded-2xl border-2 border-white/10 bg-secondary/50 flex items-center justify-center text-2xl font-bold text-foreground overflow-hidden transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/20">
                                {profilePicture ? (
                                    <img
                                        src={profilePicture}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="bg-gradient-to-br from-primary/20 to-primary/5 bg-clip-text text-transparent">
                                        {userInitial}
                                    </span>
                                )}
                            </div>
                            {/* Hover overlay */}
                            <div className="absolute inset-0 rounded-2xl bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-xs font-medium text-primary">Edit</span>
                            </div>
                        </div>

                        {/* Name + Email */}
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold text-foreground">
                                {displayName}
                            </h2>
                            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3.5 w-3.5" />
                                {displayEmail}
                            </p>
                        </div>
                    </div>

                    {/* Optional: Edit Profile Button */}
                    {/* <Button variant="outline" size="sm">
                        Edit Profile
                    </Button> */}
                </div>
            </SettingsSectionCard>

            {/* Account Information - Settings Style Rows */}
            <SettingsSectionCard
                title="Account Information"
                description="Your account details and membership info"
            >
                <div className="space-y-1">
                    {/* Username Row */}
                    <div className="flex items-center justify-between py-3 border-b border-white/5">
                        <span className="text-sm text-muted-foreground">Username</span>
                        <span className="font-medium text-foreground">{displayName}</span>
                    </div>

                    {/* Member Since Row */}
                    {(backendUser as any)?.createdAt && (
                        <div className="flex items-center justify-between py-3 border-b border-white/5">
                            <span className="text-sm text-muted-foreground">Member Since</span>
                            <span className="font-medium text-foreground">
                                {new Date((backendUser as any).createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                    )}

                    {/* Account Type Row (if applicable) */}
                    <div className="flex items-center justify-between py-3">
                        <span className="text-sm text-muted-foreground">Account Type</span>
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            Standard
                        </span>
                    </div>
                </div>
            </SettingsSectionCard>

            {/* Preferences */}
            <SettingsSectionCard
                title="Preferences"
                description="Manage your notification settings"
            >
                {/* Email Notifications Toggle */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-xl border border-white/5 bg-secondary/10 p-4 transition-colors hover:bg-secondary/20">
                    <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 ring-1 ring-primary/20">
                            <Bell className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Email Notifications</p>
                            <p className="text-sm text-muted-foreground">
                                Receive updates about important activities
                            </p>
                        </div>
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
                            <span className="h-6 w-11 rounded-full border border-white/10 bg-secondary/50 transition peer-checked:border-primary peer-checked:bg-primary peer-disabled:opacity-50 peer-disabled:cursor-not-allowed" />
                            <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5 peer-disabled:opacity-70" />
                        </label>
                        <span className="text-sm font-medium text-muted-foreground min-w-[4rem]">
                            {emailNotificationsEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>
                </div>

                {/* Test Email */}
                {emailNotificationsEnabled && (
                    <div className="rounded-xl border border-white/5 bg-secondary/10 p-4 transition-colors hover:bg-secondary/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-foreground">Test Email</p>
                                <p className="text-sm text-muted-foreground">
                                    Verify your notifications are working
                                </p>
                            </div>
                            <Button
                                onClick={handleSendTestEmail}
                                disabled={sendingTestEmail}
                                size="sm"
                                variant="outline"
                            >
                                {sendingTestEmail ? 'Sending…' : 'Send Test'}
                            </Button>
                        </div>
                    </div>
                )}
            </SettingsSectionCard>

            {/* Advanced / Developer Info - Collapsible (Optional) */}
            {/* Uncomment if needed for debugging */}
            {/* <SettingsSectionCard
                title="Advanced"
                description="Technical information for debugging"
            >
                <details className="group">
                    <summary className="flex cursor-pointer items-center justify-between rounded-lg border border-white/5 bg-secondary/10 p-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/20">
                        <span>Developer Information</span>
                        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="mt-3 space-y-2 rounded-lg border border-white/5 bg-secondary/5 p-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Auth0 ID</span>
                            <code className="rounded bg-secondary/50 px-2 py-1 text-xs font-mono text-foreground">
                                {auth0User?.sub || 'N/A'}
                            </code>
                        </div>
                    </div>
                </details>
            </SettingsSectionCard> */}
        </SettingsLayout>
    );
};

export default Profile;
