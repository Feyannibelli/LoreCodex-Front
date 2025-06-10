// src/pages/guide/CreateGuidePage.tsx
import { useNavigate } from "react-router-dom";
import GuideForm from "@/components/guide/GuideForm";
import guideService from "@/services/guideService";
import { GuideForm as Form } from "@/interfaces/Guide";

const CreateGuidePage: React.FC = () => {
    const navigate = useNavigate();

    /* ------ callbacks ------ */
    const saveDraft = (data: Form) => {
        const payload = { ...data, published: false, draft: true };
        guideService.create(payload).then(g =>
            // lleva directo al editor para seguir
            navigate(`/guides/edit/${g.id}`)
        );
    };

    const publishGuide = (data: Form) => {
        const payload = { ...data, published: true, draft: false };
        guideService.create(payload).then(g =>
            // ya está publicada → detalle
            navigate(`/guides/${g.id}`)
        );
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">New Guide</h1>

            <GuideForm
                submitLabel="Save draft"
                onSubmit={saveDraft}     // botón gris “Save draft”
                onPublish={publishGuide} // botón verde “Publish”
            />
        </div>
    );
};

export default CreateGuidePage;
