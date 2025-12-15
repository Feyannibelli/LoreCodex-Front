import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import newsService from "@/services/newsService.ts";
import NewsForm from "@/components/news/NewsForm";
import { NewsForm as FormValues } from "@/interfaces/News.ts";
import { useAuth } from "@/context/AuthContext";

const CreateNewsPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <p className="text-muted-foreground">You must be logged in to create news.</p>
            </div>
        );
    }

    const handleCreate = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            const res = await newsService.create(data);
            navigate(`/news/${res.data.id}`);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const breadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'News', href: '/news' },
        { label: 'Create Article' },
    ];

    return (
        <NewsForm
            pageTitle="Write New Article"
            breadcrumbs={breadcrumbs}
            submitLabel="Publish Article"
            onSubmit={handleCreate}
            isSubmitting={isSubmitting}
        />
    );
};

export default CreateNewsPage;
