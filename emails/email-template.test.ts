import { render } from '@react-email/render';
import Template, { NewRequest } from './NewRequest';
import Header from './components/Header';

import ProductDetails from './components/ProductDetails';
import Closing from './components/Closing';
import NamespaceDetails from './components/NamespaceDetails';
import { sampleFormData, sampleRequest } from './components/Params';
import RequestRejection from './RequestRejection';
import RequestApproval from './RequestApproval';

describe('Email template snapshots', () => {
  //test components
  it('returns Header component', () => {
    const email = render(Header());
    expect(email).toMatchSnapshot();
  });

  it('returns ProductDetails component', () => {
    const email = render(
      ProductDetails({
        name: sampleFormData.name,
        description: sampleFormData.description,
        ministry: sampleFormData.ministry,
        po: sampleFormData.projectOwner,
        tl1: sampleFormData.primaryTechnicalLead,
        tl2: sampleFormData.secondaryTechnicalLead,
      }),
    );
    expect(email).toMatchSnapshot();
  });

  it('returns NamespaceDetails component', () => {
    const email = render(NamespaceDetails({ cluster: sampleFormData.cluster }));
    expect(email).toMatchSnapshot();
  });

  it('returns Namespace component if approved', () => {
    const email = render(
      NamespaceDetails({
        cluster: sampleRequest.requestedProject.cluster,
        licencePlate: sampleRequest.licencePlate,
      }),
    );
    expect(email).toMatchSnapshot();
  });

  it('returns Closing component', () => {
    const email = render(Closing());
    expect(email).toMatchSnapshot();
  });

  //test templates
  it('returns NewRequest template', () => {
    const formData = sampleFormData;
    const email = render(NewRequest({ formData: sampleFormData }), { pretty: true });
    expect(email).toMatchSnapshot();
  });

  it('returns NewRequest template', () => {
    const email = render(RequestApproval({ request: sampleRequest }), { pretty: true });
    expect(email).toMatchSnapshot();
  });

  it('returns NewRequest template', () => {
    const email = render(RequestRejection({ request: sampleRequest }), { pretty: true });
    expect(email).toMatchSnapshot();
  });
});
