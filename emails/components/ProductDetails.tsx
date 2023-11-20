import { Button, Heading, Img, Link, Text } from '@react-email/components';
import { PrivateCloudCreateRequestBody } from '@/schema';
import { TailwindConfig } from './TailwindConfig';

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
  link: {
    marginTop: '0',
    textDecoration: 'none',
    color: '#0000EE',
    height: '1rem',
  },
  secondaryLead: {
    marginTop: '0',
    marginBottom: '0',
    fontWeight: '600',
    height: '1rem',
  },
};

interface User {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  ministry: string | null;
}

export default function ProductDetails({
  name,
  description,
  ministry,
  po,
  tl1,
  tl2,
}: {
  name: string;
  description: string;
  ministry: string;
  po: User;
  tl1: User;
  tl2?: User | null;
}) {
  return (
    <div>
      <Heading style={styles.heading}>Product Details</Heading>
      <div>
        <Text style={styles.text}>Product Name: </Text>
        <Text style={styles.text}>{name}</Text>
        <Text style={styles.text}>Product Description: </Text>
        <Text style={styles.text}>{description}</Text>
        <Text style={styles.text}>Ministry: </Text>
        <Text style={styles.text}>{ministry}</Text>
        <Text style={styles.text}>Product Owner: </Text>
        <Text style={styles.text}>
          {po.firstName} {po.lastName}
        </Text>
        <Link style={styles.link} href={`mailto:${po.email}`}>
          {po.email}
        </Link>
        <Text style={styles.text}>Technical Lead: </Text>
        <Text style={styles.text}>
          {tl1.firstName} {tl1.lastName}
        </Text>
        <Link style={styles.link} href={`mailto:${tl1.email}`}>
          {tl1.email}
        </Link>
        {tl2 && (
          <div>
            <Text style={styles.text}>Secondary Technical Lead: </Text>
            <Text style={styles.secondaryLead}>
              {tl2.firstName} {tl2.lastName}
            </Text>
            <Link style={styles.link} href={`mailto:${tl2.email}`}>
              {tl2.email}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
