import { Heading, Text } from '@react-email/components';
import Comment from '@/emails/_components/Comment';
import PublicCloudLayout from '@/emails/_components/layout/PublicCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import ProductDetails from '@/emails/_components/ProductDetails';
import ProviderDetails from '@/emails/_components/ProviderDetails';
import Support from '@/emails/_components/public-cloud/Support';
import { PublicCloudRequestDetailDecorated } from '@/types/public-cloud';

interface EmailProp {
  request: PublicCloudRequestDetailDecorated;
}

export default function TeamCreateRequestApproval({ request }: EmailProp) {
  if (!request) return <></>;

  const { provider } = request.decisionData;

  return (
    <PublicCloudLayout showFooter>
      <Heading className="text-lg text-black">Success! Your create request was approved!</Heading>
      <Text>Hi Product Team,</Text>
      <Text>
        We are pleased to inform you that your request to create the product {request.decisionData.name} has been
        approved on the Public Cloud Landing Zone {provider}.
      </Text>
      <Support />

      <LinkButton href={`/public-cloud/requests/${request.id}/request`}>View Request</LinkButton>

      <Comment decisionComment={request.decisionComment} />

      <ProductDetails product={request.decisionData} />

      <ProviderDetails product={request.decisionData} />
    </PublicCloudLayout>
  );
}
