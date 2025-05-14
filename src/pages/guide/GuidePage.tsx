// src/pages/GuidePage.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import guideService from "@/services/guideService.ts";
import '@/css/Guide.css';

const GuidePage = () => {
    const [guides, setGuides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        guideService.getPublishedGuides()
            .then(setGuides)
            .catch(err => console.error("Error fetching guides:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-6 text-center">Loading guides...</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-[#f47e00]">Guides</h1>
                <Link
                    to="/guides/create"
                    className="bg-[#f47e00] hover:bg-[#d56b00] text-white py-2 px-4 rounded"
                >
                    Create Guide
                </Link>
            </div>

            {guides.length === 0 ? (
                <p>No published guides yet.</p>
            ) : (
                <div className="space-y-8">
                    {guides.map(guide => (
                        <div key={guide.id} className="guide-card">
                            {guide.coverImageUrl && (
                                <img
                                    src={guide.coverImageUrl}
                                    alt="Cover"
                                    className="guide-cover"
                                />
                            )}
                            <div className="flex-1">
                                <h2 className="guide-title">{guide.title}</h2>
                                <p className="guide-snippet">
                                    {guide.content.length > 150
                                        ? guide.content.slice(0, 150) + "..."
                                        : guide.content}
                                </p>
                                <Link
                                    to={`/guides/${guide.id}`}
                                    className="text-blue-600 hover:underline text-sm font-semibold"
                                >
                                    View guide →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GuidePage;
