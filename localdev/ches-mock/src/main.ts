import sanitizeHtml from 'sanitize-html';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import express, { Request, Response, NextFunction } from 'express';
import { CHES_MOCK_PORT, CHES_CLIENT_ID, CHES_CLIENT_SECRET } from './config.js';

const app = express();
app.use(express.json());

const EmailSchema = z.object({
  from: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  to: z.array(z.string()).nonempty('Recipient list ("to") cannot be empty'),
  body: z.string().min(1, 'Body is required'),
  cc: z.array(z.string()).optional(),
  bcc: z.array(z.string()).optional(),
  attachments: z
    .array(
      z.object({
        content: z.union([z.string(), z.instanceof(Buffer)]),
        filename: z.string(),
        contentType: z.string().optional(),
        encoding: z.enum(['base64', 'binary', 'hex']).optional(),
      }),
    )
    .optional(),
});

const transporter = nodemailer.createTransport({
  host: 'mailpit',
  port: 1025,
  secure: false,
  auth:
    CHES_CLIENT_ID && CHES_CLIENT_SECRET
      ? {
          user: CHES_CLIENT_ID,
          pass: CHES_CLIENT_SECRET,
        }
      : undefined,
});

// Email sending function
export const sendViaMailPit = async (email: z.infer<typeof EmailSchema>): Promise<nodemailer.SentMessageInfo> => {
  const sanitizedBody = sanitizeHtml(email.body, {
    allowedTags: ['html', 'head', 'body', 'div', 'h1', 'h2', 'p', 'a', 'img', 'meta', 'link', 'span', 'hr'],
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
  return info;
};

app.post('/email', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const email = EmailSchema.parse(req.body);
    const info = await sendViaMailPit(email);
    res.status(200).json({
      message: 'Email sent successfully',
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response, // SMTP response
    });
  } catch (error: any) {
    next(error);
  }
});

// Error-handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack); // Log the error stack for debugging
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: 'An error occurred',
    message: err.message || 'Internal Server Error',
    details: err.errors || null, // Include validation errors, if any
  });
});

app.listen(CHES_MOCK_PORT, () => {
  console.log(`Server is running on http://localhost:${CHES_MOCK_PORT}`);
});
