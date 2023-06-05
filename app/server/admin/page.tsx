"use client";

import { useSession } from "next-auth/react";

export default function Page() {
  const { data } = useSession();

  if (data?.user?.roles?.includes("admin")) {
    return (
      <div>
        <p>You are an admin, welcome!</p>
        <p>These are your roles: {data?.user?.roles}</p>
        <p>Email: {data?.user?.email}</p>
      </div>
    );
  }

  return <p>You are not authorized to view this page!</p>;
}
