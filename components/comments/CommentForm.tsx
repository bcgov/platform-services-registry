import React, { useState } from 'react';
import { createPrivateCloudComment } from '@/services/backend/private-cloud';

interface CommentFormProps {
  licencePlate: string;
  userId: string;
  projectId: string;
  onCommentAdded: () => void;
}

function CommentForm({ licencePlate, userId, projectId, onCommentAdded }: CommentFormProps) {
  const [text, setText] = useState('');

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      await createPrivateCloudComment(licencePlate, text, projectId, userId);
      onCommentAdded(); // Callback to refetch comments
      setText(''); // Clear the input after submission
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(e as unknown as React.MouseEvent<HTMLButtonElement>);
        }}
        style={{ width: '50%' }}
      >
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
        >
          Submit comment
        </button>
      </form>
    </div>
  );
}

export default CommentForm;
