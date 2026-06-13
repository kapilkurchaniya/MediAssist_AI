import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary:
              "bg-primary hover:bg-primary-dark text-primary-foreground",
            card: "bg-card shadow-lg rounded-xl border border-border",
          },
        }}
        routing="path"
        path="/sign-up"
      />
    </div>
  );
}
