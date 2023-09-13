import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const ServerProtectedPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    console.log("No session found");
    redirect("/signin?callbackUrl=/protected/server");
  }

  return (
    <>
      <h1>Server Side Protected Page</h1>
      <p>
        This page is protected and can only be accessed by authenticated users.
      </p>
    </>
  );
};

export default ServerProtectedPage;
