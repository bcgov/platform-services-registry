import { Template } from '@/emails/Template';
import { adminEmails } from './emailConstant';
import chesService from './index';
import { PrivateCloudCreateRequestBodySchema, PrivateCloudCreateRequestBody } from '@/schema';
import { render } from '@react-email/render';
import { PrivateCloudProjectWithContacts } from '@/emails/Template';

export const sendCreateRequestEmails = async (requestedProject: PrivateCloudProjectWithContacts) => {
  const email = render(Template(requestedProject), { pretty: true });

  try {
    await chesService.send({
      bodyType: 'html',
      body: email,
      // For all project contacts. Sent when the project set deletion request is successfully submitted
      to: [
        requestedProject.projectOwner,
        requestedProject.primaryTechnicalLead,
        requestedProject.secondaryTechnicalLead,
      ]
        .filter(Boolean)
        .map((item) => item?.email),
      from: 'Registry <PlatformServicesTeam@gov.bc.ca>',
      subject: `${requestedProject.name} deletion request received`,
    });
    // await chesService.send({
    //   bodyType: "html",
    //   body: email,
    //   to: adminEmails,
    //   from: "Registry <PlatformServicesTeam@gov.bc.ca>",
    //   subject: `New Delete request in Registry waiting for your approval`,
    // });

    // // change 'to' variable to test email
    // const to = "02c.albert@gmail.com"
    // await chesService.send({
    //   bodyType: 'html',
    //   body: email,
    //   to: [to],
    //   from: 'Registry <PlatformServicesTeam@gov.bc.ca>',
    //   subject: `Test`,
    // });
  } catch (error) {
    console.error(error);
  }
};
