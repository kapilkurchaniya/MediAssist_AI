import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import {
  Brain,
  ShieldCheck,
  CalendarClock,
  BellRing,
  FileSearch,
  Activity,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Prescription Analysis",
    description:
      "Our AI instantly reads and digitizes prescriptions from photos or PDFs, extracting medicine names, dosages, and schedules with clinical-grade accuracy.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: ShieldCheck,
    title: "Medicine Safety Alerts",
    description:
      "Real-time drug interaction checks and allergy warnings powered by a continuously updated medical database. Never take a conflicting medication again.",
    color: "bg-success/10 text-success",
  },
  {
    icon: CalendarClock,
    title: "Smart Daily Scheduling",
    description:
      "Automatically builds a personalized daily medicine schedule from your prescription. Track doses morning, afternoon, and night with a single tap.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: BellRing,
    title: "Dose Reminders",
    description:
      "Never miss a dose with intelligent, context-aware reminders. Log taken or missed doses directly from your dashboard in seconds.",
    color: "bg-warning/10 text-warning",
  },
  {
    icon: FileSearch,
    title: "Blood Report Insights",
    description:
      "Upload blood test results and our AI highlights abnormal values, explains what they mean, and tracks trends over time in plain language.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Activity,
    title: "Health Dashboard",
    description:
      "A unified patient dashboard that shows active medications, upcoming doses, recent prescriptions, and blood report history at a glance.",
    color: "bg-success/10 text-success",
  },
];

const highlights = [
  "Supports PDF, JPG, and PNG prescriptions",
  "HIPAA-compliant data storage",
  "Works with handwritten and printed prescriptions",
  "Multi-language prescription support",
  "One-click prescription archiving",
  "Instant AI feedback in under 10 seconds",
];

export default function FeaturesPage() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Brain className="h-3.5 w-3.5" />
            Powered by Gemini AI
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Everything you need to manage{" "}
            <span className="gradient-text">your medications</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            MediAssist AI combines cutting-edge artificial intelligence with
            clinical data to keep you safe, informed, and on schedule — every
            single day.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={ROUTES.SIGN_UP}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all hover:shadow-lg"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={ROUTES.HOW_IT_WORKS}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-8 py-3.5 text-sm font-semibold text-foreground hover:bg-muted transition-all"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Features built for patients
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              We handle the complexity of medication management so you can focus
              on getting better.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="card-hover relative rounded-xl border border-border bg-card p-8"
                >
                  <div
                    className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Highlights checklist */}
      <section className="py-20 bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-10 shadow-md">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              And much more
            </h2>
            <p className="text-muted-foreground mb-8">
              Every detail has been designed with patient safety and ease of use
              in mind.
            </p>
            <ul className="grid sm:grid-cols-2 gap-4">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to take control of your health?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join thousands of patients who trust MediAssist AI every day.
          </p>
          <Link
            href={ROUTES.SIGN_UP}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
          >
            Start for free — no credit card needed
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}