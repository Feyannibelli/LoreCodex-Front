// src/pages/EditGuidePage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import RichTextEditor from '@/components/RichTextEditor.tsx';

const EditGuidePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [currentCoverUrl, setCurrentCoverUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGuide = async () => {
            try {
                const response = await axios.get(`http://localhost:8081/guides/${id}`);
                const guide = response.data;
                setTitle(guide.title);
                setContent(guide.content);
                setCurrentCoverUrl(guide.coverImageUrl || '');
            } catch (error) {
                console.error('Error fetching guide:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchGuide();
        }
    }, [id]);

    const handleSubmit = async (publish: boolean) => {
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('isDraft', (!publish).toString());
            formData.append('isPublished', publish.toString());
            if (coverImage) {
                formData.append('coverImage', coverImage);
            }

            await axios.put(`http://localhost:8081/guides/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (publish) {
                navigate(`/guides/${id}`);
            } else {
                //si es q solo guarda como draft, mostramos un mensaje
                console.log('Draft saved!');
            }
        } catch (error) {
            console.error('Error updating guide:', error);
        }
    };

    if (loading) {
        return <div className="p-6 text-center">Loading guide...</div>;
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <button
                className="mb-4 text-sm text-[#f47e00] hover:underline flex items-center gap-1"
                onClick={() => navigate('/my-drafts')}
            >
                <span className="text-lg">←</span> Back to My Drafts
            </button>

            <h1 className="text-2xl font-bold text-[#f47e00] mb-4">Edit Guide</h1>

            <label className="block mb-2 font-semibold">Title *</label>
            <input
                type="text"
                className="w-full border border-gray-300 p-2 rounded mb-4"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Edit your guide title..."
            />

            <label className="block mb-2 font-semibold">Body</label>
            <RichTextEditor content={content} onChange={setContent}/>

            <label className="block mt-4 mb-2 font-semibold">Cover Image</label>
            <div className="flex items-center gap-4 mb-4">
                <button
                    type="button"
                    className="bg-[#f47e00] hover:bg-[#d56b00] text-white py-2 px-4 rounded"
                    onClick={() => document.getElementById('coverImageInput')?.click()}
                >
                    Change Cover Image
                </button>
                {coverImage ? (
                    <span className="text-sm">{coverImage.name}</span>
                ) : currentCoverUrl ? (
                    <img src={currentCoverUrl} alt="Current cover" className="h-16 rounded shadow"/>
                ) : (
                    <span className="text-gray-500 text-sm">No cover image</span>
                )}
            </div>
            <input
                id="coverImageInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    if (e.target.files?.[0]) setCoverImage(e.target.files[0]);
                }}
            />

            <div className="flex gap-4 mt-6">
                <button
                    className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded"
                    onClick={() => handleSubmit(false)}
                >
                    Save Changes
                </button>
                <button
                    className="bg-[#f47e00] hover:bg-[#d56b00] text-white py-2 px-4 rounded"
                    onClick={() => handleSubmit(true)}
                >
                    Publish
                </button>
            </div>
        </div>
    );
};

export default EditGuidePage;
