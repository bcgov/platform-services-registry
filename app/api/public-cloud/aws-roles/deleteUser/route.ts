import { removeUserFromGroup } from '@/app/api/public-cloud/aws-roles/route';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest, res: NextResponse) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const groupId = searchParams.get('groupId');
  console.log('groupId', groupId);
  try {
    let result;
    if (userId && groupId) {
      result = await removeUserFromGroup(userId, groupId);
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
