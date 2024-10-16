import { CPU, Memory, Storage } from '@prisma/client';
import { Heading, Text, Link, Hr } from '@react-email/components';
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
        <Text className="mb-1 mt-1 h-4">CPU: {CPU.CPU_REQUEST_0_5_LIMIT_1_5}</Text>
        <Text className="mb-1 mt-1 h-4">Memory: {Memory.MEMORY_REQUEST_2_LIMIT_4}</Text>
        <Text className="mb-1 mt-1 h-4">Storage: {Storage.STORAGE_1}</Text>
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
          <Text className="mb-0 font-semibold h-4">Development Namespace: </Text>
          <Link
            className="mt-1 h-4"
            href={`https://console.apps.${cluster}.devops.gov.bc.ca/k8s/cluster/projects/${licencePlate}-dev`}
          >
            <Text className="mt-1 mb-1 h-4">{licencePlate}-dev</Text>
          </Link>
          {defaultProvisionedResource}
          <Text className="mb-0 font-semibold h-4">Test Namespace: </Text>
          <Link
            className="mt-1 h-4"
            href={`https://console.apps.${cluster}.devops.gov.bc.ca/k8s/cluster/projects/${licencePlate}-test`}
          >
            <Text className="mt-1 mb-1 h-4">{licencePlate}-test</Text>
          </Link>
          {defaultProvisionedResource}
          <Text className="mb-1 font-semibold h-4">Production Namespace: </Text>
          <Link
            className="mt-1 h-4"
            href={`https://console.apps.${cluster}.devops.gov.bc.ca/k8s/cluster/projects/${licencePlate}-prod`}
          >
            <Text className="mt-1 mb-1 h-4">{licencePlate}-prod</Text>
          </Link>
          {defaultProvisionedResource}
          <Text className="mb-1 font-semibold h-4">Tools Namespace: </Text>
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
