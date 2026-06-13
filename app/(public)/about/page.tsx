import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { HeartPulse, Shield, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section className="py-24 sm:py-32 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
            We are on a mission to <br className="hidden sm:block" /> simplify healthcare.
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            MediAssist AI was founded on a simple belief: managing your health shouldn't be harder than the illness itself. We use cutting-edge AI to bring clarity, safety, and peace of mind to patients worldwide.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <HeartPulse className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Patient First</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every feature we build starts with the patient in mind. We prioritize ease-of-use and clear communication over complex medical jargon.
              </p>
            </div>
            <div>
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Uncompromising Privacy</h3>
              <p className="text-muted-foreground leading-relaxed">
                Health data is sensitive. We use state-of-the-art encryption and strictly adhere to global healthcare privacy standards (like HIPAA) to ensure your data is always yours alone.
              </p>
            </div>
            <div>
              <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Relentless Innovation</h3>
              <p className="text-muted-foreground leading-relaxed">
                We leverage the latest in Large Language Models and computer vision to extract medical data faster and more accurately than ever before.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-24 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">Join us on this journey</h2>
          <p className="text-muted-foreground mb-10 text-lg">
            Experience the future of personal healthcare management today.
          </p>
          <Link
            href={ROUTES.SIGN_UP}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-md"
          >
            Create your account
          </Link>
        </div>
      </section>
    </div>
  );
}