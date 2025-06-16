import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import guideService from "../../services/guideService.ts";
import {Guide, GuideForm as Form} from "../../interfaces/Guide";
import GuideForm from "../../components/guide/GuideForm.tsx";


const EditGuidePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [guide, setGuide] = useState<Guide | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (id) guideService.getById(+id).then(setGuide);
    }, [id]);

    if (!guide) return <div className="p-4">Loading…</div>;

    /* --- callbacks --- */
    const saveDraft = (data: Form) => {
        const payload = { ...data, coverImageUrl: data.coverImageUrl ?? undefined, published: false, draft: true };
        guideService.update(guide.id, payload).then(g => navigate(`/guides/${g.id}`));
    };

    const publishGuide = (data: Form) => {
        const payload = { ...data, coverImageUrl: data.coverImageUrl ?? undefined, published: true, draft: false };
        guideService.update(guide.id, payload).then(g => navigate(`/guides/${g.id}`));
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Edit Guide</h1>
            <GuideForm
                initial={{
                    title: guide.title,
                    content: guide.content,
                    coverImageUrl: guide.coverImageUrl ?? "",
                    tags: guide.tags,
                    published: guide.published,
                    draft: guide.draft,
                }}
                submitLabel="Save draft"
                onSubmit={saveDraft}     // botón gris “Save draft”
                onPublish={publishGuide} // botón verde “Publish”
            />
        </div>
    );
};

export default EditGuidePage;
