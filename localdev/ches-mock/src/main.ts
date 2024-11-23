import nodemailer from 'nodemailer';
import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());
const port = 3025;
interface Email {
  from?: string;
  subject: string;
  body: string;
  to: string[]; // Ensure 'to' is a string array
  cc?: string[];
  bcc?: string[];
  attachments?: {
    content: string | Buffer;
    filename: string;
    contentType?: string;
    encoding?: 'base64' | 'binary' | 'hex';
  }[];
}

// Email sending function
export const sendViaMailPit = async (email: Email): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'mailpit', // Use MailPit's service name from Docker Compose
      port: 1025,
      secure: false, // MailPit does not require TLS/SSL
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
      from: email.from || 'Registry <PlatformServicesTeam@gov.bc.ca>',
      to: email.to.join(', '),
      subject: email.subject,
      html: email.body,
      cc: email.cc ? email.cc.join(', ') : undefined,
      bcc: email.bcc ? email.bcc.join(', ') : undefined,
      attachments: email.attachments,
    });

    console.log(`Email sent via MailPit: ${info.messageId}`);
  } catch (error: any) {
    console.error(`Error sending email via MailPit: ${error.message}`);
    throw error; // Re-throw the error for the caller to handle
  }
};

// API endpoint to send emails
app.post('/email', async (req: Request, res: Response): Promise<void> => {
  try {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    await sendViaMailPit({ to, subject, body });
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
