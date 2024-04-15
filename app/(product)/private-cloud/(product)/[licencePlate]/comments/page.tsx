'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getAllPrivateCloudComments, getPriviateCloudProject } from '@/services/backend/private-cloud';
import CommentForm from '@/components/comments/CommentForm';
import { useSession } from 'next-auth/react';

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
  const params = useParams();
  const licencePlate = params.licencePlate as string;

  // Query for project details
  const {
    data: project,
    isLoading: projectLoading,
    isError: projectIsError,
    error: projectError,
  } = useQuery({
    queryKey: ['project', licencePlate],
    queryFn: () => getPriviateCloudProject(licencePlate),
    enabled: !!licencePlate,
  });

  // Query for comments
  const {
    data: comments,
    isLoading: commentsLoading,
    isError: commentsIsError,
    error: commentsError,
    refetch: refetchComments,
  } = useQuery({
    queryKey: ['comments', licencePlate],
    queryFn: () => getAllPrivateCloudComments(licencePlate),
    enabled: !!licencePlate,
  });

  const handleCommentAdded = () => {
    refetchComments(); // Refresh the comments after adding a new one
  };

  if (projectLoading || commentsLoading) return <p>Loading...</p>;
  if (projectIsError || commentsIsError) return <p>Error: {projectError?.message || commentsError?.message}</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <CommentForm
        licencePlate={licencePlate}
        projectId={project?.id ?? ''}
        userId={userId ?? ''}
        onCommentAdded={handleCommentAdded}
      />
      {comments?.length > 0 ? (
        <ul>
          {comments.map((comment: Comment) => (
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
