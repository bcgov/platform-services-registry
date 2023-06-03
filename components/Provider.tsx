"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface ProviderProps {
  children: ReactNode;
}

const Provider: React.FC<ProviderProps> = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default Provider;
