'use client';

import { LoadingOverlay, Box, Divider } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import _groupBy from 'lodash-es/groupBy';
import _map from 'lodash-es/map';
import CommentBubble from '@/components/comments/CommentBubble';
import ExternalLink from '@/components/generic/button/ExternalLink';
import EmptySearch from '@/components/table/EmptySearch';
import { getAllPrivateCloudComments } from '@/services/backend/private-cloud/products';
import { PrivateCloudComment } from '@/types/private-cloud';

export default function RequestComments({ licencePlate }: { licencePlate: string }) {
  const {
    data: comments,
    isLoading: commentsLoading,
    isError: commentsIsError,
    error: commentsError,
    refetch: refetchComments,
  } = useQuery({
    queryKey: ['comments', licencePlate, 'all'],
    queryFn: () => getAllPrivateCloudComments(licencePlate, 'all'),
    enabled: !!licencePlate,
  });

  const commentsByRequest = _groupBy(comments, 'requestId');

  return (
    <>
      <Box pos="relative">
        <LoadingOverlay visible={commentsLoading || !comments} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
        {comments?.length > 0 ? (
          _map(commentsByRequest, (cmts, requestId) => {
            return (
              <>
                <Divider my="md" />
                <div className="text-center">
                  <ExternalLink href={`http://localhost:3000/private-cloud/requests/${requestId}/comments`}>
                    {requestId}
                  </ExternalLink>
                </div>

                {cmts.map((cmt: PrivateCloudComment) => (
                  <CommentBubble
                    key={cmt.id}
                    text={cmt.text}
                    timeStamp={new Date(cmt.createdAt)}
                    updatedAt={new Date(cmt.updatedAt)}
                    firstName={cmt.user.firstName ?? ''}
                    lastName={cmt.user.lastName ?? ''}
                    commentId={cmt.id}
                    licencePlate={licencePlate}
                    email={cmt.user.email}
                    image={cmt.user.image ?? ''}
                  />
                ))}
              </>
            );
          })
        ) : (
          <EmptySearch cloud="private-cloud" type="notes" />
        )}
      </Box>
    </>
  );
}
