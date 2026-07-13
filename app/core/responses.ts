import { stringify } from 'csv-stringify/sync';
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

// Build a safe Content-Disposition header value. Strips CR/LF, quotes, and backslashes to
// prevent header injection, quotes the ASCII fallback, and adds an RFC 5987 filename* for
// clients that support it.
function contentDispositionAttachment(filename: string) {
  const sanitized = filename.replace(/[\r\n"\\]/g, '').trim() || 'download';
  const encoded = encodeURIComponent(sanitized);
  return `attachment; filename="${sanitized}"; filename*=UTF-8''${encoded}`;
}

export function CsvResponse<T extends Record<string, any>>(data: T[], filename = 'download.csv') {
  const csv = stringify(data, {
    header: true,
    columns: data.length > 0 ? Object.keys(data[0]) : [],
  });

  const response = new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': contentDispositionAttachment(filename),
    },
  });

  return response;
}

export function ExcelResponse<T extends Record<string, unknown>>(data: T[], filename = 'download.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Accountability');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': contentDispositionAttachment(filename),
    },
  });
}

export function accountabilityExportResponse<T extends Record<string, unknown>>(
  data: T[],
  basename: string,
  format: 'csv' | 'xlsx' = 'xlsx',
) {
  if (format === 'csv') {
    return CsvResponse(data, `${basename}.csv`);
  }
  return ExcelResponse(data, `${basename}.xlsx`);
}

export function PdfResponse(buffer: Buffer, filename = 'download.pdf') {
  const response = new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': contentDispositionAttachment(filename),
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
