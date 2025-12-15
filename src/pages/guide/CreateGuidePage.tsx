// src/pages/guide/CreateGuidePage.tsx
import { useNavigate } from "react-router-dom";
import guideService from "../../services/guideService.ts";
import { GuideForm as Form } from "../../interfaces/Guide";
import GuideForm from "../../components/guide/GuideForm.tsx";

const CreateGuidePage: React.FC = () => {
    const navigate = useNavigate();

    /* ------ callbacks ------ */
    const saveDraft = (data: Form) => {
        const payload = { ...data, published: false, draft: true };
        guideService.create(payload).then(g =>
            navigate(`/guides/edit/${g.id}`)
        );
    };

    const publishGuide = (data: Form) => {
        const payload = { ...data, published: true, draft: false };
        guideService.create(payload).then(g =>
            navigate(`/guides/${g.id}`)
        );
    };

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Guides", href: "/guides" },
        { label: "Create New Guide" }
    ];

    return (
        <GuideForm
            pageTitle="Create New Guide"
            breadcrumbs={breadcrumbs}
            submitLabel="Save Draft"
            onSubmit={saveDraft}
            onPublish={publishGuide}
            publishLabel="Publish Guide"
        />
    );
};

export default CreateGuidePage;
