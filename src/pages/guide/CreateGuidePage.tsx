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
        <div className="min-h-screen bg-background py-10 mb-20">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <p className="text-sm font-bold uppercase tracking-widest text-primary/80 mb-2">
                        Authoring
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                        Create New Guide
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Share your knowledge with the community. Drafts are saved automatically.
                    </p>
                </div>

                <div className="bg-card border border-white/5 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
                    <div className="p-6 md:p-8">
                        <GuideForm
                            submitLabel="Save Draft"
                            onSubmit={saveDraft}
                            onPublish={publishGuide}
                            publishLabel="Publish Guide"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateGuidePage;
