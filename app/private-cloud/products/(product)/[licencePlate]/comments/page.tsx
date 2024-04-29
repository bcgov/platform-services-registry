'use client';

import { z } from 'zod';
import { useSnapshot } from 'valtio';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllPrivateCloudComments } from '@/services/backend/private-cloud/products';
import CommentForm from '@/components/comments/CommentForm';
import CommentBubble from '@/components/comments/CommentBubble';
import createClientPage from '@/core/client-page';
import { privateProductState } from '@/states/global';

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
  const snap = useSnapshot(privateProductState);
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
            <CommentBubble
              key={comment.id}
              text={comment.text}
              timestamp={new Date(comment.created)}
              firstName={comment.user.firstName}
              lastName={comment.user.lastName}
              isAuthor={userId === comment.userId}
            />
          ))}
        </ul>
      ) : (
        <p>No comments found.</p>
      )}
    </div>
  );
});
