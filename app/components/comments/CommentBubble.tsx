import { Tooltip, UnstyledButton, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { RichTextEditor } from '@mantine/tiptap';
import { IconTrash, IconPencil, IconDots, IconSourceCode } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { useEditor } from '@tiptap/react';
import { formatDistanceToNow, format } from 'date-fns';
import React, { useState } from 'react';
import { openConfirmModal } from '@/components/modal/confirm';
import { deletePrivateCloudComment, updatePrivateCloudComment } from '@/services/backend/private-cloud/products';
import ProfileImage from '../ProfileImage';
import { commonExtensions } from './TiptapConfig';
import TiptapReadOnly from './TiptapReadOnly';

interface CommentBubbleProps {
  firstName: string;
  lastName: string;
  timeStamp: Date;
  updatedAt: Date;
  text: string;
  isAuthor: boolean;
  commentId: string;
  licencePlate: string;
  refetchComments: () => void;
  email: string;
  image: string;
}

const CommentBubble = ({
  firstName,
  lastName,
  timeStamp,
  updatedAt,
  text,
  isAuthor,
  commentId,
  licencePlate,
  refetchComments,
  email,
  image,
}: CommentBubbleProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedText, setEditedText] = useState(text);

  const editEditor = useEditor({
    extensions: commonExtensions,
    content: text,
    editable: true,
    onUpdate: ({ editor }) => {
      setEditedText(editor.getHTML());
    },
  });

  const editMutation = useMutation({
    mutationFn: () => updatePrivateCloudComment(licencePlate, commentId, editedText),
    onSuccess: () => {
      notifications.show({
        color: 'green',
        title: 'Success',
        message: 'Comment edited successfully',
        autoClose: 5000,
      });
      setEditMode(false);
      refetchComments(); // Refresh the comments
    },
    onError: (error: Error) => {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: `Error updating comment: ${error.message}`,
        autoClose: 5000,
      });
      setEditMode(false);
    },
  });

  const handleEdit = () => {
    setEditMode(true);
    setMenuOpen(false);
  };

  const saveEdit = () => {
    editMutation.mutate();
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditedText(text); // Reset the text to original if the edit is cancelled
  };

  const deleteMutation = useMutation({
    mutationFn: () => deletePrivateCloudComment(licencePlate, commentId),
    onSuccess: () => {
      refetchComments();
      notifications.show({
        color: 'green',
        title: 'Success',
        message: 'Comment deleted successfully',
        autoClose: 5000,
      });
    },
    onError: (error: Error) => {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: `Error: ${error.message}`,
        autoClose: 5000,
      });
    },
  });

  const handleDelete = async () => {
    setMenuOpen(false);
    const res = await openConfirmModal({ content: 'Are you sure you want to delete this comment?' });
    if (res.state.confirmed) {
      deleteMutation.mutate();
    }
  };

  const bubbleStyles =
    'relative max-w-xl mx-auto my-2 bg-white rounded-lg border border-blue-200 flex flex-col items-center';

  const headerStyles =
    'flex justify-between items-center px-4 py-1 rounded-lg bg-blue-100 text-gray-700 text-xs w-full';

  const bodyStyles = 'p-4 text-gray-700 break-words w-full';

  const profileImageWrapperStyles = isAuthor
    ? 'absolute top-0 -right-8 transform translate-x-1/3'
    : 'absolute top-0 -left-6 transform -translate-x-1/2';

  const timeAgo = formatDistanceToNow(timeStamp, { addSuffix: true });
  const timeStampExact = format(new Date(timeStamp), 'PPpp');

  const wasEdited = new Date(timeStamp).getTime() !== new Date(updatedAt).getTime();

  const lastEdited = formatDistanceToNow(new Date(updatedAt), { addSuffix: true });
  const lastEditedExact = format(new Date(updatedAt), 'PPpp');

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className="relative justify-center items-center">
      <div className={bubbleStyles}>
        <div className="flex flex-col w-full">
          <div className={headerStyles}>
            <div>
              <strong>
                {firstName} {lastName}
              </strong>{' '}
              <Tooltip label={`Posted on ${timeStampExact}`}>
                <UnstyledButton className="text-gray-500 cursor-help" style={{ fontSize: '0.75rem' }}>
                  <span className="text-gray-500" style={{ fontSize: '0.75rem' }}>
                    commented {timeAgo}
                  </span>
                </UnstyledButton>
              </Tooltip>
              {wasEdited && (
                <Tooltip label={`Last edited ${lastEdited} on ${lastEditedExact}`}>
                  <UnstyledButton className="text-gray-500 cursor-help">
                    <IconPencil className="inline-block mr-1" style={{ fontSize: '0.75rem' }} />
                  </UnstyledButton>
                </Tooltip>
              )}
            </div>
            {isAuthor && (
              <button onClick={toggleMenu} className="p-1 rounded-full hover:bg-blue-200">
                <IconDots className="inline-block text-gray-500" />
              </button>
            )}
          </div>
          {menuOpen && (
            <div className="absolute right-0 mt-10 py-1 w-48 bg-white rounded-md shadow-lg z-50">
              <button
                onClick={handleEdit}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <IconPencil className="inline-block mr-2" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                aria-label="Delete comment"
              >
                <IconTrash className="inline-block mr-2" />
                Delete
              </button>
            </div>
          )}
          <div className={bodyStyles}>
            {editMode ? (
              <>
                <RichTextEditor editor={editEditor} className="mb-2.5 tiptap">
                  {editEditor && (
                    <RichTextEditor.Toolbar>
                      <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Bold />
                        <RichTextEditor.Underline />
                        <RichTextEditor.Strikethrough />
                        <RichTextEditor.Code />
                      </RichTextEditor.ControlsGroup>

                      <RichTextEditor.ControlsGroup>
                        <RichTextEditor.CodeBlock
                          icon={({ style }) => (
                            <IconSourceCode style={{ ...style, strokeWidth: 1.5 }} className="text-xl" />
                          )}
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
                  )}
                  <RichTextEditor.Content />
                </RichTextEditor>
                <div className="flex justify-around p-2">
                  <Button variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                  <Button
                    variant="filled"
                    onClick={saveEdit}
                    disabled={editedText === text} // Disable the button if there are no changes
                  >
                    Save
                  </Button>
                </div>
              </>
            ) : (
              <TiptapReadOnly content={text} /> // Use the read-only Tiptap component to render the comment
            )}
          </div>
        </div>
        <div className={profileImageWrapperStyles}>
          <ProfileImage email={email} image={image} className="rounded-full" size={40} />
        </div>
      </div>
    </div>
  );
};

export default CommentBubble;
