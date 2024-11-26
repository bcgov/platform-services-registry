import sanitizeHtml from 'sanitize-html';
import nodemailer from 'nodemailer';
import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());
const port = 3025;

interface Email {
  from?: string;
  subject: string;
  body: string;
  to: string[];
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
      host: 'mailpit',
      port: 1025,
      secure: false,
      auth:
        process.env.MAIL_USERNAME && process.env.MAIL_PASSWORD
          ? {
              user: process.env.MAIL_USERNAME,
              pass: process.env.MAIL_PASSWORD,
            }
          : undefined,
    });

    // Sanitize the email body
    const sanitizedBody = sanitizeHtml(email.body, {
      allowedTags: [
        'html',
        'head',
        'body',
        'div',
        'h1',
        'h2',
        'p',
        'a',
        'img',
        'meta',
        'link',
        'span',
        'hr',
        // Add other tags as required
      ],
      allowedAttributes: {
        '*': ['style', 'class', 'dir'], // Allow global attributes
        a: ['href', 'target'], // Allow attributes for links
        img: ['src', 'alt', 'width', 'height'], // Allow attributes for images
        meta: ['content', 'http-equiv'],
        link: ['rel', 'href', 'as'], // Preload links for images
      },
      allowedSchemes: ['http', 'https', 'mailto'], // Allow safe URL schemes
      allowedSchemesByTag: {
        img: ['http', 'https'],
        a: ['http', 'https', 'mailto'],
      },
    });

    // Verify SMTP Connection
    await transporter.verify();

    const info = await transporter.sendMail({
      from: email.from || 'Registry <PlatformServicesTeam@gov.bc.ca>',
      to: email.to.join(', '),
      subject: email.subject,
      html: sanitizedBody, // Use the sanitized body
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

app.post('/email', async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to, subject, body, cc, bcc, attachments } = req.body;

    if (!to || !subject || !body) {
      res.status(400).json({ error: 'Missing required fields: "to", "subject", or "body"' });
      return;
    }

    await sendViaMailPit({ from, to, subject, body, cc, bcc, attachments });
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
