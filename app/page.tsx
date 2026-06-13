import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import PublicNavbar from "@/components/layout/PublicNavbar";
import Footer from "@/components/layout/Footer";
import { ArrowRight, ShieldCheck, Zap, Calendar, FileText, Brain, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "MediAssist AI — Prescription Digitizer & Medicine Safety Checker",
  description:
    "Digitize handwritten prescriptions, detect drug interactions, generate medicine schedules, and empower patients with AI-powered healthcare tools.",
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Brain className="h-4 w-4" />
                Powered by Google Gemini AI
              </div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Your Prescriptions,{" "}
                <span className="gradient-text">Digitized & Safe</span>
              </h1>
              <p className="max-w-lg text-lg text-muted-foreground">
                Upload a photo of any handwritten prescription. Our AI instantly
                extracts medicines, checks for drug interactions, and generates
                your daily schedule.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href={ROUTES.SIGN_UP}>
                  <Button size="lg" className="gap-2 text-base">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={ROUTES.HOW_IT_WORKS}>
                  <Button variant="outline" size="lg" className="text-base">
                    See How It Works
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero graphic */}
            <div className="hidden lg:flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl" />
                <div className="relative rounded-2xl border bg-card p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-3 w-3 rounded-full bg-danger" />
                    <div className="h-3 w-3 rounded-full bg-warning" />
                    <div className="h-3 w-3 rounded-full bg-success" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="h-2 w-24 rounded bg-primary/20" />
                        <div className="mt-1 h-2 w-16 rounded bg-muted" />
                      </div>
                      <span className="text-xs font-medium text-success">✓ Extracted</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-success/5 p-3">
                      <ShieldCheck className="h-5 w-5 text-success" />
                      <div className="flex-1">
                        <div className="h-2 w-28 rounded bg-success/20" />
                        <div className="mt-1 h-2 w-20 rounded bg-muted" />
                      </div>
                      <span className="text-xs font-medium text-success">Safe</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-warning/5 p-3">
                      <Calendar className="h-5 w-5 text-warning" />
                      <div className="flex-1">
                        <div className="h-2 w-20 rounded bg-warning/20" />
                        <div className="mt-1 h-2 w-14 rounded bg-muted" />
                      </div>
                      <span className="text-xs font-medium text-warning">Scheduled</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-background py-20 lg:py-24" id="features">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need for safer prescriptions
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From handwritten scribbles to a structured digital schedule — in seconds.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Zap,
                title: "AI OCR Extraction",
                desc: "Gemini Vision reads handwritten prescriptions and extracts medicines, dosages, and instructions automatically.",
                color: "primary",
              },
              {
                icon: ShieldCheck,
                title: "Drug Interaction Checks",
                desc: "Instantly detect potentially dangerous drug combinations and duplicate therapies.",
                color: "success",
              },
              {
                icon: Calendar,
                title: "Smart Schedule",
                desc: "Auto-generated medicine schedules organized by Morning, Afternoon, Evening, and Night.",
                color: "warning",
              },
              {
                icon: FileText,
                title: "Prescription History",
                desc: "All your prescriptions stored securely, accessible anytime from any device.",
                color: "primary",
              },
              {
                icon: Pill,
                title: "Medicine Database",
                desc: "Extracted medicines are normalized and cross-referenced for accuracy.",
                color: "secondary",
              },
              {
                icon: Brain,
                title: "AI Risk Scoring",
                desc: "Each prescription gets an automatic risk level — Low, Medium, or High — so doctors can prioritize reviews.",
                color: "danger",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group flex flex-col rounded-xl border bg-card p-8 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${feature.color}/10 mb-5`}
                >
                  <feature.icon className={`h-6 w-6 text-${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to digitize your prescriptions?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Join thousands of doctors and patients who are already using MediAssist AI
            to make healthcare safer and smarter.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href={ROUTES.SIGN_UP}>
              <Button size="lg" className="gap-2 text-base">
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
