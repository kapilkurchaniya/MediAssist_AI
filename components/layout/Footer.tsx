import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-1 lg:col-span-2">
            <Link href={ROUTES.HOME} className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="font-bold">M</span>
              </div>
              <span className="text-xl font-bold text-foreground">MediAssist AI</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              AI-powered prescription digitization, medicine safety checking, and schedule management for doctors and patients.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href={ROUTES.FEATURES} className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href={ROUTES.HOW_IT_WORKS} className="hover:text-primary transition-colors">How it Works</Link></li>
              <li><Link href={ROUTES.PRICING} className="hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href={ROUTES.ABOUT} className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href={ROUTES.CONTACT} className="hover:text-primary transition-colors">Contact</Link></li>
              <li><a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Twitter</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href={ROUTES.PRIVACY_POLICY} className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href={ROUTES.TERMS} className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><span className="text-xs border px-2 py-1 rounded bg-muted-light">HIPAA Guidelines Applied</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} MediAssist AI. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground text-center md:text-right max-w-md">
            <strong>Disclaimer:</strong> This tool is for informational purposes only and does not replace professional medical advice. Always consult a healthcare provider.
          </p>
        </div>
      </div>
    </footer>
  );
}
