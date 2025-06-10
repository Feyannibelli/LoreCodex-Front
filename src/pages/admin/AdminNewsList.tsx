import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import newsService from "@/services/newsService.ts";
import { News } from "@/interfaces/News.ts";

const AdminNewsList: React.FC = () => {
    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const load = async () => {
        const res = await newsService.getAll();
        setNews(res.data);
        setLoading(false);
    };

    useEffect(() => {
        load();               // si se ejecuta, pero el efecto devuelve void
    }, []);

    if (loading) return <div className="p-4">Loading…</div>;

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Admin News</h1>
                <Link
                    to="/admin/news/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + New
                </Link>
            </div>

            <table className="min-w-full border">
                <thead className="bg-gray-100 text-left">
                <tr>
                    <th className="p-2">ID</th>
                    <th className="p-2">Title</th>
                    <th className="p-2">Published</th>
                    <th className="p-2">Likes</th>
                    <th className="p-2">Actions</th>
                </tr>
                </thead>
                <tbody>
                {news.map(n => (
                    <tr key={n.id} className="border-t">
                        <td className="p-2">{n.id}</td>
                        <td className="p-2">
                            <Link to={`/news/${n.id}`} className="hover:underline">
                                {n.title}
                            </Link>
                        </td>
                        <td className="p-2">{n.published ? "Yes" : "No"}</td>
                        <td className="p-2">{n.likes}</td>
                        <td className="p-2 space-x-2">
                            {n.published ? (
                                <button
                                    onClick={() =>
                                        newsService.unpublish(n.id).then(load)
                                    }
                                    className="text-sm bg-yellow-500 text-white px-2 py-1 rounded"
                                >
                                    Unpublish
                                </button>
                            ) : (
                                <button
                                    onClick={() =>
                                        newsService.publish(n.id).then(load)
                                    }
                                    className="text-sm bg-green-600 text-white px-2 py-1 rounded"
                                >
                                    Publish
                                </button>
                            )}

                            <button
                                onClick={() => navigate(`/admin/news/edit/${n.id}`)}
                                className="text-sm bg-gray-500 text-white px-2 py-1 rounded"
                            >
                                Edit
                            </button>

                            <button
                                onClick={() => {
                                    if (confirm("Delete?"))
                                        newsService.delete(n.id).then(load);
                                }}
                                className="text-sm bg-red-600 text-white px-2 py-1 rounded"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminNewsList;
