import { useNavigate } from "react-router-dom";
import newsService from "@/services/newsService.ts";
import NewsForm from "@/components/NewsForm";
import { NewsForm as FormValues } from "@/interfaces/News.ts";

const CreateNewsPage: React.FC = () => {
    const navigate = useNavigate();

    const handleCreate = (data: FormValues) => {
        newsService.create(data).then(res => {
            // opcional: publicar directamente
            navigate(`/news/${res.data.id}`);
        });
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Create News</h1>
            <NewsForm submitLabel="Create" onSubmit={handleCreate} />
        </div>
    );
};

export default CreateNewsPage;
