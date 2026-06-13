import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { ArrowRight, UploadCloud, BrainCircuit, BellRing } from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      icon: UploadCloud,
      title: "1. Upload Prescription",
      description: "Snap a photo of your handwritten prescription or upload a PDF. MediAssist accepts any format directly from your device.",
    },
    {
      icon: BrainCircuit,
      title: "2. AI Analysis",
      description: "Our secure AI reads the document, extracts the exact medicines, dosages, and instructions, and runs a comprehensive safety check.",
    },
    {
      icon: BellRing,
      title: "3. Get Reminders",
      description: "Your schedule is instantly created. Get notified when it's time to take your dose and simply tap to record it in your log.",
    }
  ];

  return (
    <div className="bg-background min-h-screen">
      <section className="py-24 sm:py-32 text-center border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
            From paper to digital in seconds
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We've eliminated the tedious process of manually typing out your medicine names and schedules. Just upload, review, and relax.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-border -z-10" />

            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex flex-col items-center text-center relative z-10 bg-background pt-4">
                  <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm mb-8">
                    <Icon className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-24 text-center bg-card rounded-3xl p-12 border border-border shadow-sm max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-6">Ready to simplify your health?</h2>
            <Link
              href={ROUTES.SIGN_UP}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-md"
            >
              Get Started Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}