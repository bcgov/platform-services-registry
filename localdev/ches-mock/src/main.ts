import nodemailer from 'nodemailer';

type EmailAddress = string | undefined;
interface Email {
  bodyType?: 'html' | 'text';
  from?: string;
  subject: string;
  body: string;
  to: EmailAddress[];
  bcc?: EmailAddress[];
  cc?: EmailAddress[];
  delayTS?: number;
  encoding?: 'base64' | 'binary' | 'hex' | 'utf-8';
  priority?: 'normal' | 'low' | 'high';
  tag?: string;
  attachments?: {
    content: string | Buffer;
    filename: string;
    contentType?: string;
    encoding?: 'base64' | 'binary' | 'hex';
  }[];
}

export const sendViaMailPit = async (email: Email): Promise<void> => {
  try {
    // Configure the SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_SERVER || 'localhost',
      port: parseInt(process.env.MAIL_PORT || '1025', 10),
      secure: false,
      auth:
        process.env.MAIL_USERNAME && process.env.MAIL_PASSWORD
          ? {
              user: process.env.MAIL_USERNAME,
              pass: process.env.MAIL_PASSWORD,
            }
          : undefined,
    });

    // Verify SMTP Connection
    await transporter.verify();
    const info = await transporter.sendMail({
      from: email.from || 'Registry PlatformServicesTeam@gov.bc.ca',
      to: email.to.join(', '),
      subject: email.subject,
      html: email.body,
      cc: email.cc ? email.cc.join(', ') : undefined,
      bcc: email.bcc ? email.bcc.join(', ') : undefined,
      attachments: email.attachments,
    });

    console.log(`Email sent via MailPit: ${info.messageId}`);
  } catch (error: any) {
    console.log(`Error sending email via MailPit: ${error.message}`);
  }
};
