import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Canteen Dashboard - ForkWare",
  description:
    "Manage surplus food listings and track pickups for your canteen or venue",
};

export default function CanteenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
