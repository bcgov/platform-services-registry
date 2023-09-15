"use client";

import { useSession } from "next-auth/react";

export default function Page() {
  const { data: session, status } = useSession();

  console.log("SESSION: ", session);

  if (session?.user?.roles?.includes("admin")) {
    return (
      <div>
        <p>You are an admin, welcome!</p>
        <p>These are your roles: {session?.user?.roles}</p>
        <p>Email: {session?.user?.email}</p>
      </div>
    );
  }

  return <p>You are not authorized to view this page!</p>;
}
