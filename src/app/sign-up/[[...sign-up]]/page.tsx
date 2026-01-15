import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
      <SignUp />
    </div>
  );
}
