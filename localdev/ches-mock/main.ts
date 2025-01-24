import nodemailer from 'nodemailer';
import { z } from 'zod';
import express, { Request, Response, NextFunction } from 'express';
import { SMTP_HOST, SMTP_PORT, PORT, SMTP_USERNAME, SMTP_PASSWORD } from './config.js';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

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

const transportOptions: SMTPTransport.Options = {
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: false, // Set true if TLS is required
  auth:
    SMTP_USERNAME && SMTP_PASSWORD
      ? {
          user: SMTP_USERNAME,
          pass: SMTP_PASSWORD,
        }
      : undefined,
};

const transporter = nodemailer.createTransport(transportOptions);

export const sendViaMailPit = async (email: z.infer<typeof EmailSchema>): Promise<nodemailer.SentMessageInfo> => {
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
  return info;
};

app.post('/email', async (req: Request, res: Response): Promise<void> => {
  const email = EmailSchema.parse(req.body);
  const info = await sendViaMailPit(email);
  console.log('Success:', info);
  res.json({ success: true, info });
});

app.get('/health', async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  const statusCode = err.status || 500;

  res.status(statusCode).json({
    error: 'An error occurred',
    message: err.message || 'Internal Server Error',
    details: err.errors || null,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
