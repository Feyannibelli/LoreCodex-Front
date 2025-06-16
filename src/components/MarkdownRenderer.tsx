// src/components/MarkdownRenderer.tsx
interface MarkdownRendererProps {
    content: string;
    className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
                                                               content,
                                                               className = "prose prose-slate dark:prose-invert max-w-none"
                                                           }) => {
    // Función para convertir markdown a HTML (misma lógica que en el editor)
    const parseMarkdown = (text: string): string => {
        let html = text;

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2 mt-4">$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3 mt-4">$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 mt-4">$1</h1>');

        // Bold
        html = html.replace(/\*\*(.*)\*\*/gim, '<strong class="font-bold">$1</strong>');

        // Italic
        html = html.replace(/\*(.*)\*/gim, '<em class="italic">$1</em>');

        // Code inline
        html = html.replace(/`([^`]*)`/gim, '<code class="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono">$1</code>');

        // Links
        html = html.replace(/\[([^\]]*)\]\(([^)]*)\)/gim, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

        // Lists
        html = html.replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc">$1</li>');
        html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>');

        // Blockquotes
        html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 dark:text-gray-400 my-2">$1</blockquote>');

        // Line breaks
        html = html.replace(/\n/gim, '<br>');

        return html;
    };

    return (
        <div
            className={className}
            dangerouslySetInnerHTML={{
                __html: parseMarkdown(content)
            }}
        />
    );
};

export default MarkdownRenderer;