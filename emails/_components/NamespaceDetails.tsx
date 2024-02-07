import { Heading, Text, Link } from '@react-email/components';

export default function NamespaceDetails({
  cluster,
  licencePlate,
  showNamespaceDetailsTitle = true,
}: {
  cluster: string;
  licencePlate?: string;
  showNamespaceDetailsTitle?: boolean;
}) {
  return (
    <div>
      {showNamespaceDetailsTitle && <Heading className="text-lg">Namespace Details</Heading>}
      <div>
        <Text className="mb-1 font-semibold h-4">OpenShift Cluster: </Text>
        <Text className="mt-1 h-4">{cluster}</Text>
      </div>
      {licencePlate && (
        <>
          <Text className="mb-0 font-semibold h-4">Development Namespace: </Text>
          <Link
            className="mt-1 h-4"
            href={`https://console.apps.${cluster}.devops.gov.bc.ca/k8s/cluster/projects/${licencePlate}-dev`}
          >
            <Text className="mt-1 h-4">{licencePlate}-dev</Text>
          </Link>
          <Text className="mb-0 font-semibold h-4">Test Namespace: </Text>
          <Link
            className="mt-1 h-4"
            href={`https://console.apps.${cluster}.devops.gov.bc.ca/k8s/cluster/projects/${licencePlate}-test`}
          >
            <Text className="mt-1 h-4">{licencePlate}-test</Text>
          </Link>
          <Text className="mb-1 font-semibold h-4">Production Namespace: </Text>
          <Link
            className="mt-1 h-4"
            href={`https://console.apps.${cluster}.devops.gov.bc.ca/k8s/cluster/projects/${licencePlate}-prod`}
          >
            <Text className="mt-0 h-4">{licencePlate}-prod</Text>
          </Link>

          <Text className="mb-1 font-semibold h-4">Tools Namespace: </Text>
          <Link
            className="mt-1 h-4"
            href={`https://console.apps.${cluster}.devops.gov.bc.ca/k8s/cluster/projects/${licencePlate}-tools`}
          >
            <Text className="mt-1 h-4">{licencePlate}-tools</Text>
          </Link>
        </>
      )}
    </div>
  );
}
