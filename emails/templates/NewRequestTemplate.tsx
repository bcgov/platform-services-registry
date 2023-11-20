import { PrivateCloudRequestWithRequestedProject } from '@/requestActions/private-cloud/decisionRequest';
import * as React from 'react';
import Header from '../components/Header';
import ProductDetails from '../components/ProductDetails';
import NamespaceDetails from '../components/NamespaceDetails';
import Closing from '../components/Closing';

const styles = {
  border: '1px solid #eaeaea',
  borderRadius: '4px',
  margin: '4px auto',
  padding: '16px',
  maxWidth: '480px',
  backgroundColor: '#ffffff',
};

const headingStyles = {
  fontSize: '1.5rem',
  marginBottom: '16px',
};

const buttonStyles = {
  backgroundColor: '#FFA500',
  borderRadius: '4px',
  padding: '8px 16px',
  color: '#ffffff',
  textDecoration: 'none',
  display: 'inline-block',
};

export const NewRequestTemplate = ({ request }: { request: PrivateCloudRequestWithRequestedProject }) => {
  if (!request) return <></>;

  return (
    <div style={styles}>
      <Header />
      <div style={{ fontFamily: 'sans-serif', fontSize: '12px', margin: 'auto' }}>
        <div style={{ margin: '48px' }}>
          <div style={{ borderBottom: '1px solid #778899', paddingBottom: '16px' }}>
            <h1 style={headingStyles}>New Request!</h1>
            <p>Hi Registry Team,</p>
            <p>
              There is a new request that requires your review. Log in to the Registry to review the details. If you
              have any questions about the request, the PO and TL contact details are included below and in the
              Registry.
            </p>
            <a href="https://dev-pltsvc.apps.silver.devops.gov.bc.ca/private-cloud/products" style={buttonStyles}>
              Review Request
            </a>
          </div>
          <div style={{ margin: '16px 0', borderBottom: '1px solid #778899', paddingBottom: '16px' }}>
            <ProductDetails
              name={request.requestedProject.name}
              description={request.requestedProject.description}
              ministry={request.requestedProject.ministry}
              po={request.requestedProject.projectOwner}
              tl1={request.requestedProject.primaryTechnicalLead}
              tl2={request.requestedProject.secondaryTechnicalLead}
            />
          </div>
          <div style={{ margin: '16px 0', borderBottom: '1px solid #778899', paddingBottom: '16px' }}>
            <NamespaceDetails cluster={request.requestedProject.cluster} />
          </div>
          <div>
            <Closing />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewRequestTemplate;
