'use client';

import { z } from 'zod';
import { useSnapshot } from 'valtio';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllPrivateCloudComments } from '@/services/backend/private-cloud';
import CommentForm from '@/components/comments/CommentForm';
import createClientPage from '@/core/client-page';
import { productState } from '../state';

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

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductComments = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export default privateCloudProductComments(({ pathParams, queryParams, session }) => {
  const snap = useSnapshot(productState);
  const { licencePlate } = pathParams;

  const userId = session?.userId;

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <CommentForm
        licencePlate={licencePlate}
        projectId={snap.currentProduct?.id ?? ''}
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
});
