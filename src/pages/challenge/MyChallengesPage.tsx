import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import challengeService, { Challenge } from '../../services/challengeService';
import ChallengeCard from '../../components/challenge/ChallengeCard';
import { Crown, List as ListIcon } from 'lucide-react';

const MyChallengesPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState<'created' | 'joined'>('joined');
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchChallenges = async () => {
            setLoading(true);
            try {
                let data: Challenge[] = [];
                if (activeTab === 'created') {
                    data = await challengeService.getCreatedChallenges();
                } else {
                    data = await challengeService.getJoinedChallenges();
                }
                setChallenges(data);
            } catch (error) {
                console.error("Failed to fetch my challenges", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChallenges();
    }, [activeTab, isAuthenticated]);

    if (!isAuthenticated) return <div className="p-8 text-center text-muted-foreground">Please log in to view your challenges.</div>;

    return (
        <div className="min-h-screen bg-background py-8 md:py-12 mb-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col gap-6 mb-8">
                    <div className="flex items-center gap-2">
                        <span className="h-0.5 w-8 bg-primary/60 rounded-full"></span>
                        <p className="text-sm font-bold uppercase tracking-widest text-primary">
                            Dashboard
                        </p>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                        My Challenges
                    </h1>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-1">
                    <button
                        onClick={() => setActiveTab('joined')}
                        className={`
                            relative flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors
                            ${activeTab === 'joined' ? 'text-primary' : 'text-muted-foreground hover:text-white'}
                        `}
                    >
                        <Crown className="h-4 w-4" />
                        Joined Challenges
                        {activeTab === 'joined' && (
                            <span className="absolute bottom-[-5px] left-0 h-0.5 w-full bg-primary rounded-t-full shadow-[0_0_10px_rgba(245,126,0,0.5)]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('created')}
                        className={`
                            relative flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors
                            ${activeTab === 'created' ? 'text-primary' : 'text-muted-foreground hover:text-white'}
                        `}
                    >
                        <ListIcon className="h-4 w-4" />
                        Created Challenges
                        {activeTab === 'created' && (
                            <span className="absolute bottom-[-5px] left-0 h-0.5 w-full bg-primary rounded-t-full shadow-[0_0_10px_rgba(245,126,0,0.5)]" />
                        )}
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-card/40 p-5 h-[200px] animate-pulse">
                                <div className="h-20 w-full rounded-2xl bg-white/5" />
                                <div className="h-6 w-3/4 rounded bg-white/5" />
                            </div>
                        ))}
                    </div>
                ) : challenges.length === 0 ? (
                    <div className="text-center py-20 bg-card/20 rounded-3xl border border-white/5">
                        <p className="text-muted-foreground">You haven't {activeTab === 'joined' ? 'joined' : 'created'} any challenges yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {challenges.map(challenge => (
                            <ChallengeCard key={challenge.id} challenge={challenge} />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default MyChallengesPage;
