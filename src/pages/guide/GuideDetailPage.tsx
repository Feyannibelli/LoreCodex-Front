// src/pages/GuideDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import guideService from "@/services/guideService.ts";
import '@/css/Guide.css';

const GuideDetailPage = () => {
    const { id } = useParams();
    const [guide, setGuide] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        guideService.getGuideById(id)
            .then(setGuide)
            .catch(err => {
                console.error("Error fetching guide:", err);
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="p-6 text-center">Cargando guía...</div>;
    if (!guide) return <div className="p-6 text-center">No se encontró la guía</div>;

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-[#f47e00] mb-6">{guide.title}</h1>
            {guide.coverImageUrl && (
                <img
                    src={guide.coverImageUrl}
                    alt="Cover"
                    className="w-full max-h-80 object-cover rounded mb-6"
                />
            )}
            <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: guide.content }}
            />
        </div>
    );
};

export default GuideDetailPage;
