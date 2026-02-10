import { Heading, Text, Link } from '@react-email/components';
import ClusterDetails from '@/emails/_components/ClusterDetails';
import Comment from '@/emails/_components/Comment';
import PrivateCloudLayout from '@/emails/_components/layout/PrivateCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import ProductDetails from '@/emails/_components/ProductDetails';
import { DecisionStatus } from '@/prisma/client';
import { PrivateCloudRequestDetailDecorated } from '@/types/private-cloud';

interface EmailProp {
  request: PrivateCloudRequestDetailDecorated;
}

export default function TeamDeleteRequestApproval({ request }: EmailProp) {
  if (!request) return <></>;
  const isTempAutoDelete = request.decisionStatus === DecisionStatus.AUTO_APPROVED;
  return (
    <PrivateCloudLayout showFooter>
      <Heading className="text-lg text-black">
        {isTempAutoDelete ? 'Temporary product deletion auto-approved' : 'Success! Your delete request was approved!'}
      </Heading>

      <Text>Hi Product Team,</Text>

      <Text>
        {isTempAutoDelete ? (
          <>
            The auto-created request to delete the temporary product <b>{request.decisionData.name}</b> has been
            automatically approved and is now being processed on the Private Cloud OpenShift platform.
          </>
        ) : (
          <>
            We are pleased to inform you that your product {request.decisionData.name} has been approved for deletion on
            the Private Cloud OpenShift platform.
          </>
        )}{' '}
        Please allow 3–5 minutes for the deletion to complete. If it takes longer, feel free to reach out to us.
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

      <Comment requestComment={request.requestComment} decisionComment={request.decisionComment} />

      <ProductDetails product={request.decisionData} />

      <ClusterDetails product={request.decisionData} showNamespaceInfo />
    </PrivateCloudLayout>
  );
}
