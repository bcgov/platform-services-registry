import { Button, Heading, Img, Link, Text } from '@react-email/components';
import { PrivateCloudCreateRequestBody } from '@/schema';

const styles = {
  heading: {
    fontSize: '1.125rem',
    fontWeight: 'bold',
  },
  text: {
    marginBottom: '0',
    fontWeight: '600',
    height: '1rem',
  },
  textContent: {
    marginTop: '0',
    height: '1rem',
  },
};

export default function NamespaceDetails({ cluster, licencePlate }: { cluster: string; licencePlate?: string }) {
  return (
    <div>
      <Heading style={styles.heading}>Namespace Details</Heading>
      <div>
        <Text style={styles.text}>OpenShift Cluster: </Text>
        <Text style={styles.textContent}>{cluster}</Text>
      </div>
      {licencePlate && (
        <>
          <Text style={styles.text}>Development Namespace: </Text>
          <Text style={styles.textContent}>{`${licencePlate}-dev`}</Text>
          <Text style={styles.text}>Test Namespace: </Text>
          <Text style={styles.textContent}>{`${licencePlate}-test`}</Text>
          <Text style={styles.text}>Production Namespace: </Text>
          <Text style={styles.textContent}>{`${licencePlate}-prod`}</Text>
          <Text style={styles.text}>Tools Namespace: </Text>
          <Text style={styles.textContent}>{`${licencePlate}-tools`}</Text>
        </>
      )}
    </div>
  );
}
