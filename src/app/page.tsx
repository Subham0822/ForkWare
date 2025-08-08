import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, Bell, BarChart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="container mx-auto px-4 md:px-6 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter">
              Cut food waste.
              <br />
              <span className="text-primary">Feed the community.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto md:mx-0">
              KindPlate connects campus canteens and event organizers with
              nearby volunteers and NGOs to redistribute surplus meals quickly
              and safely.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button size="lg" asChild>
                <Link href="/login?role=canteen">Canteen / Event Login</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login?role=ngo">NGO / Volunteer Login</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-64 md:h-96">
            <Image
              src="https://placehold.co/600x400.png"
              alt="Community sharing food"
              fill
              className="rounded-lg object-cover shadow-xl"
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
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center shadow-lg">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
                  <Utensils className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline mt-4">
                  1. List Surplus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Canteens and event organizers post details about their
                  surplus food in seconds.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
                  <Bell className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline mt-4">
                  2. Notify Volunteers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Nearby NGOs and volunteers are instantly notified about
                  available food donations.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
                  <BarChart className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline mt-4">
                  3. Pickup & Track Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Volunteers claim and pick up the food, and the platform
                  tracks the positive impact.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
