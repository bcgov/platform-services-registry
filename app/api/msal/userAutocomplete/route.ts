import { NextRequest, NextResponse } from 'next/server';
import { callMsGraph, getAccessToken } from '@/msal';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  const url = `https://graph.microsoft.com/v1.0/users?$filter=startswith(mail,'${email}')&$orderby=userPrincipalName&$count=true&$top=25`;

  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return new NextResponse('No access token', { status: 400 });
    }

    const response = await callMsGraph(url, accessToken);
    const data = await response.json();

    return NextResponse.json(data.value);
  } catch (error) {
    console.error('ERROR');
    console.error(error);
    return NextResponse.error();
  }
}
