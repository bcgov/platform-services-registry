import { Heading, Text } from '@react-email/components';
import ClusterDetails from '@/emails/_components/ClusterDetails';
import Comment from '@/emails/_components/Comment';
import PrivateCloudLayout from '@/emails/_components/layout/PrivateCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PrivateCloudRequestDetailDecorated } from '@/types/private-cloud';

interface EmailProp {
  request: PrivateCloudRequestDetailDecorated;
}

export default function TeamDeleteRequestCompletion({ request }: EmailProp) {
  if (!request) return <></>;

  const { decisionData } = request;

  return (
    <PrivateCloudLayout showFooter>
      <Heading className="text-lg text-black">
        {' '}
        {request.decisionData.isTest ? 'The auto-created' : 'Your '} deletion request has been completed!
      </Heading>
      <Text>Hi Product Team,</Text>
      <Text>{`The project set deletion for ${decisionData.name} has been successfully completed.`}</Text>

      <LinkButton href={`/private-cloud/requests/${request.id}/decision`}>View Request</LinkButton>

      <Comment requestComment={request.requestComment} />

      <ProductDetails product={request.decisionData} />

      <ClusterDetails product={request.decisionData} showNamespaceInfo />
    </PrivateCloudLayout>
  );
}
