import { useEffect, useState } from "react";
import guideService from "@/services/guideService";
import { Guide } from "@/interfaces/Guide";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

const MyDraftsPage: React.FC = () => {
    const { user } = useAuth();
    const [drafts, setDrafts] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            guideService
                .getDraftsByUser(user.id)   // ← usa tu nuevo endpoint
                .then(setDrafts)
                .finally(() => setLoading(false));
        }
    }, [user]);

    if (loading) return <div className="p-4">Loading…</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">My Drafts</h1>

            {drafts.length === 0 ? (
                <p>No drafts yet.</p>
            ) : (
                <ul className="space-y-4">
                    {drafts.map(d => (
                        <li key={d.id} className="border p-4 rounded-lg">
                            <Link
                                to={`/guides/edit/${d.id}`}
                                className="text-lg font-semibold hover:underline"
                            >
                                {d.title}
                            </Link>
                            <p className="text-sm text-gray-500">
                                {new Date(d.updatedAt).toLocaleDateString()}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MyDraftsPage;
