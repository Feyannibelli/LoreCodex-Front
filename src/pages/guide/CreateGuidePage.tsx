import { useState } from "react";
import { useNavigate } from "react-router-dom";
import guideService from "../../services/guideService.ts";
import { GuideForm as Form } from "../../interfaces/Guide";
import GuideForm from "../../components/guide/GuideForm.tsx";
import { AlertCircle } from "lucide-react";

const CreateGuidePage: React.FC = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    /* ------ callbacks ------ */
    const saveDraft = async (data: Form) => {
        setError(null);
        setLoading(true);

        try {
            const payload = { ...data, published: false, draft: true };
            const guide = await guideService.create(payload);
            navigate(`/guides/edit/${guide.id}`);
        } catch (err: any) {
            console.error("Error saving draft:", err);
            setError(err.response?.data?.message || "Error al guardar el borrador. Por favor intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const publishGuide = async (data: Form) => {
        setError(null);
        setLoading(true);

        try {
            const payload = { ...data, published: true, draft: false };
            const guide = await guideService.create(payload);

            // Navegar y recargar para actualizar listas
            navigate(`/guides/${guide.id}`);
            setTimeout(() => window.location.reload(), 100);
        } catch (err: any) {
            console.error("Error publishing guide:", err);
            setError(err.response?.data?.message || "Error al publicar la guía. Por favor intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Nueva Guía</h1>

            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                    <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                        <p className="text-sm text-red-800 dark:text-red-200 font-medium">Error</p>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                    </div>
                </div>
            )}

            {loading && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-blue-800 dark:text-blue-200">Guardando guía...</p>
                </div>
            )}

            <GuideForm
                submitLabel="Guardar Borrador"
                onSubmit={saveDraft}
                onPublish={publishGuide}
                publishLabel="Publicar Guía"
            />
        </div>
    );
};

export default CreateGuidePage;
