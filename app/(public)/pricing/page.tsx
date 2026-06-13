import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { Check, ArrowRight } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="bg-background min-h-screen py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Choose the plan that best fits your medical needs. Upgrade anytime as your requirements grow.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <div className="rounded-3xl border border-border bg-card p-10 shadow-sm flex flex-col">
            <h3 className="text-2xl font-bold text-foreground mb-2">Basic</h3>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-foreground">$0</span>
              <span className="text-muted-foreground font-medium">/ forever</span>
            </div>
            <p className="text-muted-foreground mb-8">
              Perfect for managing a few active prescriptions and basic reminders.
            </p>
            <ul className="space-y-4 mb-10 flex-1">
              {["5 Active Prescriptions", "Daily Reminders", "Basic AI parsing", "Email Support"].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-foreground">
                  <div className="rounded-full bg-success/20 p-1">
                    <Check className="h-4 w-4 text-success" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href={ROUTES.SIGN_UP}
              className="w-full inline-flex justify-center items-center gap-2 rounded-lg border-2 border-primary bg-transparent px-8 py-3 text-sm font-semibold text-primary hover:bg-primary/5 transition-all"
            >
              Start Free
            </Link>
          </div>

          {/* Premium Tier */}
          <div className="rounded-3xl border-2 border-primary bg-card p-10 shadow-lg flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-bl-lg uppercase tracking-wider">
              Recommended
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Pro</h3>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-foreground">$9</span>
              <span className="text-muted-foreground font-medium">/ month</span>
            </div>
            <p className="text-muted-foreground mb-8">
              For comprehensive health tracking, advanced safety checks, and priority AI.
            </p>
            <ul className="space-y-4 mb-10 flex-1">
              {[
                "Unlimited Prescriptions", 
                "Advanced Drug Interaction Warnings", 
                "Blood Report Analysis", 
                "Priority AI Processing",
                "Export logs for doctor",
                "24/7 Priority Support"
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-foreground">
                  <div className="rounded-full bg-primary/20 p-1">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href={ROUTES.SIGN_UP}
              className="w-full inline-flex justify-center items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-md"
            >
              Upgrade to Pro
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}