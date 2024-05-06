import { signOut as appSignOut } from 'next-auth/react';

export async function signOut(logoutUrl: string, idToken: string) {
  // 1. Sign out from our App.
  await appSignOut({ redirect: false });
  // 2. Sign out from the Keycloak.
  window.location.href = `${logoutUrl}?post_logout_redirect_uri=${window.location.origin}&id_token_hint=${idToken}`;
}
