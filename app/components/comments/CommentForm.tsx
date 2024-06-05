import { notifications } from '@mantine/notifications';
import { IconMessageCirclePlus, IconX, IconSend } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import { createPrivateCloudComment } from '@/services/backend/private-cloud/products';

interface CommentFormProps {
  licencePlate: string;
  userId: string;
  projectId?: string;
  requestId?: string;
  onCommentAdded: () => void;
}

function CommentForm({ licencePlate, userId, projectId, requestId, onCommentAdded }: CommentFormProps) {
  const [text, setText] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false); // State to toggle comment box visibility

  const mutation = useMutation({
    mutationFn: () => createPrivateCloudComment(licencePlate, text, userId, projectId, requestId),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      onCommentAdded();
      setText('');
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
    mutation.mutate();
  };

  const handleCancel = () => {
    setText('');
    setShowCommentBox(false);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-xl px-4">
        {!showCommentBox && (
          <div className="flex justify-end mb-2 transition-opacity duration-500 ease-in-out">
            <button
              onClick={() => setShowCommentBox(true)} // Show the comment box
              className="flex items-center px-5 py-2.5 bg-yellow-400 border-none rounded cursor-pointer transition-transform duration-500 ease-in-out transform hover:scale-105 hover:bg-yellow-500"
            >
              <IconMessageCirclePlus className="mr-2" />
              Add Comment
            </button>
          </div>
        )}

        {showCommentBox && (
          <form onSubmit={handleSubmit} className="relative transition-opacity duration-500 ease-in-out opacity-100">
            <textarea
              id="comment"
              name="comment box"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Leave a comment"
              className="w-full h-40 p-2.5 pr-10 mb-2.5 resize-none border-2 border-blue-500 rounded"
              required
            />
            <IconX
              className="absolute top-2 right-2 cursor-pointer text-gray-500 hover:text-gray-700"
              onClick={handleCancel}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center px-5 py-2.5 bg-yellow-400 border-none rounded cursor-pointer transition-transform duration-500 ease-in-out transform hover:scale-105 hover:bg-yellow-500"
                disabled={isLoading}
              >
                <IconSend className="mr-2" />
                Post Comment
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default CommentForm;
