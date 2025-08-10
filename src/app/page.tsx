import { Button } from "@/components/ui/button";
import {
  Utensils,
  Bell,
  BarChart2,
  Heart,
  Users,
  Globe,
  Award,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { TypeAnimation } from "@/components/ui/type-animation";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { MagicCard } from "@/components/ui/magic-card";

const features = [
  {
    Icon: Utensils,
    name: "1. List Surplus",
    description:
      "Canteens and event organizers post details about their surplus food in seconds.",
    href: "/",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    Icon: Bell,
    name: "2. Notify Volunteers",
    description:
      "Nearby NGOs and volunteers are instantly notified about available food donations.",
    href: "/",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    Icon: BarChart2,
    name: "3. Pickup & Track Impact",
    description:
      "Volunteers claim and pick up the food, and the platform tracks the positive impact.",
    href: "/",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    gradient: "from-purple-500 to-pink-500",
  },
];

const stats = [
  { label: "Food Saved", value: "2,500+", icon: Heart, color: "text-red-500" },
  { label: "Volunteers", value: "500+", icon: Users, color: "text-blue-500" },
  { label: "Canteens", value: "50+", icon: Utensils, color: "text-green-500" },
  { label: "Cities", value: "25+", icon: Globe, color: "text-purple-500" },
];

export default function Home() {
  return (
    <div className="flex flex-col animate-fade-in-up">
      {/* Hero Section */}
      <section className="relative container mx-auto px-4 md:px-6 py-20 md:py-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-primary rounded-full opacity-10 animate-float"></div>
          <div
            className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-accent rounded-full opacity-10 animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center md:text-left">
            <div className="space-y-4">
              <TypeAnimation
                text="Cut food waste. Feed the community."
                className="text-4xl md:text-6xl font-headline font-bold tracking-tighter"
              />
              <p className="text-xl text-muted-foreground max-w-lg mx-auto md:mx-0 leading-relaxed">
                KindPlate connects campus canteens and event organizers with
                nearby volunteers and NGOs to redistribute surplus meals quickly
                and safely.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button
                size="lg"
                asChild
                className="transition-all duration-300 hover:scale-105 hover:shadow-glow-lg group"
              >
                <Link
                  href="/login?role=canteen"
                  className="flex items-center gap-2"
                >
                  <Utensils className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Canteen / Event Login
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="transition-all duration-300 hover:scale-105 hover:shadow-glow-accent-lg group"
              >
                <Link
                  href="/login?role=ngo"
                  className="flex items-center gap-2"
                >
                  <Heart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  NGO / Volunteer Login
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative h-64 md:h-96 group">
            <div className="absolute inset-0 bg-gradient-primary rounded-2xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-500"></div>
            <Image
              src="https://placehold.co/600x400.png"
              alt="Community sharing food"
              fill
              className="rounded-2xl object-cover shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-glow-lg"
              data-ai-hint="community food sharing"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-muted/30 to-muted/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 shadow-lg`}
                >
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold font-headline mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-4xl md:text-5xl font-headline font-bold">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A simple, three-step process to get surplus food to those who need
              it most.
            </p>
          </div>

          <MagicCard
            gradientColor="hsl(var(--primary))"
            className="w-full hover:shadow-glow-lg transition-all duration-500"
          >
            <BentoGrid className="lg:grid-rows-1">
              {features.map((feature, index) => (
                <BentoCard
                  key={feature.name}
                  className={`${feature.className} group hover:scale-105 transition-all duration-300`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="flex h-full flex-col gap-6 p-6">
                    <div
                      className={`mx-auto bg-gradient-to-br ${feature.gradient} rounded-2xl p-4 w-fit shadow-lg group-hover:shadow-xl transition-all duration-300`}
                    >
                      <feature.Icon className="h-10 w-10 text-white" />
                    </div>
                    <div className="flex flex-col gap-3 text-center">
                      <h3 className="font-headline text-2xl font-semibold">
                        {feature.name}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
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

      {/* Impact Section */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-4xl md:text-5xl font-headline font-bold">
              Our Impact
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Together, we're making a real difference in reducing food waste
              and feeding communities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card text-center group hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Award className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-headline font-semibold mb-4">
                Environmental Impact
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Reducing food waste and carbon footprint through efficient
                redistribution systems.
              </p>
            </div>

            <div className="glass-card text-center group hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-headline font-semibold mb-4">
                Community Support
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Supporting vulnerable communities with access to nutritious
                meals and reducing hunger.
              </p>
            </div>

            <div className="glass-card text-center group hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-headline font-semibold mb-4">
                Volunteer Network
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Building a strong network of volunteers and organizations
                committed to social good.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
