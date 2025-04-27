// src/pages/GuidePage.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const GuidePage: React.FC = () => {
    const [guides, setGuides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("http://localhost:8080/guides")
            .then(response => {
                setGuides(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching guides:", error);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="text-center mt-10">Cargando guías...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Guías</h1>
                {/* Botón para ir a crear una nueva guía */}
                <Link
                    to="/guides/create"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                    Crear Guía
                </Link>
            </div>

            {guides.length === 0 ? (
                <p>No hay guías todavía.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {guides.map((guide) => (
                        <div key={guide.id} className="border rounded-xl p-4 shadow hover:shadow-lg transition">
                            <h2 className="text-xl font-semibold mb-2">{guide.title}</h2>
                            <p className="text-gray-600 mb-4">
                                {guide.content.length > 100
                                    ? guide.content.slice(0, 100) + "..."
                                    : guide.content}
                            </p>
                            {/* Botón para ver detalles */}
                            <Link
                                to={`/guides/${guide.id}`}
                                className="text-blue-500 hover:underline"
                            >
                                Ver más
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GuidePage;
