import { NextRequest, NextResponse } from 'next/server';

function withErrorHandler(fn: (req: NextRequest) => Promise<NextResponse<unknown>>) {
  return async function (request: NextRequest) {
    try {
      return await fn(request);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: 'Internal Server Error', error }, { status: 500 });
    }
  };
}

export default withErrorHandler;
