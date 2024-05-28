import { signIn, useSession } from 'next-auth/react';
import { signOut } from '@/helpers/auth';
import { useAppState } from '@/states/global';

export default function LoginButton() {
  const [appState, appSnapshot] = useAppState();
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        Signed in as {session.user?.email} <br />
        <button
          onClick={async () => {
            await signOut(appSnapshot.info.LOGOUT_URL, session.idToken);
          }}
        >
          Sign out
        </button>
      </>
    );
  }

  return (
    <>
      <button
        className="self-start justify-center rounded-md bg-bcorange px-4 py-2.5 text-bcblue text-sm tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
        onClick={() => signIn('keycloak', { callbackUrl: '/home' })}
      >
        LOGIN
      </button>
    </>
  );
}
