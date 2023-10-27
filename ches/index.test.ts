import { sendCreateRequestEmails } from '@/ches/emailHandler';
import { PrivateCloudCreateRequestBody } from '@/schema';

const formData: PrivateCloudCreateRequestBody = {
  name: 'CHES1',
  description: 'sample description',
  cluster: 'KLAB',
  ministry: 'CITZ',
  projectOwner: {
    firstName: 'John',
    lastName: 'Doe',
    email: '02c.albert@gmail.com',
    ministry: 'CITZ',
  },
  primaryTechnicalLead: {
    firstName: 'Jane',
    lastName: 'Doe',
    email: '02c.albert@gmail.com',
    ministry: 'CITZ',
  },
  commonComponents: {
    addressAndGeolocation: { planningToUse: true, implemented: false },
    workflowManagement: { planningToUse: false, implemented: false },
    formDesignAndSubmission: { planningToUse: false, implemented: false },
    identityManagement: { planningToUse: false, implemented: false },
    paymentServices: { planningToUse: false, implemented: false },
    documentManagement: { planningToUse: false, implemented: false },
    endUserNotificationAndSubscription: { planningToUse: false, implemented: false },
    publishing: { planningToUse: false, implemented: false },
    businessIntelligence: { planningToUse: false, implemented: false },
    other: '',
    noServices: false,
  },
};

describe('Test CHES API endpoint', () => {
  test('Should send email to PO and Technical Lead', async () => {
    sendCreateRequestEmails(formData);
  });
});
