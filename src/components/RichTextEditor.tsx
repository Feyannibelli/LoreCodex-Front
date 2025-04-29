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

import "../css/RichTextEditor.css";

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
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) return null;

    return (
        <div className="editor-container">
            <div className="toolbar">
                <button onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
                <button onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
                <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
                <button onClick={() => editor.chain().focus().toggleBlockquote().run()}>Quote</button>
                <button onClick={() => editor.chain().focus().toggleCode().run()}>Code</button>
                <button onClick={() => editor.chain().focus().toggleCodeBlock().run()}>Code Block</button>
                <button onClick={() => editor.commands.setImage({ src: prompt('Enter image URL') || '' })}>Image</button>
            </div>

            <EditorContent editor={editor} className="editor-content" />
        </div>
    );
};

export default RichTextEditor;
