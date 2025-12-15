import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import Blockquote from '@tiptap/extension-blockquote';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import { Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code as CodeIcon, Terminal, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

const RichTextEditor = ({ content, onChange }: { content: string, onChange: (html: string) => void }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: false }), // desactivamos el por defecto
            Heading.configure({ levels: [1, 2, 3] }),
            Image,
            Code,
            CodeBlock,
            Blockquote,
            BulletList,
            OrderedList,
            ListItem,
        ],
        content,
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] p-4 text-foreground'
            }
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) return null;

    const ToolbarButton = ({ onClick, isActive = false, children, title }: any) => (
        <button
            onClick={(e) => { e.preventDefault(); onClick(); }}
            className={cn(
                "p-2 rounded hover:bg-secondary hover:text-foreground transition-colors",
                isActive ? "bg-secondary text-primary" : "text-muted-foreground"
            )}
            title={title}
        >
            {children}
        </button>
    );

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="flex flex-wrap items-center gap-1 border-b border-border bg-secondary/20 p-2">
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
                    <Bold className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
                    <Italic className="h-4 w-4" />
                </ToolbarButton>
                <div className="w-px h-6 bg-border mx-1" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
                    <Heading1 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
                    <Heading2 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
                    <Heading3 className="h-4 w-4" />
                </ToolbarButton>
                <div className="w-px h-6 bg-border mx-1" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
                    <List className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered List">
                    <ListOrdered className="h-4 w-4" />
                </ToolbarButton>
                <div className="w-px h-6 bg-border mx-1" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Quote">
                    <Quote className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Code">
                    <CodeIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code Block">
                    <Terminal className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => {
                    const url = window.prompt('Enter image URL');
                    if (url) editor.chain().focus().setImage({ src: url }).run();
                }} title="Image">
                    <ImageIcon className="h-4 w-4" />
                </ToolbarButton>
            </div>

            <div className="bg-card">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};

export default RichTextEditor;
