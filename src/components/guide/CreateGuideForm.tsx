import React, { useState } from 'react';
import axios from 'axios';

const CreateGuideForm: React.FC = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token'); // Asumiendo que guardás el token en localStorage
            await axios.post(
                'http://localhost:8081/guides/create',
                {
                    title,
                    content,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert('Guide created successfully!');
            setTitle('');
            setContent('');
        } catch (error) {
            console.error('Error creating guide:', error);
            alert('Failed to create guide');
        }
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Create a New Guide</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border rounded p-2"
                    required
                />
                <textarea
                    placeholder="Content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="border rounded p-2 h-40"
                    required
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                    Create Guide
                </button>
            </form>
        </div>
    );
};

export default CreateGuideForm;
