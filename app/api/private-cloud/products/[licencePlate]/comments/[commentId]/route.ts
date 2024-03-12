import { NextResponse } from 'next/server';
import deleteOp from '../_operations/delete';
import readOp from '../_operations/read';
import updateOp from '../_operations/update';

export async function GET() {
  const data = await readOp();
  return NextResponse.json(data);
}

export async function PUT() {
  const data = await updateOp();
  return NextResponse.json(data);
}

export async function DELETE() {
  const data = await deleteOp();
  return NextResponse.json(data);
}
