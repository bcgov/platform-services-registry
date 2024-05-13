import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import { createPrivateCloudComment } from '@/services/backend/private-cloud/products';

interface CommentFormProps {
  licencePlate: string;
  userId: string;
  projectId: string;
  onCommentAdded: () => void;
}

function CommentForm({ licencePlate, userId, projectId, onCommentAdded }: CommentFormProps) {
  const [text, setText] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false); // State to toggle comment box visibility

  const mutation = useMutation({
    mutationFn: () => createPrivateCloudComment(licencePlate, text, projectId, userId),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      onCommentAdded();
      setText('');
      setLoading(false);
      setShowCommentBox(false); // Hide the comment box after submitting
    },
    onError: (error: Error) => {
      console.error('Failed to add comment:', error);
      setLoading(false);
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => setShowCommentBox(!showCommentBox)} // Toggle the visibility of the comment box
        className="mb-2 px-5 py-2.5 bg-yellow-400 border-none rounded cursor-pointer transition-colors duration-200 hover:bg-yellow-500"
      >
        {showCommentBox ? 'Cancel' : 'Add Comment'}
      </button>

      {showCommentBox && ( // Render the form only if showCommentBox is true
        <form onSubmit={handleSubmit} style={{ width: '50%' }}>
          <textarea
            id="comment"
            name="comment box"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Leave a comment"
            className="w-full h-40 p-2.5 mb-2.5 resize-none border-2 border-blue-500 rounded"
            required
          />
          <button
            type="submit"
            className="block w-full px-4 py-2.5 text-sm bg-yellow-400 border-none rounded cursor-pointer transition-colors duration-200 hover:bg-yellow-500"
            disabled={isLoading}
          >
            Post comment
          </button>
        </form>
      )}
    </div>
  );
}

export default CommentForm;
