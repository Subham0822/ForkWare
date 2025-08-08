import Link from "next/link";
import { KindPlateLogo } from "./logo";

export function Footer() {
  return (
    <footer className="bg-muted/50">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <Link href="/">
              <KindPlateLogo />
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Sharing Meals, Spreading Kindness
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
              Contact
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
        <div className="mt-6 border-t pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} KindPlate. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
