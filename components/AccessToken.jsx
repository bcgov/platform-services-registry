import { useSession, signIn, signOut } from "next-auth/react";

export default function Component() {
  const { data } = useSession();
  const { accessToken } = data;

  return <div>Access Token: {accessToken}</div>;
}
