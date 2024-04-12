'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getAllPrivateCloudComments, getPriviateCloudProject } from '@/services/backend/private-cloud';
import CommentForm from '@/components/comments/CommentForm';
import { useSession } from 'next-auth/react';
import { PrivateCloudProjectGetPayload } from '@/app/api/private-cloud/project/[licencePlate]/route';

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
  const { data: session } = useSession();
  const userId = session?.userId;
  const [project, setProject] = useState<PrivateCloudProjectGetPayload | null>(null);
  const params = useParams();
  const licencePlate = params.licencePlate as string;
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState('');

  const fetchComments = useCallback(async () => {
    if (licencePlate) {
      try {
        const projectData = await getPriviateCloudProject(licencePlate);
        setProject(projectData);
        const fetchedComments = await getAllPrivateCloudComments(licencePlate);
        setComments(fetchedComments);
      } catch (err) {
        console.error('Failed to fetch comments:', err);
        setError('Failed to load comments');
      }
    }
  }, [licencePlate]);

  useEffect(() => {
    fetchComments(); // Refactored to call directly without anonymous function
  }, [fetchComments]);

  const handleCommentAdded = () => {
    fetchComments(); // Refresh the comments after adding a new one
  };

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!project) {
    return <p>Loading project details...</p>; // Ensure project data is loaded
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <CommentForm
        licencePlate={licencePlate}
        projectId={project?.id ?? ''}
        userId={userId ?? ''}
        onCommentAdded={handleCommentAdded}
      />
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
  );
}

export default CommentsPage;
