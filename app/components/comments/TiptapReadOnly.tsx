'use client';
import Blockquote from '@tiptap/extension-blockquote';
import Bold from '@tiptap/extension-bold';
import BulletList from '@tiptap/extension-bullet-list';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import Link from '@tiptap/extension-link';
import ListItem from '@tiptap/extension-list-item';
import OrderedList from '@tiptap/extension-ordered-list';
import Strike from '@tiptap/extension-strike';
import Underline from '@tiptap/extension-underline';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import './tiptap.css';

interface TiptapReadOnlyProps {
  content: string;
}

const TiptapReadOnly: React.FC<TiptapReadOnlyProps> = ({ content }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      CodeBlock,
      Code,
      Link,
      Underline,
      Strike,
      Bold,
      BulletList.configure({
        HTMLAttributes: {
          class: 'list-disc pl-6',
        },
        keepMarks: true,
        keepAttributes: true,
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal pl-6',
        },
        keepMarks: true,
        keepAttributes: true,
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-gray-300 pl-4 text-gray-600 bg-gray-100 rounded-md',
        },
      }),
      ListItem,
    ],
    content: content,
    editable: false, // Always read-only
  });

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(content, false); // Set the editor content without emitting an update event
    }
  }, [content, editor]);

  return <EditorContent editor={editor} className="tiptap" />;
};

export default TiptapReadOnly;
