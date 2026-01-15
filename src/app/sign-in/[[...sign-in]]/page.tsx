import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
      <SignIn />
    </div>
  );
}
