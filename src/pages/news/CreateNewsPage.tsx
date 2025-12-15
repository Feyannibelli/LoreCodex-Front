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
            console.log('Creating news with data:', data);
            const res = await newsService.create(data);
            console.log('News created successfully:', res.data);

            // Check if response has the expected structure
            if (res.data && res.data.id) {
                navigate(`/news/${res.data.id}`);
            } else {
                console.error('Unexpected response structure:', res);
                alert('News created but unable to navigate. Response: ' + JSON.stringify(res.data));
            }
        } catch (error: any) {
            console.error('Error creating news:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);

            const errorMessage = error.response?.data?.message || error.message || 'Failed to create news article';
            alert(`Error: ${errorMessage}`);
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
