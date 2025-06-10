import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import newsService from "@/services/newsService";
import { News } from "@/interfaces/News";
import NewsForm from "@/components/NewsForm";
import { NewsForm as FormValues } from "@/interfaces/News";

const EditNewsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [news, setNews] = useState<News | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (id) newsService.getById(parseInt(id)).then(res => setNews(res.data));
    }, [id]);

    if (!news) return <div className="p-4">Loading…</div>;

    const handleUpdate = (data: FormValues) => {
        newsService.update(news.id, data).then(() => navigate(`/news/${news.id}`));
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Edit News</h1>
            <NewsForm
                initial={{
                    title: news.title,
                    content: news.content,
                    coverImage: news.coverImage ?? "",
                    tags: news.tags,
                }}
                submitLabel="Save changes"
                onSubmit={handleUpdate}
            />
        </div>
    );
};

export default EditNewsPage;
