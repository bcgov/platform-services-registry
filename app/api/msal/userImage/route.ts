import { NextRequest, NextResponse } from "next/server";
import { callMsGraph, getAccessToken } from "@/lib/msal";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  console.log(searchParams);

  const url = `https://graph.microsoft.com/v1.0/users/${email}/photo/$value`;

  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return new NextResponse("No access token", { status: 400 });
    }

    const response = await callMsGraph(url, accessToken);
    const data = await response.arrayBuffer();

    return new NextResponse(data, {
      headers: { "Content-Type": "image/jpeg" },
    });
  } catch (error) {
    console.error("ERROR");
    console.error(error);
    return NextResponse.error();
  }
}
