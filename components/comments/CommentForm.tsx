import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
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

  const mutation = useMutation({
    mutationFn: () => createPrivateCloudComment(licencePlate, text, projectId, userId),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      onCommentAdded();
      setText('');
      setLoading(false);
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <form onSubmit={handleSubmit} style={{ width: '50%' }}>
        <textarea
          id="comment"
          name="comment box"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Leave a comment"
          style={{
            width: '100%',
            height: '150px',
            padding: '10px',
            marginBottom: '10px',
            resize: 'none',
            borderColor: 'blue',
            borderWidth: '2px',
            borderRadius: '4px',
            boxSizing: 'border-box',
          }}
          required
        />
        <button
          type="submit"
          style={{
            display: 'block',
            width: '100%',
            padding: '10px',
            backgroundColor: 'gold',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          disabled={isLoading}
        >
          Post comment
        </button>
      </form>
    </div>
  );
}

export default CommentForm;
