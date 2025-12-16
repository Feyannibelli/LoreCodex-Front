// src/pages/guide/CreateGuidePage.tsx
import { useNavigate } from "react-router-dom";
import guideService from "../../services/guideService.ts";
import { GuideForm as Form } from "../../interfaces/Guide";
import GuideForm from "../../components/guide/GuideForm.tsx";

const CreateGuidePage: React.FC = () => {
    const navigate = useNavigate();

    /* ------ callbacks ------ */
    const handleCreate = (data: Form) => {
        // Backend forces draft=true, published=false on create regardless of what we send, 
        // but we send explicit draft flags for clarity/consistency.
        const payload = { ...data, published: false, draft: true };
        guideService.create(payload).then(g =>
            navigate(`/guides/edit/${g.id}`)
        );
    };

    return (
        <GuideForm
            pageTitle="Create New Guide"
            breadcrumbs={[]}
            submitLabel="Create Guide"
            onSubmit={handleCreate}
        // Removed onPublish since all new guides start as drafts
        />
    );
};

export default CreateGuidePage;
