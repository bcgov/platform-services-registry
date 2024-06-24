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
import StarterKit from '@tiptap/starter-kit';

export const commonExtensions = [
  StarterKit.configure({
    history: {},
  }),
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
      class: 'border-l-4 border-gray-300 pl-4',
    },
  }),
  ListItem,
];
