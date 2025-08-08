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
import { Clock, MapPin } from "lucide-react";
import { AnimatedList } from "@/components/ui/animated-list";

const mockListings = [
  {
    id: "1",
    name: "Fresh Sandwiches",
    quantity: "20 units",
    location: "Main Canteen, Block A",
    expires: "in 2 hours",
    image: "https://placehold.co/600x400.png",
    hint: "sandwiches",
  },
  {
    id: "2",
    name: "Vegetable Curry",
    quantity: "15 portions",
    location: "Event Hall Kitchen",
    expires: "in 4 hours",
    image: "https://placehold.co/600x400.png",
    hint: "curry meal",
  },
  {
    id: "5",
    name: "Fruit Salad",
    quantity: "10 bowls",
    location: "Juice Bar",
    expires: "in 1 hour",
    image: "https://placehold.co/600x400.png",
    hint: "fruit salad",
  },
  {
    id: "6",
    name: "Freshly Baked Bread",
    quantity: "30 loaves",
    location: "South Campus Bakery",
    expires: "in 6 hours",
    image: "https://placehold.co/600x400.png",
    hint: "fresh bread",
  },
];

export default function NGODashboard() {
  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-headline font-bold">
          Available Food Postings
        </h1>
        <p className="text-muted-foreground">
          Find and claim surplus food donations near you. Listings are updated
          in real-time.
        </p>
      </div>
      <AnimatedList className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockListings.map((item) => (
          <Card
            key={item.id}
            className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
          >
            <CardHeader className="p-0">
              <div className="relative h-48 w-full">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  data-ai-hint={item.hint}
                />
              </div>
              <div className="p-4">
                <Badge>Available</Badge>
                <CardTitle className="font-headline mt-2">{item.name}</CardTitle>
                <CardDescription>{item.quantity}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-grow p-4 pt-0 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>{item.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-destructive font-medium">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>Expires {item.expires}</span>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button className="w-full">Claim Pickup</Button>
            </CardFooter>
          </Card>
        ))}
      </AnimatedList>
    </div>
  );
}
