import { Button } from "@/components/ui/button";
import { Utensils, Bell, BarChart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { TypeAnimation } from "@/components/ui/type-animation";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { MagicCard } from "@/components/ui/magic-card";

const features = [
  {
    Icon: Utensils,
    name: "1. List Surplus",
    description: "Canteens and event organizers post details about their surplus food in seconds.",
    href: "/",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
  },
  {
    Icon: Bell,
    name: "2. Notify Volunteers",
    description: "Nearby NGOs and volunteers are instantly notified about available food donations.",
    href: "/",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
  },
  {
    Icon: BarChart,
    name: "3. Pickup & Track Impact",
    description: "Volunteers claim and pick up the food, and the platform tracks the positive impact.",
    href: "/",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col animate-fade-in-up">
      <section className="container mx-auto px-4 md:px-6 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center md:text-left">
            <TypeAnimation
              text="Cut food waste. Feed the community."
              className="text-4xl md:text-6xl font-headline font-bold tracking-tighter"
            />
            <p className="text-lg text-muted-foreground max-w-lg mx-auto md:mx-0">
              KindPlate connects campus canteens and event organizers with
              nearby volunteers and NGOs to redistribute surplus meals quickly
              and safely.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button size="lg" asChild className="transition-transform hover:scale-105">
                <Link href="/login?role=canteen">Canteen / Event Login</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="transition-transform hover:scale-105">
                <Link href="/login?role=ngo">NGO / Volunteer Login</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-64 md:h-96">
            <Image
              src="https://placehold.co/600x400.png"
              alt="Community sharing food"
              fill
              className="rounded-lg object-cover shadow-xl transform transition-all duration-500 hover:scale-105"
              data-ai-hint="community food sharing"
            />
          </div>
        </div>
      </section>

      <section className="bg-muted/50 py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple, three-step process to get surplus food to those who
              need it most.
            </p>
          </div>
          <MagicCard
            gradientColor="hsl(var(--primary))"
            className="w-full"
          >
            <BentoGrid className="lg:grid-rows-1">
              {features.map((feature) => (
                <BentoCard key={feature.name} className={feature.className}>
                  <div className="flex h-full flex-col gap-4 p-4">
                    <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
                      <feature.Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex flex-col gap-1.5 text-center">
                      <h3 className="font-headline text-xl font-semibold">
                        {feature.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </BentoCard>
              ))}
            </BentoGrid>
          </MagicCard>
        </div>
      </section>
    </div>
  );
}
