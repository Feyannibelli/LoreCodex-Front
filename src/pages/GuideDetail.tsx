import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const GuideDetail = () => {
    const { id } = useParams();
    const [guide, setGuide] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://localhost:8081/guides/${id}`)
            .then(response => {
                setGuide(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching guide:", error);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div>Cargando guía...</div>;
    if (!guide) return <div>No se encontró la guía</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold">{guide.title}</h1>
            <p className="mt-4">{guide.content}</p>
        </div>
    );
};

export default GuideDetail;
