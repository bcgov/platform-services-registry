import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { EmailTemplate } from '../../../components/email/EmailTemplate';
import { PrivateCloudCreateRequestBodySchema, PrivateCloudCreateRequestBody } from '@/schema';
import React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.json();

  //// Validation
  const parsedBody = PrivateCloudCreateRequestBodySchema.safeParse(body);
  if (!parsedBody.success) {
    return new NextResponse(parsedBody.error.message, { status: 400 });
  }
  const formData: PrivateCloudCreateRequestBody = parsedBody.data;

  try {
    resend.emails.send({
      from: 'onboarding@resend.dev',
      to: '02c.albert@gmail.com',
      subject: 'Private Cloud Request',
      react: React.createElement(EmailTemplate, { body: formData }),
    });

    return new NextResponse('Success sending email request', {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return new NextResponse('Error sending email request', {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
