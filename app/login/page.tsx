"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import LoginButton from "@/components/buttons/LoginButton";

export default function SignInPage() {
  const router = useRouter();

  return (
    <section className="py-24">
      <div className="container">
        <h1 className="text-2xl font-bold">This is the login page</h1>
        <LoginButton />
      </div>
    </section>
  );
}
