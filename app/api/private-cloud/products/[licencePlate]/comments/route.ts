import { NextResponse } from 'next/server';
import createOp from './[commentId]/_operations/create';
import listOp from './[commentId]/_operations/list';

export async function POST() {
  const data = await createOp();
  return NextResponse.json(data);
}

export async function GET() {
  const data = await listOp();
  return NextResponse.json(data);
}
