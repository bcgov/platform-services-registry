import { PrivateCloudRequestWithRequestedProject } from '@/requestActions/private-cloud/decisionRequest';
import * as React from 'react';
import Header from '../../_components/Header';
import ProductDetails from '../../_components/ProductDetails';
import { Body, Button, Heading, Text, Link } from '@react-email/components';
import NamespaceDetails from '../../_components/NamespaceDetails';
import Closing from '../../_components/Closing';
import TailwindWrapper from '../../_components/TailwindWrapper';

interface EmailProp {
  request: PrivateCloudRequestWithRequestedProject;
}

const RequestApprovalTemplate = ({ request }: EmailProp) => {
  if (!request) return <></>;

  return (
    <TailwindWrapper>
      <div className="border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl">
        <Header />
        <Body className="bg-white my-auto mx-auto font-sans text-xs text-darkergrey">
          <div className="m-12">
            <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
              <Heading className="text-lg text-black">Hurray! Your Create request was approved and completed!</Heading>
              <Text>Hi {request.requestedProject.projectOwner.firstName}, </Text>
              <Text className="">
                Your request for a new project set for your product on the Private Cloud Openshift platform is complete.
                Log in to the cluster console using the button below and you&apos;ll see all four namespaces included in
                a project set. If you have any more questions, reach out to the Platform Services team in the RocketChat
                channel
                <Link href="https://chat.developer.gov.bc.ca/channel/devops-operations"> #devops-operations</Link>.
              </Text>
              <Text className="">
                The Product Owner and the Technical Lead have been provisioned with admin access to the namespaces below
                and can add other users as necessary. Please note that if a Product Owner or a Technical Lead is removed
                as a project contact in the Platform Registry, they will lose their access to the project set namespaces
                in Openshift. The new Product or Technical Lead provided on the product details page will gain the
                administrative access to the namespaces.
              </Text>
              <Text className="">
                Please check<Link href="https://docs.developer.gov.bc.ca/"> the Technical Documentation website </Link>
                for Private Cloud Openshift platform at to learn about tools and services available for product teams as
                well as about application security best practices.
              </Text>
              <Button
                href="https://registry.developer.gov.bc.ca/"
                className="bg-bcorange rounded-md px-4 py-2 text-white"
              >
                Log in to Console
              </Button>
            </div>
            <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
              <ProductDetails
                name={request.requestedProject.name}
                description={request.requestedProject.description}
                ministry={request.requestedProject.ministry}
                po={request.requestedProject.projectOwner}
                tl1={request.requestedProject.primaryTechnicalLead}
                tl2={request.requestedProject.secondaryTechnicalLead}
              />
            </div>
            <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
              <NamespaceDetails cluster={request.requestedProject.cluster} licencePlate={request.licencePlate} />
            </div>
            <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
              <div>
                <Heading className="text-lg">Comment</Heading>
                <div> {request.humanComment}</div>
              </div>
            </div>
            <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
              <div>
                <Heading className="text-lg">Security Tools</Heading>
                <Text className="">
                  Your new OpenShift project set includes access to free security tools available to product teams on
                  the Private Cloud Openshift, including: the Artifactory Trusted Artifact Repository repository, the
                  Vault Secrets Management Service, Sysdig Monitoring Service and the Advanced Cluster Security (ACS)
                  Vulnerability Scanning Service. You can read more about these tools
                  <Link href="https://docs.developer.gov.bc.ca/"> here</Link>.
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
                      A service account has been created for you with read access to Artifactory. This includes locally
                      cached container images for faster builds and pod startup, as well as access to useful pre-built
                      images maintained by the Platform Services Team
                    </Text>
                  </li>
                  <li>
                    <Text className="">
                      It is also possible to create your own project in Artifactory for storing builds and other
                      artifacts
                    </Text>
                  </li>
                  <li>
                    <Text className="">
                      Find out
                      <Link href="https://docs.developer.gov.bc.ca/image-artifact-management-with-artifactory/">
                        {' '}
                        how to manage images and artifacts with Artifactory
                      </Link>
                    </Text>
                  </li>
                  <li>
                    <Text className="">
                      Learn more about
                      <Link href="https://docs.developer.gov.bc.ca/prebuilt-images/">
                        {' '}
                        the pre-built images maintained by the Platform Services Team
                      </Link>
                    </Text>
                  </li>
                  <li>
                    <Text className="">
                      Get more<Link href="https://jfrog.com/artifactory/"> general information about Artifactory</Link>
                    </Text>
                  </li>
                  <li>
                    <Text className="">
                      Read more about how to
                      <Link href="https://docs.developer.gov.bc.ca/setup-artifactory-project-repository/">
                        {' '}
                        set up your own Artifactory project
                      </Link>
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
                    <Text className="">Access is automatically granted to Product Owners and Technical Leads</Text>
                  </li>
                  <li>
                    <Text className="">
                      A service account is created automatically for Vault access in your deployment manifests
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
                      Find out
                      <Link href="https://docs.developer.gov.bc.ca/vault-getting-started-guide/">
                        {' '}
                        how to start using Vault
                      </Link>
                    </Text>
                  </li>
                  <li>
                    <Text className="">
                      Get more<Link href="https://www.vaultproject.io/"> general information about Vault</Link>
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
                    <Text className="">An access role and scope are created for your project set automatically</Text>
                  </li>
                  <li>
                    <Text className="">
                      A service account is created automatically for ACS access from your deployment manifests.
                    </Text>
                  </li>
                  <li>
                    <Text className="">
                      Read more about ACS the
                      <Link href="https://digital.gov.bc.ca/cloud/services/"> benefits of using ACS</Link>
                    </Text>
                  </li>
                  <li>
                    <Text className="">
                      Get
                      <Link href="https://www.redhat.com/en/technologies/cloud-computing/openshift/advanced-cluster-security-kubernetes">
                        {' '}
                        general information about ACS
                      </Link>
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
                      Start
                      <Link href="https://docs.developer.gov.bc.ca/sysdig-monitor-onboarding/">
                        {' '}
                        the onboarding process for Sysdig
                      </Link>
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

export default RequestApprovalTemplate;
