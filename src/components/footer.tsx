import Link from "next/link";
import { KindPlateLogo } from "./logo";
import { Github, Mail } from "lucide-react";

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
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex gap-4">
              <Link
                href="https://github.com/Subham0822/ForkWare"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub Repository"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="mailto:rwik0822@gmail.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Send Email"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
            <div className="flex gap-6 text-sm">
              <Link
                href="mailto:rwik0822@gmail.com"
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
        </div>
        <div className="mt-6 border-t pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} KindPlate. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
