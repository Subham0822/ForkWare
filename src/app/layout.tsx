import type { Metadata } from "next";
import "./globals.css";
import "./nprogress.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { PageLoader } from "@/components/page-loader";
import { Suspense } from "react";
import { DockNavigation } from "@/components/dock-navigation";

export const metadata: Metadata = {
  title: "KindPlate",
  description: "Sharing Meals, Spreading Kindness",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <Suspense>
          <PageLoader />
        </Suspense>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-grow">{children}</main>
          <DockNavigation />
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
