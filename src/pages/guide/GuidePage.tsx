import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import guideService from "@/services/guideService";
import { Guide } from "@/interfaces/Guide";
import { useAuth } from "@/context/AuthContext";

const GuidePage: React.FC = () => {
    const [guides, setGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        guideService.getPublic().then(setGuides).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-4">Loading…</div>;

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Guides</h1>
                {isAuthenticated && (
                    <Link
                        to="/guides/create"
                        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                    >
                        + New Guide
                    </Link>
                )}
            </div>

            {guides.length === 0 ? (
                <p>No guides yet.</p>
            ) : (
                <ul className="space-y-4">
                    {guides.map(g => (
                        <li key={g.id} className="border p-4 rounded-lg">
                            <Link
                                to={`/guides/${g.id}`}
                                className="text-xl font-semibold hover:underline"
                            >
                                {g.title}
                            </Link>
                            <p className="text-sm text-gray-500">
                                {new Date(g.createdAt).toLocaleDateString()}
                            </p>
                            <p className="line-clamp-3">{g.content}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default GuidePage;
