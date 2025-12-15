import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import newsService from "@/services/newsService";
import { News } from "@/interfaces/News";
import NewsForm from "@/components/news/NewsForm";
import { NewsForm as FormValues } from "@/interfaces/News";
import { useAuth } from "@/context/AuthContext";

const EditNewsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [news, setNews] = useState<News | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (id) {
            newsService.getById(parseInt(id)).then(res => {
                setNews(res.data);
                setLoading(false);
            }).catch(() => setLoading(false));
        }
    }, [id, isAuthenticated]);

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
    if (!news) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">News not found</p></div>;

    const handleUpdate = async (data: FormValues) => {
        if (!news) return;
        setIsSubmitting(true);
        try {
            await newsService.update(news.id, data);
            navigate(`/news/${news.id}`);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const breadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'News', href: '/news' },
        { label: `Edit: ${news.title}` },
    ];

    // Adapt News to NewsForm data
    const initialData: FormValues = {
        title: news.title,
        content: news.content,
        coverImage: news.coverImage ?? "",
        tags: news.tags,
    };

    return (
        <NewsForm
            pageTitle="Edit Article"
            breadcrumbs={breadcrumbs}
            initialData={initialData}
            submitLabel="Save Changes"
            onSubmit={handleUpdate}
            isSubmitting={isSubmitting}
        />
    );
};

export default EditNewsPage;
