import { Heading, Text, Link, Hr } from '@react-email/components';
import { defaultResourceRequests } from '@/constants';
import { PrivateCloudProductDetail } from '@/types/private-cloud';

interface Props {
  product: Pick<PrivateCloudProductDetail, 'cluster' | 'licencePlate'>;
  showNamespaceInfo?: boolean;
  showDefaultResource?: boolean;
}

export default function ClusterDetails({ product, showNamespaceInfo = false, showDefaultResource = false }: Props) {
  const { cluster, licencePlate } = product;

  let defaultProvisionedResource = null;
  if (showDefaultResource) {
    defaultProvisionedResource = (
      <>
        <Text className="mb-1 mt-1 h-4">CPU: {defaultResourceRequests.cpu} Core(s)</Text>
        <Text className="mb-1 mt-1 h-4">Memory: {defaultResourceRequests.memory} GB</Text>
        <Text className="mb-1 mt-1 h-4">Storage: {defaultResourceRequests.storage} GB</Text>
      </>
    );
  }

  return (
    <>
      <Hr className="my-4" />
      <Heading className="text-lg">Namespace Details</Heading>
      <div>
        <Text className="mb-1 font-semibold h-4">OpenShift Cluster: </Text>
        <Text className="mt-1 h-4">{cluster}</Text>
      </div>
      {showNamespaceInfo && (
        <>
          <Text className="mb-0 font-semibold h-4">Development namespace: </Text>
          <Link
            className="mt-1 h-4"
            href={`https://console.apps.${cluster}.devops.gov.bc.ca/k8s/cluster/projects/${licencePlate}-dev`}
          >
            <Text className="mt-1 mb-1 h-4">{licencePlate}-dev</Text>
          </Link>
          {defaultProvisionedResource}
          <Text className="mb-0 font-semibold h-4">Test namespace: </Text>
          <Link
            className="mt-1 h-4"
            href={`https://console.apps.${cluster}.devops.gov.bc.ca/k8s/cluster/projects/${licencePlate}-test`}
          >
            <Text className="mt-1 mb-1 h-4">{licencePlate}-test</Text>
          </Link>
          {defaultProvisionedResource}
          <Text className="mb-1 font-semibold h-4">Production namespace: </Text>
          <Link
            className="mt-1 h-4"
            href={`https://console.apps.${cluster}.devops.gov.bc.ca/k8s/cluster/projects/${licencePlate}-prod`}
          >
            <Text className="mt-1 mb-1 h-4">{licencePlate}-prod</Text>
          </Link>
          {defaultProvisionedResource}
          <Text className="mb-1 font-semibold h-4">Tools namespace: </Text>
          <Link
            className="mt-1 h-4"
            href={`https://console.apps.${cluster}.devops.gov.bc.ca/k8s/cluster/projects/${licencePlate}-tools`}
          >
            <Text className="mt-1 mb-1 h-4">{licencePlate}-tools</Text>
          </Link>
          {defaultProvisionedResource}
        </>
      )}
    </>
  );
}
