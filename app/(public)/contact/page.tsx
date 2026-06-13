import { Mail, MessageSquare, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <div className="bg-background min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
            Get in touch
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Have questions about MediAssist AI? Need help with your account? Our team is here to assist you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Contact Info */}
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Email Support</h3>
                    <p className="text-muted-foreground mt-1">support@mediassist.ai</p>
                    <p className="text-sm text-muted-foreground mt-1">We aim to respond within 24 hours.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-success/10 p-3">
                    <MessageSquare className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Live Chat</h3>
                    <p className="text-muted-foreground mt-1">Available in the app</p>
                    <p className="text-sm text-muted-foreground mt-1">Mon-Fri, 9am - 5pm EST.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-warning/10 p-3">
                    <MapPin className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Co-Founder Office</h3>
                    <p className="text-muted-foreground mt-1">KATARA HILLS, BHOPAL ,462026</p>
                    <p className="text-sm text-muted-foreground mt-1">SAGAR GOLDEN PALM APARTMENT 3</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">FAQ</h2>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground">Is my medical data secure?</h4>
                  <p className="text-muted-foreground text-sm mt-2">Yes, we use enterprise-grade encryption and comply with all major health data privacy regulations including HIPAA.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Can I cancel my Pro subscription?</h4>
                  <p className="text-muted-foreground text-sm mt-2">Absolutely. You can cancel or pause your subscription at any time from your account settings.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground mb-6">Send us a message</h2>
            <form className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="first-name" className="text-sm font-medium text-foreground">First Name</label>
                  <input
                    type="text"
                    id="first-name"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Jane"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="last-name" className="text-sm font-medium text-foreground">Last Name</label>
                  <input
                    type="text"
                    id="last-name"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</label>
                <input
                  type="email"
                  id="email"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="jane@example.com"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-foreground">Message</label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  placeholder="How can we help you?"
                />
              </div>
              <Button type="button" className="w-full py-6 text-base">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}