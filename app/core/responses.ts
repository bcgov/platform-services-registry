import { stringify } from 'csv-stringify/sync';
import { NextResponse } from 'next/server';

export function CsvResponse<T extends Record<string, any>>(data: T[], filename = 'download.csv') {
  const csv = stringify(data, {
    header: true,
    columns: data.length > 0 ? Object.keys(data[0]) : [],
  });

  const response = new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=${filename}`,
    },
  });

  return response;
}

export function PdfResponse(buffer: Buffer | string, filename = 'download.pdf') {
  const response = new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `'attachment; filename=${filename}'`,
    },
  });

  return response;
}

export function BadRequestResponse(error: any) {
  return NextResponse.json({ success: false, message: 'Bad Request', error }, { status: 400 });
}

export function UnauthorizedResponse(error: any = 'not allowed to perform the task') {
  return NextResponse.json({ success: false, message: 'Unauthorized', error }, { status: 401 });
}

export function ForbiddenResponse(error: any) {
  return NextResponse.json({ success: false, message: 'Forbidden', error }, { status: 403 });
}

export function NotFoundResponse(error: any) {
  return NextResponse.json({ success: false, message: 'Not Found', error }, { status: 404 });
}

export function UnprocessableEntityResponse(error: any) {
  return NextResponse.json({ success: false, message: 'Unprocessable Entity', error }, { status: 422 });
}

export function InternalServerErrorResponse(error: any) {
  return NextResponse.json({ success: false, message: 'Internal Server Error', error }, { status: 500 });
}

export function OkResponse<T>(data: T) {
  return NextResponse.json(data, { status: 200 });
}

export function CreatedResponse<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function NoContent() {
  return new Response(null, { status: 204 });
}

export function getResponse<T>(response: NextResponse<T>) {
  return response.json();
}
