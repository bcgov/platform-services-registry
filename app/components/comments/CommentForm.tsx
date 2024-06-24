import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { RichTextEditor } from '@mantine/tiptap';
import { IconMessageCirclePlus, IconX, IconSend, IconSourceCode } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import Blockquote from '@tiptap/extension-blockquote';
import Bold from '@tiptap/extension-bold';
import BulletList from '@tiptap/extension-bullet-list';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import Link from '@tiptap/extension-link';
import ListItem from '@tiptap/extension-list-item';
import OrderedList from '@tiptap/extension-ordered-list';
import Placeholder from '@tiptap/extension-placeholder';
import Strike from '@tiptap/extension-strike';
import Underline from '@tiptap/extension-underline';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useState, useEffect } from 'react';
import './tiptap.css';
import { createPrivateCloudComment } from '@/services/backend/private-cloud/products';

interface CommentFormProps {
  licencePlate: string;
  userId: string;
  projectId?: string;
  requestId?: string;
  onCommentAdded: () => void;
  addButtonText: string;
  postButtonText: string;
  placeholderText: string;
}

function CommentForm({
  licencePlate,
  userId,
  projectId,
  requestId,
  onCommentAdded,
  addButtonText,
  postButtonText,
  placeholderText,
}: CommentFormProps) {
  const [isLoading, setLoading] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false); // State to toggle comment box visibility
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);

  const commentEditor = useEditor({
    extensions: [
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
          class: 'tiptap-list',
        },
        keepMarks: true,
        keepAttributes: true,
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'tiptap-list',
        },
        keepMarks: true,
        keepAttributes: true,
      }),
      Blockquote,
      ListItem,
      Placeholder.configure({
        placeholder: placeholderText,
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const hasText = editor.getText().trim().length > 0;
      setIsEditorEmpty(!hasText);
    },
  });

  useEffect(() => {
    if (commentEditor) {
      const hasText = commentEditor.getText().trim().length > 0;
      setIsEditorEmpty(!hasText);
    }
  }, [commentEditor]);

  const mutation = useMutation({
    mutationFn: () =>
      createPrivateCloudComment(licencePlate, commentEditor?.getHTML() ?? '', userId, projectId, requestId),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      onCommentAdded();
      commentEditor?.commands.clearContent();
      setLoading(false);
      setShowCommentBox(false); // Hide the comment box after submitting
      notifications.show({
        color: 'green',
        title: 'Success',
        message: 'Comment added successfully',
        autoClose: 5000,
      });
    },
    onError: (error: Error) => {
      console.error('Failed to add comment:', error);
      setLoading(false);
      notifications.show({
        color: 'red',
        title: 'Error',
        message: `Failed to add comment: ${error.message}`,
        autoClose: 5000,
      });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isEditorEmpty) {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'Cannot post empty content',
        autoClose: 5000,
      });
    } else {
      mutation.mutate();
    }
  };

  const handleCancel = () => {
    commentEditor?.commands.clearContent();
    setShowCommentBox(false);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-xl px-4">
        {!showCommentBox && (
          <div className="flex justify-end mb-2 transition-opacity duration-500 ease-in-out">
            <Button
              onClick={() => setShowCommentBox(true)} // Show the comment box
              className="flex items-center px-5 py-2.5 bg-yellow-400 border-none rounded cursor-pointer transition-transform duration-500 ease-in-out transform hover:scale-105 hover:bg-yellow-500 text-black hover:text-black font-normal"
              leftSection={<IconMessageCirclePlus className="mr-2 text-black" />}
            >
              {addButtonText}
            </Button>
          </div>
        )}

        {showCommentBox && (
          <form onSubmit={handleSubmit} className="relative transition-opacity duration-500 ease-in-out opacity-100">
            <RichTextEditor editor={commentEditor} className="mb-2.5 tiptap">
              <RichTextEditor.Toolbar>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Bold />
                  <RichTextEditor.Underline />
                  <RichTextEditor.Strikethrough />
                  <RichTextEditor.Code />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.CodeBlock
                    icon={({ style }) => <IconSourceCode style={{ ...style, strokeWidth: 1.5 }} className="text-xl" />}
                  />
                  <RichTextEditor.Blockquote />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Link />
                  <RichTextEditor.Unlink />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.BulletList />
                  <RichTextEditor.OrderedList />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Undo />
                  <RichTextEditor.Redo />
                </RichTextEditor.ControlsGroup>
              </RichTextEditor.Toolbar>
              <RichTextEditor.Content />
            </RichTextEditor>

            <IconX
              className="absolute top-2 right-2 cursor-pointer text-gray-500 hover:text-gray-700"
              onClick={handleCancel}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                className="flex items-center px-5 py-2.5 bg-yellow-400 border-none rounded cursor-pointer transition-transform duration-500 ease-in-out transform hover:scale-105 hover:bg-yellow-500 text-black hover:text-black font-normal"
                disabled={isLoading}
                leftSection={<IconSend className="mr-2 text-black" />}
              >
                {postButtonText}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default CommentForm;
