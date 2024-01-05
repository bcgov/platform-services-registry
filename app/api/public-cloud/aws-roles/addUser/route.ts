import { addUserToGroupByEmail } from '@/app/api/public-cloud/aws-roles/route';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, res: NextResponse) {
  const { searchParams } = new URL(req.url);
  const userEmail = searchParams.get('userEmail');
  const groupId = searchParams.get('groupId');

  try {
    let result;
    if (userEmail && groupId) {
      result = await addUserToGroupByEmail(userEmail, groupId);
    }

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 400,
      },
    );
  }
}
