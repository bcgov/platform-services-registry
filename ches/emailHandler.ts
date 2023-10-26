import { Template } from '@/emails/Template';
import { adminEmails } from './emailConstant';
import chesService from './index';
import { PrivateCloudCreateRequestBodySchema, PrivateCloudCreateRequestBody } from '@/schema';
import { render } from '@react-email/render';

export const sendCreateRequestEmails = async (formData: PrivateCloudCreateRequestBody) => {
  const email = render(Template({ formData }), { pretty: true });
  try {
    // await chesService.send({
    //   bodyType: "html",
    //   body: email,
    //   // For all project contacts. Sent when the project set deletion request is successfully submitted
    //   to: [
    //     formData.projectOwner,
    //     formData.primaryTechnicalLead,
    //     formData.secondaryTechnicalLead,
    //   ]
    //     .filter(Boolean)
    //     .map((item) => item?.email),
    //   from: "Registry <PlatformServicesTeam@gov.bc.ca>",
    //   subject: `${formData.name} deletion request received`,
    // });
    // await chesService.send({
    //   bodyType: "html",
    //   body: email,
    //   to: adminEmails,
    //   from: "Registry <PlatformServicesTeam@gov.bc.ca>",
    //   subject: `New Delete request in Registry waiting for your approval`,
    // });

    await chesService.send({
      bodyType: 'html',
      body: email,
      to: ['02c.albert@gmail.com'],
      from: 'Registry <PlatformServicesTeam@gov.bc.ca>',
      subject: `Test`,
    });
  } catch (error) {
    console.error(error);
  }
};
