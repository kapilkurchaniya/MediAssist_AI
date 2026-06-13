import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { ShieldCheck, FileText, Clock, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full px-4 py-20 text-center sm:px-6 lg:px-8 xl:py-32">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Sparkles className="mr-2 h-4 w-4" />
            AI-Powered Healthcare SaaS
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
            Digitize Prescriptions & Check <span className="gradient-text">Medicine Safety</span> Instantly
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-balance">
            MediAssist AI helps doctors digitize handwritten prescriptions and empowers patients to understand their medicines, check for dangerous interactions, and manage their daily schedules.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={ROUTES.SIGN_UP}>
              <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20">
                Start as Patient
              </Button>
            </Link>
            <Link href={ROUTES.SIGN_UP}>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                Start as Doctor
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">No credit card required for demo.</p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full bg-muted-light/50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need for safe medication
            </h2>
          </div>
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border bg-card p-8 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary-light text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-card-foreground">AI Prescription OCR</h3>
              <p className="text-muted-foreground">
                Upload any prescription image. Our advanced AI instantly extracts medicines, dosages, and instructions with high accuracy.
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-8 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-warning-light text-warning">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-card-foreground">Safety & Interaction Checks</h3>
              <p className="text-muted-foreground">
                Automatically checks for drug-drug interactions and duplicate medicines using official RxNav and FDA databases.
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-8 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-success-light text-success">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-card-foreground">Smart Schedules</h3>
              <p className="text-muted-foreground">
                Generates easy-to-follow daily medicine schedules. Never miss a dose with clear instructions and reminders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl bg-primary px-6 py-16 shadow-2xl sm:px-12 sm:py-20 lg:px-16">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl text-balance">
            Ready to upgrade your healthcare experience?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-light text-balance">
            Join MediAssist AI today to ensure your medicine intake is safe, understood, and perfectly scheduled.
          </p>
          <div className="mt-10">
            <Link href={ROUTES.SIGN_UP}>
              <Button size="lg" variant="secondary" className="h-12 px-8 text-base bg-white text-primary hover:bg-gray-100">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
