import { signIn, signOut, useSession } from 'next-auth/react';

export default function LoginButton() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        Signed in as {session.user?.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }

  return (
    <>
      <button
        className="self-start justify-center rounded-md bg-bcorange px-4 py-2.5 font-bcsans text-bcblue text-sm tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
        onClick={() => signIn('keycloak', { callbackUrl: '/private-cloud/products/all' })}
      >
        LOGIN
      </button>
    </>
  );
}
