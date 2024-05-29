// RegisterProductButton.js
import { signIn, useSession } from 'next-auth/react';

export default function RegisterProductButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <button
        className="self-start justify-center rounded-md bg-bcorange px-4 py-2.5 text-bcblue text-sm tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
        onClick={() => {}}
      >
        Register a new product
      </button>
    );
  }

  return (
    <button
      className="self-start justify-center rounded-md bg-bcorange px-4 py-2.5 text-bcblue text-sm tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
      onClick={() => signIn('keycloak', { callbackUrl: '/home' })}
    >
      REGISTER A NEW PRODUCT (LOG IN WITH BC IDIR)
    </button>
  );
}
