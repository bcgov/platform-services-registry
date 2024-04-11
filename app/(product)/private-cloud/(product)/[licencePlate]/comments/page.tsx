'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getAllPrivateCloudComments } from '@/services/backend/private-cloud';

interface User {
  firstName: string;
  lastName: string;
  email: string;
}

interface Comment {
  id: string;
  created: Date;
  text: string;
  userId: string;
  user: User;
}

function CommentsPage() {
  const params = useParams();
  const licencePlate = params.licencePlate as string;
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchComments() {
      if (licencePlate) {
        try {
          const fetchedComments = await getAllPrivateCloudComments(licencePlate);
          setComments(fetchedComments);
        } catch (err) {
          console.error('Failed to fetch comments:', err);
          setError('Failed to load comments');
        }
      }
    }

    fetchComments();
  }, [licencePlate]);

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div>
        {comments.length > 0 ? (
          <ul>
            {comments.map((comment) => (
              <li key={comment.id}>
                <p>
                  <strong>Comment:</strong> {comment.text}
                </p>
                <p>
                  <strong>By:</strong> {comment.user.firstName} {comment.user.lastName} ({comment.user.email})
                </p>
                <p>
                  <strong>Posted on:</strong> {new Date(comment.created).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No comments found.</p>
        )}
      </div>
    </div>
  );
}

export default CommentsPage;
