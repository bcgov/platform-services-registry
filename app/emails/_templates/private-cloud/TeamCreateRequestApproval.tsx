import { Button, Heading, Text, Link, Hr } from '@react-email/components';
import * as React from 'react';
import ClusterDetails from '@/emails/_components/ClusterDetails';
import Comment from '@/emails/_components/Comment';
import PrivateCloudLayout from '@/emails/_components/layout/PrivateCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PrivateCloudRequestDetailDecorated } from '@/types/private-cloud';

interface EmailProp {
  request: PrivateCloudRequestDetailDecorated;
}

export default function TeamCreateRequestApproval({ request }: EmailProp) {
  return (
    <PrivateCloudLayout showFooter>
      <Heading className="text-lg text-black">Success! Your create request was approved!</Heading>
      <Text>Hi Product Team,</Text>
      <Text>
        We are pleased to inform you that your request to create the product {request.decisionData.name} has been
        approved on the Private Cloud OpenShift platform. Please allow 3-5 minutes for the request to be processed. If
        it takes longer, don&apos;t hesitate to reach out to us.
      </Text>
      <Text>
        If you have any more questions or need assistance, please reach out to the Platform Services team in the
        Rocket.Chat channel{' '}
        <Link className="mt-0 h-4" href={`https://chat.developer.gov.bc.ca/channel/devops-operations`}>
          #devops-operations
        </Link>
        .
      </Text>

      <LinkButton href={`/private-cloud/requests/${request.id}/decision`}>View Request</LinkButton>

      <Comment decisionComment={request.decisionComment} />

      <ProductDetails product={request.decisionData} />

      <ClusterDetails product={request.decisionData} />
    </PrivateCloudLayout>
  );
}
