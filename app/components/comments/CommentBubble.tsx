import { Tooltip, UnstyledButton } from '@mantine/core';
import { IconTrash, IconPencil, IconDots } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { formatDistanceToNow, format } from 'date-fns';
import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { deletePrivateCloudComment, updatePrivateCloudComment } from '@/services/backend/private-cloud/products';
import AlertBox from '../modal/AlertBox';
import ProfileImage from '../ProfileImage';

interface CommentBubbleProps {
  firstName: string;
  lastName: string;
  timeStamp: Date;
  updatedAt: Date;
  text: string;
  isAuthor: boolean;
  commentId: string;
  licencePlate: string;
  onDelete: () => void;
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
  onDelete,
  email,
  image,
}: CommentBubbleProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedText, setEditedText] = useState(text);
  const editTextRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (editMode) {
      editTextRef.current?.focus();
    }
  }, [editMode]);

  const editMutation = useMutation({
    mutationFn: () => updatePrivateCloudComment(licencePlate, commentId, editTextRef.current?.textContent || text),
    onSuccess: () => {
      toast.success('Comment edited successfully');
      setEditMode(false);
    },
    onError: (error: Error) => {
      toast.error(`Error updating comment: ${error.message}`);
      setEditMode(false);
    },
  });

  const handleEdit = () => {
    setEditMode(true);
    setMenuOpen(false);
    setTimeout(() => {
      if (editTextRef.current) {
        const range = document.createRange();
        const sel = window.getSelection();
        if (sel) {
          range.selectNodeContents(editTextRef.current);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
          editTextRef.current.focus();
        }
      }
    }, 0);
  };

  const saveEdit = () => {
    if (editTextRef.current) {
      editMutation.mutate();
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    if (editTextRef.current) {
      editTextRef.current.textContent = text; // Reset the text to original if the edit is cancelled
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedText(e.target.value);
  };

  const deleteMutation = useMutation({
    mutationFn: () => deletePrivateCloudComment(licencePlate, commentId),
    onSuccess: () => {
      onDelete();
      toast.success('Comment deleted successfully');
      setShowConfirm(false); // Close the confirmation modal
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleDelete = () => {
    setMenuOpen(false);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
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
              <span className="commented-text text-gray-500">commented </span>
              <Tooltip label={`Posted: ${timeStampExact}`}>
                <UnstyledButton className="text-gray-500 cursor-help" style={{ fontSize: '0.75rem' }}>
                  <span className="text-gray-500" style={{ fontSize: '0.75rem' }}>
                    {timeAgo}
                  </span>
                </UnstyledButton>
              </Tooltip>
              {wasEdited && (
                <Tooltip label={`Last edited: ${lastEdited} (${lastEditedExact})`}>
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
            <p
              ref={editTextRef}
              contentEditable={editMode}
              suppressContentEditableWarning={true}
              className={`transition duration-300 ease-in-out ${
                editMode ? 'bg-gray-100 border-2 border-yellow-400 p-2 rounded' : ''
              }`}
            >
              {text}
            </p>
            {editMode && (
              <div className="flex justify-around p-2">
                <button
                  className="border-gray-300 border rounded cursor-pointer transition-colors duration-200 hover:bg-gray-100 p-2"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
                <button
                  className="bg-yellow-400 rounded cursor-pointer transition-colors duration-200 hover:bg-yellow-500 p-2"
                  onClick={saveEdit}
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
        <div className={profileImageWrapperStyles}>
          <ProfileImage email={email} image={image} className="rounded-full" size={40} />
        </div>
        <AlertBox
          isOpen={showConfirm}
          title="Confirm Deletion"
          message="Are you sure you want to delete this comment?"
          onCancel={() => setShowConfirm(false)}
          onConfirm={confirmDelete}
          cancelButtonText="Cancel"
          confirmButtonText="Delete"
        />
      </div>
    </div>
  );
};

export default CommentBubble;
