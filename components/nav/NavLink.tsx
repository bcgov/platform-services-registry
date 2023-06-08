"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

export default function NavLink({
  href,
  children
}: {
  href: string;
  children: React.ReactNode;
}) {
  const segment = useSelectedLayoutSegment();
  const active = href === `/${segment}`;

  return <Link href={href}>{children}</Link>;
}
