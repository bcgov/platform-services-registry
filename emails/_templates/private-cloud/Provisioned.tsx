import * as React from 'react';
import Header from '../../_components/Header';
import { Link, Body, Button, Heading, Html, Text } from '@react-email/components';
import Closing from '../../_components/Closing';
import ProductDetails from '../../_components/ProductDetails';
import NamespaceDetails from '../../_components/NamespaceDetails';
import { PrivateCloudRequestedProjectWithContacts } from '@/nats/privateCloud';
import TailwindWrapper from '../../_components/TailwindWrapper';

interface EmailProp {
  product: PrivateCloudRequestedProjectWithContacts;
}

const ProvisionedTemplate = ({ product }: EmailProp) => {
  if (!product) return <></>;

  return (
    <TailwindWrapper>
      <div className="border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl">
        <Header />
        <Body className="bg-white my-auto mx-auto font-sans text-xs text-darkergrey">
          <div className="m-12">
            <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
              <Heading className="text-lg text-black">
                Success! Your provisioning request was approved and completed!
              </Heading>
              <Text>Hi Product Team, </Text>
              <Text className="">
                Your request for your product on the Private Cloud Openshift platform is complete.{' '}
                <Link className="mt-0 h-4" href={`https://console.apps.${product.cluster}.devops.gov.bc.ca/`}>
                  Log in to the cluster console
                </Link>{' '}
                or use the button below and you&apos;ll see all four namespaces included in a project set. If you have
                any more questions reach out to the Platform Services team in the Rocket.Chat channel{' '}
                <Link className="mt-0 h-4" href={`https://chat.developer.gov.bc.ca/channel/devops-operations`}>
                  #devops-operations
                </Link>.
              </Text>
              <Text className="">
                The Product Owner and the Technical Lead(s) have been provisioned with admin access to the namespaces
                below and can add other users as needed.
                </Text>
                <Text className="">
                Removing a Product Owner or Technical Lead(s) as project contacts in the Platform Product Registry will revoke their access to project set namespaces in OpenShift. 
                The newly added Product Owner or Technical Lead(s) on the product details page will then gain administrative access to these namespaces.
              </Text>
              <Button
                href={`https://console.apps.${product.cluster}.devops.gov.bc.ca/`}
                className="bg-bcorange rounded-md px-4 py-2 text-white"
              >
                Log in to Console
              </Button>
            </div>
            <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
              <ProductDetails
                name={product.name}
                description={product.description}
                ministry={product.ministry}
                po={product.projectOwner}
                tl1={product.primaryTechnicalLead}
                tl2={product.secondaryTechnicalLead}
              />
            </div>
            <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
              <NamespaceDetails
                cluster={product.cluster}
                licencePlate={product.licencePlate}
                showDefaultResource={true}
              />
            </div>
            <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
              <div>
                <Heading className="text-lg">Security Tools</Heading>
                <Text className="">
                  Your new OpenShift project set includes access to free security tools available to product teams on
                  the Private Cloud OpenShift, including: 
                  </Text>
                  <ul>
                    <li> 
                    <Text className="">
                      Artifactory -  trusted artifact repository
                    </Text> 
                    </li>
                    <li>
                    <Text className="">
                    Vault secrets management service
                    </Text>
                    </li>
                    <li>
                    <Text className="">
                     Sysdig Monitoring Service
                     </Text>
                     </li>
                    <li> 
                    <Text className="">
                      Advanced Cluster Security (ACS) - vulnerability scanning service 
                      </Text>
                      </li> 
                  </ul>
                  <Text className="">
                  You can read more about these tools in the 
                  <Link href="https://docs.developer.gov.bc.ca/"> Private cloud technical documentation</Link>.
                </Text>
              </div>
            </div>
            <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
              <div>
                <Heading className="text-lg">Artifactory</Heading>
                <Text className="">Artifactory is an artifact repository system:</Text>
                <ul>
                  <li>
                    <Text className="">
                      We've set up a service account for you with read access to Artifactory. This account allows you to access locally cached container images, 
                      speeding up builds and pod startup. It also grants you access to helpful pre-built images maintained by the Platform Services team
                    </Text>
                  </li>
                  <li>
                    <Text className="">
                      You can create your own project in Artifactory to store builds and other artifacts
                    </Text>
                  </li>
                  <li>
                    <Text className="">
                      Find out 
                      <Link href="https://docs.developer.gov.bc.ca/image-artifact-management-with-artifactory/">
                        {' '}
                        how to manage images and artifacts 
                      </Link>
                        {' '}
                        with Artifactory
                    </Text>
                  </li>
                  <li>
                    <Text className="">
                      Learn more about
                      <Link href="https://docs.developer.gov.bc.ca/prebuilt-images/">
                        {' '}
                        the pre-built images 
                      </Link>
                        {' '}
                        maintained by the Platform Services Team
                    </Text>
                  </li>
                  <li>
                    <Text className="">
                    
                      Find out 
                      <Link href="https://docs.developer.gov.bc.ca/setup-artifactory-project-repository/">
                        {' '}
                        how to set up 
                      </Link>
                      {' '}
                      your own Artifactory project
                    </Text>
                  </li>
                  <li>
                    <Text className="">
                      Get more
                      <Link href="https://jfrog.com/artifactory/"> general information </Link>
                      {'about Artifactory'}
                    </Text>
                  </li>
                </ul>
              </div>
            </div>
            <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
              <div>
                <Heading className="text-lg">Vault</Heading>
                <Text className="">
                  Vault Secrets Management tool is an identity-based secret and encryption management system. Use it to
                  securely access and store your app secrets such as database credentials, API tokens, etc:
                </Text>
                <ul>
                  <li>
                    <Text className="">Product Owners and Technical Leads are automatically granted access </Text>
                  </li>
                  <li>
                    <Text className="">
                    We automatically create a service account for Vault access in your deployment manifests
                    </Text>
                  </li>
                  <li>
                    <Text className="">
                      Read more about Vault&#39;s
                      <Link href="https://docs.developer.gov.bc.ca/vault-secrets-management-service/">
                        {' '}
                        features and functions
                      </Link>
                    </Text>
                  </li>
                  <li>
                    <Text className="">
                      Discover how to begin using
                      <Link href="https://docs.developer.gov.bc.ca/vault-getting-started-guide/">
                        {' '}
                        Vault
                      </Link>
                    </Text>
                  </li>
                  <li>
                    <Text className="">
                      Get more<Link href="https://www.vaultproject.io/"> general information </Link>
                      {' '}
                      about Vault
                    </Text>
                  </li>
                </ul>
              </div>
            </div>
            <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
              <div>
                <Heading className="text-lg">Advanced cluster security (ACS)</Heading>
                <Text className="">
                  Red Hat Advanced Cluster Security (ACS) helps you enforce DevOps and security best practices in your
                  application by finding vulnerabilities in your running containers:
                </Text>
                <ul>
                  <li>
                    <Text className="">We automatically create an access role and scope for your project set</Text>
                  </li>
                  <li>
                    <Text className="">
                      We automatically create a service account for ACS access in your deployment manifests
                    </Text>
                  </li>
                  <li>
                    <Text className="">
                      Read more about the 
                      <Link href="https://digital.gov.bc.ca/cloud/services/"> benefits </Link>
                      {' '}
                      of using ACS
                    </Text>
                  </li>
                  <li>
                    <Text className="">
                      Get more
                      <Link href="https://www.redhat.com/en/technologies/cloud-computing/openshift/advanced-cluster-security-kubernetes">
                        {' '}
                        general information 
                      </Link>
                      {' '}
                      about ACS
                    </Text>
                  </li>
                </ul>
              </div>
            </div>
            <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
              <div>
                <Heading className="text-lg">Sysdig monitoring system</Heading>
                <Text className="">
                  Sysdig Monitor is a monitoring, alerting and data collection tool. You can use Sysdig Monitor to build
                  dashboards to monitor the health, availability and resource usage of your applications:
                </Text>
                <ul>
                  <li>
                    <Text className="">
                      Learn more about
                      <Link href="https://digital.gov.bc.ca/cloud/services/private/products-tools/sysdig/">
                        {' '}
                        Sysdig Monitor and its benefits
                      </Link>
                    </Text>
                  </li>
                  <li>
                    <Text className="">
                      Start the
                      <Link href="https://docs.developer.gov.bc.ca/sysdig-monitor-onboarding/">
                        {' '}
                        onboarding process 
                      </Link>
                      {' '}
                      for Sysdig
                    </Text>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <Closing />
            </div>
          </div>
        </Body>
      </div>
    </TailwindWrapper>
  );
};

export default ProvisionedTemplate;
