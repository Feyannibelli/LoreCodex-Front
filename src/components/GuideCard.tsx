// src/components/GuideCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Guide {
    id: number;
    title: string;
    content: string;
    coverImageUrl?: string;
    gameId: number;
    gameName?: string;
    authorName?: string;
    createdAt: string;
    updatedAt: string;
}

interface GuideCardProps {
    guide: Guide;
}

const GuideCard: React.FC<GuideCardProps> = ({ guide }) => {
    const navigate = useNavigate();

    // Create a snippet from markdown content (remove markdown syntax)
    const createSnippet = (content: string, maxLength: number = 150): string => {
        // Remove common markdown syntax
        const plainText = content
            .replace(/#{1,6}\s+/g, '') // Remove headers
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.*?)\*/g, '$1') // Remove italic
            .replace(/`(.*?)`/g, '$1') // Remove inline code
            .replace(/```[\s\S]*?```/g, '[Code Block]') // Replace code blocks
            .replace(/!\[.*?\]\(.*?\)/g, '[Image]') // Replace images
            .replace(/\[.*?\]\(.*?\)/g, '[Link]') // Replace links
            .replace(/>\s+(.*)/g, '$1') // Remove blockquotes
            .replace(/[-*+]\s+/g, '') // Remove list markers
            .replace(/\d+\.\s+/g, '') // Remove numbered list markers
            .replace(/\n+/g, ' ') // Replace newlines with spaces
            .trim();

        return plainText.length > maxLength
            ? plainText.substring(0, maxLength) + '...'
            : plainText;
    };

    const handleClick = () => {
        navigate(`/guides/${guide.id}`);
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div
            className="guide-card cursor-pointer hover:shadow-lg transition-shadow duration-300"
            onClick={handleClick}
        >
            {/* Cover Image */}
            <div className="w-40 h-28 flex-shrink-0">
                {guide.coverImageUrl ? (
                    <img
                        src={guide.coverImageUrl}
                        alt={guide.title}
                        className="guide-cover"
                        onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            e.currentTarget.src = '/api/placeholder/160/112';
                        }}
                    />
                ) : (
                    <div className="guide-cover bg-gray-200 flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    </div>
                )}
            </div>

            {/* Guide Info */}
            <div className="flex-1 min-w-0">
                <h3 className="guide-title">{guide.title}</h3>

                <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                    {guide.gameName && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {guide.gameName}
                        </span>
                    )}
                    {guide.authorName && (
                        <span>by {guide.authorName}</span>
                    )}
                </div>

                <p className="guide-snippet">{createSnippet(guide.content)}</p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Created: {formatDate(guide.createdAt)}</span>
                    {guide.updatedAt !== guide.createdAt && (
                        <span>Updated: {formatDate(guide.updatedAt)}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GuideCard;