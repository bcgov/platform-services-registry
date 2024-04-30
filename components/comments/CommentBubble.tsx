import React, { useState } from 'react';
import { EllipsisHorizontalIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/20/solid';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { deletePrivateCloudComment } from '@/services/backend/private-cloud/products';
import { toast } from 'react-toastify';
import AlertBox from '../modal/AlertBox';

interface ChatBubbleProps {
  firstName: string;
  lastName: string;
  timestamp: Date;
  text: string;
  isAuthor: boolean;
  commentId: string;
  licencePlate: string;
  onDelete: () => void;
}

const CommentBubble: React.FC<ChatBubbleProps> = ({
  firstName,
  lastName,
  timestamp,
  text,
  isAuthor,
  commentId,
  licencePlate,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setMenuOpen(false);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const result = await deletePrivateCloudComment(licencePlate, commentId);
      if (result.success) {
        onDelete(); // Callback to refresh the comments list
        toast.success('Comment deleted successfully');
      } else {
        toast.error('Failed to delete the comment');
      }
    } catch (error) {
      toast.error('Failed to delete the comment');
    }
    setShowConfirm(false);
  };

  const bubbleStyles =
    'relative max-w-xl mx-auto my-2 bg-white rounded-lg border border-blue-200 justify-between items-center';

  const headerStyles = 'flex justify-between items-center px-4 py-1 bg-blue-100 text-gray-700 text-xs';

  const bodyStyles = 'p-4 text-gray-700 break-words';

  const userTailStyles =
    'absolute top-3 right-0 w-0 h-0 border-l-[26px] border-l-transparent border-b-[10px] border-b-transparent border-t-[26px] border-t-blue-100 transform translate-x-1/4 -translate-y-1/4 rotate-45';

  const otherUserTailStyles =
    'absolute top-3 left-0 w-0 h-0 border-r-[16px] border-r-transparent border-b-[10px] border-b-transparent border-t-[16px] border-t-blue-100 transform -translate-x-1/4 -translate-y-1/3 -rotate-45';

  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className={bubbleStyles}>
      <div className={headerStyles}>
        <div>
          <strong>
            {firstName} {lastName}
          </strong>{' '}
          <span className="commented-text">commented </span>
          <span>{timeAgo}</span>
        </div>
        {isAuthor && (
          <button onClick={toggleMenu} className="p-1 rounded-full hover:bg-gray-200">
            <EllipsisHorizontalIcon className="w-5 h-5" />
          </button>
        )}
      </div>
      {menuOpen && (
        <div className="absolute right-0 mt-2 py-1 w-48 bg-white rounded-md shadow-lg z-50">
          <button
            onClick={() => {} /* handleEdit */}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
          >
            <PencilSquareIcon className="w-5 h-5 mr-2" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            aria-label="Delete comment"
          >
            <TrashIcon className="w-5 h-5 mr-2" />
            Delete
          </button>
        </div>
      )}
      <div className={bodyStyles}>
        <p>{text}</p>
      </div>
      <div className={isAuthor ? userTailStyles : otherUserTailStyles}></div>
      {showConfirm && (
        <AlertBox
          isOpen={showConfirm}
          title="Confirm Deletion"
          message="Are you sure you want to delete this comment ?"
          onCancel={() => setShowConfirm(false)}
          onConfirm={confirmDelete}
          cancelButtonText="Cancel"
          confirmButtonText="Delete"
        />
      )}
    </div>
  );
};

export default CommentBubble;
