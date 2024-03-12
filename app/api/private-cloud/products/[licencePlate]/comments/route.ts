import { NextResponse } from 'next/server';
import createOp from './_operations/create';
import listOp from './_operations/list';

export async function POST() {
  const data = await createOp();
  return NextResponse.json(data);
}

export async function GET() {
  const data = await listOp();
  return NextResponse.json(data);
}
