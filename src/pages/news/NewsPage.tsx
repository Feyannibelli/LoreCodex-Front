import { useEffect, useState } from "react";
import newsService from "../../services/newsService.ts";
import { Link } from "react-router-dom";
import {News} from "@/interfaces/News.ts";

const NewsPage: React.FC = () => {
    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        newsService.getAll()
            .then(res => setNews(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-4">Loading news…</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">News</h1>

            {news.length === 0 && <p>No news yet.</p>}

            <ul className="space-y-4">
                {news.map(item => (
                    <li key={item.id} className="border p-4 rounded-lg">
                        <h2 className="text-xl font-semibold">
                            <Link to={`/news/${item.id}`} className="hover:underline">
                                {item.title}
                            </Link>
                        </h2>
                        <p className="text-sm text-gray-500 mb-2">
                            {new Date(item.createdAt).toLocaleDateString()} • {item.likes} likes
                        </p>
                        <p className="line-clamp-3">{item.content}</p>
                        {item.tags?.length > 0 && (
                            <div className="mt-2 flex gap-2 flex-wrap">
                                {item.tags.map(tag => (
                                    <span key={tag}
                                          className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    #{tag}
                  </span>
                                ))}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NewsPage;
