import { Link, Button, Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import PrivateCloudLayout from '@/emails/_components/layout/PrivateCloudLayout';
import NamespaceDetails from '@/emails/_components/NamespaceDetails';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PrivateCloudRequestedProjectWithContacts } from '@/services/nats/private-cloud';

interface EmailProp {
  product: PrivateCloudRequestedProjectWithContacts;
}

export default function Provisioned({ product }: EmailProp) {
  if (!product) return <></>;

  return (
    <PrivateCloudLayout>
      <Heading className="text-lg text-black">Success! Your provisioning request is complete!</Heading>
      <Text>Hi Product Team, </Text>
      <Text>
        The request for your product on the Private Cloud Openshift platform is complete.{' '}
        <Link className="mt-0 h-4" href={`https://console.apps.${product.cluster}.devops.gov.bc.ca/`}>
          Log in to the cluster console
        </Link>{' '}
        or use the button below and you&apos;ll see all four namespaces included in a project set. If you have any more
        questions reach out to the Platform Services team in the Rocket.Chat channel{' '}
        <Link className="mt-0 h-4" href={`https://chat.developer.gov.bc.ca/channel/devops-operations`}>
          #devops-operations
        </Link>
        .
      </Text>
      <Text>
        The Product Owner and the Technical Lead(s) have been provisioned with admin access to the namespaces below and
        can add other users as needed.
      </Text>
      <Text>
        Removing a Product Owner or Technical Lead(s) as project contacts in the Platform Product Registry will revoke
        their access to project set namespaces in OpenShift. The newly added Product Owner or Technical Lead(s) on the
        product details page will then gain administrative access to these namespaces.
      </Text>
      <Button
        href={`https://console.apps.${product.cluster}.devops.gov.bc.ca/`}
        className="bg-bcorange rounded-md px-4 py-2 text-white"
      >
        Log in to Console
      </Button>

      <Hr className="my-4" />

      <ProductDetails
        name={product.name}
        description={product.description}
        ministry={product.ministry}
        po={product.projectOwner}
        tl1={product.primaryTechnicalLead}
        tl2={product.secondaryTechnicalLead}
      />

      <Hr className="my-4" />

      <NamespaceDetails cluster={product.cluster} licencePlate={product.licencePlate} showDefaultResource={true} />

      <Hr className="my-4" />

      <Heading className="text-lg">Security Tools</Heading>
      <Text>
        Your new OpenShift project set includes access to free security tools available to product teams on the Private
        Cloud OpenShift, including:
      </Text>
      <ul>
        <li>
          <Text>Artifactory - trusted artifact repository</Text>
        </li>
        <li>
          <Text>Vault secrets management service</Text>
        </li>
        <li>
          <Text>Sysdig Monitoring Service</Text>
        </li>
        <li>
          <Text>Advanced Cluster Security (ACS) - vulnerability scanning service</Text>
        </li>
      </ul>
      <Text>
        You can read more about these tools in the
        <Link href="https://docs.developer.gov.bc.ca/"> Private cloud technical documentation</Link>.
      </Text>

      <Hr className="my-4" />

      <Heading className="text-lg">Artifactory</Heading>
      <Text>Artifactory is an artifact repository system:</Text>
      <ul>
        <li>
          <Text>
            We&apos;ve set up a service account for you with read access to Artifactory. This account allows you to
            access locally cached container images, speeding up builds and pod startup. It also grants you access to
            helpful pre-built images maintained by the Platform Services team
          </Text>
        </li>
        <li>
          <Text>You can create your own project in Artifactory to store builds and other artifacts</Text>
        </li>
        <li>
          <Text>
            Find out&nbsp;
            <Link href="https://docs.developer.gov.bc.ca/image-artifact-management-with-artifactory/">
              how to manage images and artifacts
            </Link>
            &nbsp;with Artifactory
          </Text>
        </li>
        <li>
          <Text>
            Learn more about&nbsp;
            <Link href="https://docs.developer.gov.bc.ca/prebuilt-images/">the pre-built images</Link>&nbsp;maintained
            by the Platform Services Team
          </Text>
        </li>
        <li>
          <Text>
            Find out&nbsp;
            <Link href="https://docs.developer.gov.bc.ca/setup-artifactory-project-repository/">how to set up</Link>
            &nbsp; your own Artifactory project
          </Text>
        </li>
        <li>
          <Text>
            Get more&nbsp;
            <Link href="https://jfrog.com/artifactory/">general information</Link>&nbsp; about Artifactory
          </Text>
        </li>
      </ul>

      <Hr className="my-4" />

      <Heading className="text-lg">Vault</Heading>
      <Text>
        Vault Secrets Management tool is an identity-based secret and encryption management system. Use it to securely
        access and store your app secrets such as database credentials, API tokens, etc:
      </Text>
      <ul>
        <li>
          <Text>Product Owners and Technical Leads are automatically granted access </Text>
        </li>
        <li>
          <Text>We automatically create a service account for Vault access in your deployment manifests</Text>
        </li>
        <li>
          <Text>
            Read more about Vault&#39;s&nbsp;
            <Link href="https://docs.developer.gov.bc.ca/vault-secrets-management-service/">
              features and functions
            </Link>
          </Text>
        </li>
        <li>
          <Text>
            Discover how to begin using&nbsp;
            <Link href="https://docs.developer.gov.bc.ca/vault-getting-started-guide/">Vault</Link>
          </Text>
        </li>
        <li>
          <Text>
            Get more&nbsp;<Link href="https://www.vaultproject.io/">general information</Link>&nbsp;about Vault
          </Text>
        </li>
      </ul>

      <Hr className="my-4" />

      <Heading className="text-lg">Advanced cluster security (ACS)</Heading>
      <Text>
        Red Hat Advanced Cluster Security (ACS) helps you enforce DevOps and security best practices in your application
        by finding vulnerabilities in your running containers:
      </Text>
      <ul>
        <li>
          <Text>We automatically create an access role and scope for your project set</Text>
        </li>
        <li>
          <Text>We automatically create a service account for ACS access in your deployment manifests</Text>
        </li>
        <li>
          <Text>
            Read more about the&nbsp;
            <Link href="https://www.redhat.com/en/technologies/cloud-computing/openshift/advanced-cluster-security-kubernetes">
              benefits
            </Link>
            &nbsp;of using ACS
          </Text>
        </li>
        <li>
          <Text>
            Get more&nbsp;
            <Link href="https://developer.gov.bc.ca/docs/default/component/chefs-techdocs/About/SoAR-and-Compliance/#advanced-cluster-security-acs">
              general information
            </Link>
            &nbsp;about ACS
          </Text>
        </li>
      </ul>

      <Hr className="my-4" />

      <Heading className="text-lg">Sysdig monitoring system</Heading>
      <Text>
        Sysdig Monitor is a monitoring, alerting and data collection tool. You can use Sysdig Monitor to build
        dashboards to monitor the health, availability and resource usage of your applications:
      </Text>
      <ul>
        <li>
          <Text>
            Learn more about&nbsp;
            <Link href="https://digital.gov.bc.ca/cloud/services/private/products-tools/sysdig/">
              Sysdig Monitor and its benefits
            </Link>
          </Text>
        </li>
        <li>
          <Text>
            Start the
            <Link href="https://docs.developer.gov.bc.ca/sysdig-monitor-onboarding/"> onboarding process</Link> for
            Sysdig
          </Text>
        </li>
      </ul>
    </PrivateCloudLayout>
  );
}
