import { Button } from '@mantine/core';
import { RichTextEditor } from '@mantine/tiptap';
import { IconMessageCirclePlus, IconX, IconSend, IconSourceCode } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import Placeholder from '@tiptap/extension-placeholder';
import { useEditor } from '@tiptap/react';
import React, { useState, useEffect } from 'react';
import { createPrivateCloudComment } from '@/services/backend/private-cloud/products';
import { failure, success } from '../notification';
import { commonExtensions } from './TiptapConfig';

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
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);

  const editorInstance = useEditor({
    extensions: [
      ...commonExtensions,
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
    if (editorInstance) {
      const hasText = editorInstance.getText().trim().length > 0;
      setIsEditorEmpty(!hasText);
    }
  }, [editorInstance?.state.doc.content.size, editorInstance]);

  const mutation = useMutation({
    mutationFn: () =>
      createPrivateCloudComment(licencePlate, editorInstance?.getHTML() ?? '', userId, projectId, requestId),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      onCommentAdded();
      editorInstance?.commands.clearContent();
      setLoading(false);
      setShowCommentBox(false);
      success();
    },
    onError: (error: Error) => {
      setLoading(false);
      failure({ error });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isEditorEmpty) {
      success({ message: 'Cannot post empty content', autoClose: true });
    } else {
      mutation.mutate();
    }
  };

  const handleCancel = () => {
    editorInstance?.commands.clearContent();
    setShowCommentBox(false);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-xl px-4">
        {!showCommentBox && (
          <div className="flex justify-end mb-2 transition-opacity duration-500 ease-in-out">
            <Button
              onClick={() => setShowCommentBox(true)}
              className="flex items-center px-5 py-2.5 bg-yellow-400 border-none rounded cursor-pointer transition-transform duration-500 ease-in-out transform hover:scale-105 hover:bg-yellow-500 text-black hover:text-black font-normal"
              leftSection={<IconMessageCirclePlus className="mr-2 text-black" />}
            >
              {addButtonText}
            </Button>
          </div>
        )}

        {showCommentBox && (
          <form onSubmit={handleSubmit} className="relative transition-opacity duration-500 ease-in-out opacity-100">
            <RichTextEditor editor={editorInstance} className="mb-2.5 tiptap">
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
