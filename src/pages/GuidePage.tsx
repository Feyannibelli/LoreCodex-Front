// src/pages/GuidePage.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const GuidePage = () => {
    const [guides, setGuides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("http://localhost:8081/guides/published") // ⭐ Cambiamos a published
            .then(response => {
                setGuides(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching guides:", error);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-6 text-center">Cargando guías...</div>;

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
                        <div
                            key={guide.id}
                            className="flex gap-6 items-start border rounded-lg p-4 hover:shadow-lg transition"
                        >
                            {guide.coverImageUrl && (
                                <img
                                    src={guide.coverImageUrl}
                                    alt="Cover"
                                    className="w-40 h-28 object-cover rounded-md"
                                />
                            )}
                            <div className="flex-1">
                                <h2 className="text-2xl font-semibold mb-1">{guide.title}</h2>
                                <p className="text-gray-600 mb-2 text-sm">
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
