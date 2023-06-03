import LoginButton from "@/components/LoginButton";

export default function SignInPage() {
  return (
    <section className="py-24">
      <div className="container">
        <h1 className="text-2xl font-bold">This is the login page</h1>
        <h2 className="mt-4 font-medium">You are not logged in</h2>
        <p className="mt-4">Please sign in to continue</p>
        <LoginButton />
      </div>
    </section>
  );
}
