"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Clock, MapPin, Heart, Users, TrendingUp, Package } from "lucide-react";
import { AnimatedList } from "@/components/ui/animated-list";
import { MagicCard } from "@/components/ui/magic-card";
import { useFoodListings } from "@/lib/food-listings-context";
import { useToast } from "@/hooks/use-toast";

export default function NGODashboard() {
  const { getAvailableListings, updateFoodListing, isLoading } =
    useFoodListings();
  const { toast } = useToast();
  const availableListings = getAvailableListings();

  const handleClaimPickup = async (itemId: string, itemName: string) => {
    await updateFoodListing(itemId, { status: "Picked Up" });
  };

  // Mock stats for demonstration
  const stats = [
    {
      label: "Available Items",
      value: availableListings.length,
      icon: Package,
      color: "text-blue-500",
    },
    {
      label: "Total Pickups",
      value: "45",
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      label: "Active Volunteers",
      value: "23",
      icon: Users,
      color: "text-purple-500",
    },
    { label: "Food Saved", value: "120kg", icon: Heart, color: "text-red-500" },
  ];

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      {/* Header Section */}
      <div className="space-y-6 mb-12 animate-fade-in-down">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-headline font-bold gradient-text">
            Available Food Postings
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Find and claim surplus food donations near you. Listings are updated
            in real-time.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="glass-card text-center group hover:scale-105 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}
              >
                <stat.icon className={`h-8 w-8 text-white`} />
              </div>
              <div className="text-2xl font-bold font-headline mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Food Listings */}
      <MagicCard className="hover:shadow-glow-lg transition-all duration-500">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div
                  className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-secondary rounded-full animate-spin"
                  style={{
                    animationDirection: "reverse",
                    animationDuration: "1.5s",
                  }}
                ></div>
              </div>
              <p className="text-muted-foreground font-medium">
                Loading available food listings...
              </p>
            </div>
          </div>
        ) : (
          <AnimatedList className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {availableListings.map((item, index) => (
              <Card
                key={item.id}
                className="flex flex-col overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={item.image || "https://placehold.co/600x400.png"}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      data-ai-hint={item.hint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Badge className="absolute top-3 left-3 bg-green-500 hover:bg-green-600 transition-colors duration-200">
                      Available
                    </Badge>
                  </div>
                  <div className="p-4">
                    <CardTitle className="font-headline text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-200">
                      {item.name}
                    </CardTitle>
                    <CardDescription className="text-base font-medium">
                      {item.quantity}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="flex-grow p-4 pt-0 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-blue-500" />
                    <span>{item.location || item.pickupLocation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-destructive font-medium">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>Expires {item.expires}</span>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0">
                  <Button
                    className="w-full transition-all duration-300 hover:scale-105 hover:shadow-glow group"
                    onClick={() => handleClaimPickup(item.id, item.name)}
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      Claim Pickup
                    </span>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </AnimatedList>
        )}

        {!isLoading && availableListings.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Package className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-headline font-semibold mb-2">
              No Food Available
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              There are currently no food listings available. Check back later
              or contact local canteens directly.
            </p>
          </div>
        )}
      </MagicCard>
    </div>
  );
}
