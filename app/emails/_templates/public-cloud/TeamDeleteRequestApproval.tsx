import { Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import Comment from '@/emails/_components/Comment';
import PublicCloudLayout from '@/emails/_components/layout/PublicCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import ProductDetails from '@/emails/_components/ProductDetails';
import ProviderDetails from '@/emails/_components/ProviderDetails';
import { PublicCloudRequestDetailDecorated } from '@/types/public-cloud';

interface EmailProp {
  request: PublicCloudRequestDetailDecorated;
}

export default function TeamDeleteRequestApproval({ request }: EmailProp) {
  if (!request) return <></>;

  const { name } = request.decisionData;

  return (
    <PublicCloudLayout showFooter>
      <Heading className="text-lg text-black">
        Your deletion request has been sent to our platform administrators!
      </Heading>
      <Text>Hi Product Team,</Text>
      <Text>
        We acknowledge the receipt of your deletion request for {name} project set. This request has been communicated
        to our platform administrators, who will take the necessary actions to delete the specified project set.
      </Text>
      <Text>
        Please be informed that until the deletion process is completed, the project set will continue to incur charges
        for the utilized resources. We are committed to processing your request promptly to minimize any additional
        expenses.
      </Text>

      <LinkButton href={`/public-cloud/requests/${request.id}/request`}>View Request</LinkButton>

      <Comment requestComment={request.requestComment} />

      <ProductDetails product={request.decisionData} />

      <ProviderDetails product={request.decisionData} />
    </PublicCloudLayout>
  );
}
