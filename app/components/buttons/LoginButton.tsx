import { Button } from '@mantine/core';
import { signIn, useSession } from 'next-auth/react';
import { signOut } from '@/helpers/auth';
import { useAppState } from '@/states/global';

export default function LoginButton() {
  const [, appSnapshot] = useAppState();
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        Signed in as {session.user?.email} <br />
        <Button
          color="secondary"
          onClick={async () => {
            await signOut(appSnapshot.info.LOGOUT_URL, session.idToken);
          }}
        >
          Sign out
        </Button>
      </>
    );
  }

  return (
    <>
      <Button color="primary" onClick={() => signIn('keycloak', { callbackUrl: '/home' })}>
        Login
      </Button>
    </>
  );
}
