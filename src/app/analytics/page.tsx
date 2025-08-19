"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AuthGuard } from "@/components/auth-guard";
import { supabase } from "@/lib/supabase";
import { getAllEvents, getEventSummary } from "@/lib/database";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface EventAnalytics {
  id: string;
  name: string;
  date: string;
  status: string;
  totalListings: number;
  available: number;
  pickedUp: number;
  expired: number;
  totalQuantity: number;
  pickedUpQuantity: number;
  expiredQuantity: number;
  mealsServedEstimate: number;
  efficiency: number; // percentage of food picked up
  rawQuantities: string[]; // Store original quantity strings for debugging
  carbonSavedKgCO2e: number; // estimated avoided emissions from picked up food
  waterSavedLiters: number; // estimated avoided water use from picked up food
  carbonWastedKgCO2e: number; // estimated emissions embedded in expired food
  waterWastedLiters: number; // estimated water embedded in expired food
}

interface OverallStats {
  totalEvents: number;
  totalListings: number;
  totalFoodSaved: number;
  totalMealsServed: number;
  averageEfficiency: number;
  topPerformingEvents: EventAnalytics[];
  totalCarbonSavedKgCO2e: number;
  totalWaterSavedLiters: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

// Helper function to parse quantity strings and extract numeric values
function parseQuantity(quantityStr: string): number {
  if (!quantityStr) return 0;

  // Remove common units and extract numbers
  const cleaned = quantityStr
    .toLowerCase()
    .replace(/plates?|servings?|portions?|meals?/g, "")
    .replace(/kg|kilos?|kilograms?/g, "")
    .replace(/g|grams?/g, "")
    .replace(/lbs?|pounds?/g, "")
    .replace(/oz|ounces?/g, "")
    .replace(/pieces?|items?|units?/g, "")
    .replace(/packets?|boxes?|containers?/g, "")
    .trim();

  // Extract the first number found
  const match = cleaned.match(/(\d+(?:\.\d+)?)/);
  if (match) {
    const num = parseFloat(match[1]);

    // Apply multipliers for different units
    if (
      quantityStr.toLowerCase().includes("kg") ||
      quantityStr.toLowerCase().includes("kilo")
    ) {
      return num * 1000; // Convert kg to grams for consistency
    } else if (
      quantityStr.toLowerCase().includes("g") ||
      quantityStr.toLowerCase().includes("gram")
    ) {
      return num;
    } else if (
      quantityStr.toLowerCase().includes("lb") ||
      quantityStr.toLowerCase().includes("pound")
    ) {
      return num * 453.592; // Convert lbs to grams
    } else if (
      quantityStr.toLowerCase().includes("oz") ||
      quantityStr.toLowerCase().includes("ounce")
    ) {
      return num * 28.3495; // Convert oz to grams
    } else {
      // Assume it's a count (plates, servings, etc.) - estimate 200g per serving
      return num * 200;
    }
  }

  return 0;
}

// Heuristic factors for carbon and water footprints per kg by food name keywords
function getFootprintFactorsForName(foodName: string): {
  co2ePerKg: number;
  waterPerKg: number;
} {
  const name = (foodName || "").toLowerCase();
  // Default for mixed cooked meals
  let co2ePerKg = 2.5; // kg CO2e per kg
  let waterPerKg = 1000; // liters per kg

  const set = (co2: number, water: number) => {
    co2ePerKg = co2;
    waterPerKg = water;
  };

  if (/(beef|mutton|steak|buff)/.test(name)) set(60, 15000);
  else if (/(lamb|goat)/.test(name)) set(24, 10000);
  else if (/(pork|bacon|ham)/.test(name)) set(7, 6000);
  else if (/(chicken|poultry|turkey)/.test(name)) set(6, 4300);
  else if (/(fish|tuna|salmon|seafood)/.test(name)) set(5, 3000);
  else if (/(cheese)/.test(name)) set(13.5, 5000);
  else if (/(dairy|milk|yogurt|curd|paneer)/.test(name)) set(3, 1000);
  else if (/(egg|omelette)/.test(name)) set(4.5, 3300);
  else if (/(rice|biryani|pulao)/.test(name)) set(4, 2500);
  else if (/(wheat|roti|bread|pasta|noodle|chapati)/.test(name)) set(1.3, 1800);
  else if (/(bean|lentil|dal|legume|chickpea|chole|rajma)/.test(name)) set(0.9, 4000);
  else if (/(potato|aloo)/.test(name)) set(0.3, 287);
  else if (/(vegetable|veg|salad|greens|sabzi|bhaji|spinach|carrot|cabbage)/.test(name)) set(0.5, 300);
  else if (/(fruit|banana|apple|orange|mango|grape)/.test(name)) set(0.8, 800);
  else if (/(snack|samosa|pakora|chips|pastry|dessert|sweet)/.test(name)) set(2.0, 1000);

  return { co2ePerKg, waterPerKg };
}

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventAnalytics[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("30");

  useEffect(() => {
    loadAnalytics();
  }, [timeFilter]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Get all events
      const allEvents = await getAllEvents();

      // Get analytics for each event
      const eventAnalytics: EventAnalytics[] = [];
      let totalListings = 0;
      let totalFoodSaved = 0;
      let totalMealsServed = 0;
      let totalCarbonSavedKgCO2e = 0;
      let totalWaterSavedLiters = 0;

      for (const event of allEvents) {
        try {
          const summary = await getEventSummary(event.id);

          // Get listing-level data for footprint calculations and debugging
          const rawQuantities: string[] = [];
          let carbonSavedKgCO2e = 0;
          let waterSavedLiters = 0;
          let carbonWastedKgCO2e = 0;
          let waterWastedLiters = 0;
          try {
            const { data: listings } = await supabase
              .from("food_listings")
              .select("quantity, status, food_name")
              .eq("event_id", event.id);

            if (listings) {
              for (const l of listings as Array<{ quantity: string; status: string; food_name: string }>) {
                const grams = parseQuantity(l.quantity || "0");
                rawQuantities.push(l.quantity || "0");
                if (grams <= 0) continue;
                const kg = grams / 1000;
                const { co2ePerKg, waterPerKg } = getFootprintFactorsForName(l.food_name || "");
                const itemCarbon = kg * co2ePerKg;
                const itemWater = kg * waterPerKg;
                if (l.status === "picked_up") {
                  carbonSavedKgCO2e += itemCarbon;
                  waterSavedLiters += itemWater;
                } else if (l.status === "expired") {
                  carbonWastedKgCO2e += itemCarbon;
                  waterWastedLiters += itemWater;
                }
              }
            }
          } catch (error) {
            console.warn(
              `Could not fetch listing details for event ${event.id}:`,
              error
            );
          }

          // Parse quantities properly
          const parsedTotal = parseQuantity(
            summary.quantities.total.toString()
          );
          const parsedPickedUp = parseQuantity(
            summary.quantities.pickedUp.toString()
          );
          const parsedExpired = parseQuantity(
            summary.quantities.expired.toString()
          );

          const analytics: EventAnalytics = {
            id: event.id,
            name: event.name,
            date: event.date,
            status: event.status,
            totalListings: summary.totals.totalListings,
            available: summary.totals.available,
            pickedUp: summary.totals.pickedUp,
            expired: summary.totals.expired,
            totalQuantity: parsedTotal,
            pickedUpQuantity: parsedPickedUp,
            expiredQuantity: parsedExpired,
            mealsServedEstimate:
              parsedPickedUp > 0 ? Math.round(parsedPickedUp / 200) : 0, // Estimate 200g per meal
            efficiency:
              parsedTotal > 0
                ? Math.round((parsedPickedUp / parsedTotal) * 100)
                : 0,
            rawQuantities,
            carbonSavedKgCO2e,
            waterSavedLiters,
            carbonWastedKgCO2e,
            waterWastedLiters,
          };

          eventAnalytics.push(analytics);

          totalListings += summary.totals.totalListings;
          totalFoodSaved += summary.quantities.total;
          totalMealsServed += summary.mealsServedEstimate;
          totalCarbonSavedKgCO2e += carbonSavedKgCO2e;
          totalWaterSavedLiters += waterSavedLiters;
        } catch (error) {
          console.error(`Error getting summary for event ${event.id}:`, error);
        }
      }

      // Sort by efficiency (descending)
      eventAnalytics.sort((a, b) => b.efficiency - a.efficiency);

      // Calculate overall stats
      const overall: OverallStats = {
        totalEvents: allEvents.length,
        totalListings,
        totalFoodSaved,
        totalMealsServed,
        averageEfficiency:
          eventAnalytics.length > 0
            ? Math.round(
                eventAnalytics.reduce((sum, e) => sum + e.efficiency, 0) /
                  eventAnalytics.length
              )
            : 0,
        topPerformingEvents: eventAnalytics.slice(0, 5),
        totalCarbonSavedKgCO2e,
        totalWaterSavedLiters,
      };

      setEvents(eventAnalytics);
      setOverallStats(overall);
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load analytics data",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEvents = () => {
    if (selectedEvent === "all") return events;
    return events.filter((e) => e.id === selectedEvent);
  };

  const getFilteredStats = () => {
    const filtered = getFilteredEvents();
    if (filtered.length === 0) return null;

    return {
      totalEvents: filtered.length,
      totalListings: filtered.reduce((sum, e) => sum + e.totalListings, 0),
      totalFoodSaved: filtered.reduce((sum, e) => sum + e.totalQuantity, 0),
      totalMealsServed: filtered.reduce(
        (sum, e) => sum + e.mealsServedEstimate,
        0
      ),
      averageEfficiency: Math.round(
        filtered.reduce((sum, e) => sum + e.efficiency, 0) / filtered.length
      ),
      totalCarbonSavedKgCO2e: filtered.reduce(
        (sum, e) => sum + e.carbonSavedKgCO2e,
        0
      ),
      totalWaterSavedLiters: filtered.reduce(
        (sum, e) => sum + e.waterSavedLiters,
        0
      ),
    };
  };

  const getChartData = () => {
    const filtered = getFilteredEvents();
    return filtered.map((event) => ({
      name: event.name,
      "Picked Up": event.pickedUpQuantity,
      Expired: event.expiredQuantity,
      Available: event.available,
    }));
  };

  const getEfficiencyData = () => {
    const filtered = getFilteredEvents();
    return filtered.map((event) => ({
      name: event.name,
      efficiency: event.efficiency,
    }));
  };

  const getStatusDistribution = () => {
    const filtered = getFilteredEvents();
    const total = filtered.reduce((sum, e) => sum + e.totalListings, 0);

    if (total === 0) return [];

    const pickedUp = filtered.reduce((sum, e) => sum + e.pickedUp, 0);
    const expired = filtered.reduce((sum, e) => sum + e.expired, 0);
    const available = filtered.reduce((sum, e) => sum + e.available, 0);

    return [
      { name: "Picked Up", value: pickedUp, color: "#00C49F" },
      { name: "Expired", value: expired, color: "#FF8042" },
      { name: "Available", value: available, color: "#0088FE" },
    ];
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const filteredStats = getFilteredStats();

  return (
    <AuthGuard>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Event Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Track the impact of your events and food redistribution efforts
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="timeFilter">Time Period:</Label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="eventFilter">Event:</Label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name} ({event.date})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Overall Stats */}
        {overallStats && (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Events
                </CardTitle>
                <Badge variant="secondary">{overallStats.totalEvents}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {overallStats.totalEvents}
                </div>
                <p className="text-xs text-muted-foreground">
                  Events managed through the system
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Food Saved
                </CardTitle>
                <Badge variant="secondary">
                  {(overallStats.totalFoodSaved / 1000).toFixed(1)} kg
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(overallStats.totalFoodSaved / 1000).toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Kilograms of food posted as surplus (parsed from quantity
                  strings)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Meals Served
                </CardTitle>
                <Badge variant="secondary">
                  {overallStats.totalMealsServed}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {overallStats.totalMealsServed}
                </div>
                <p className="text-xs text-muted-foreground">
                  Estimated meals served through redistribution
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Efficiency
                </CardTitle>
                <Badge variant="secondary">
                  {overallStats.averageEfficiency}%
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {overallStats.averageEfficiency}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average food pickup rate across events
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Carbon Saved
                </CardTitle>
                <Badge variant="secondary">
                  {overallStats.totalCarbonSavedKgCO2e.toFixed(1)} kg CO₂e
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(overallStats.totalCarbonSavedKgCO2e / 1000).toFixed(2)} t
                </div>
                <p className="text-xs text-muted-foreground">
                  Estimated CO₂e avoided via redistribution
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Water Saved
                </CardTitle>
                <Badge variant="secondary">
                  {(overallStats.totalWaterSavedLiters / 1000).toFixed(1)} kL
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(overallStats.totalWaterSavedLiters / 1000000).toFixed(2)} ML
                </div>
                <p className="text-xs text-muted-foreground">
                  Estimated freshwater use avoided
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtered Stats */}
        {filteredStats && (
          <Card>
            <CardHeader>
              <CardTitle>Filtered Statistics</CardTitle>
              <CardDescription>
                {selectedEvent === "all"
                  ? "All Events"
                  : `Event: ${
                      events.find((e) => e.id === selectedEvent)?.name
                    }`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">
                    {filteredStats.totalEvents}
                  </div>
                  <div className="text-sm text-muted-foreground">Events</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {filteredStats.totalListings}
                  </div>
                  <div className="text-sm text-muted-foreground">Listings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {filteredStats.totalFoodSaved}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Food Saved (kg)
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {filteredStats.averageEfficiency}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Efficiency
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {filteredStats.totalCarbonSavedKgCO2e.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Carbon Saved (kg CO₂e)
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {(filteredStats.totalWaterSavedLiters / 1000).toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Water Saved (kL)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="efficiency">Efficiency Analysis</TabsTrigger>
            <TabsTrigger value="distribution">Status Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Food Distribution by Event</CardTitle>
                <CardDescription>
                  Shows how much food was picked up vs expired for each event
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="Picked Up" fill="#00C49F" />
                    <Bar dataKey="Expired" fill="#FF8042" />
                    <Bar dataKey="Available" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="efficiency" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Event Efficiency Ranking</CardTitle>
                <CardDescription>
                  Events ranked by their food pickup efficiency percentage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={getEfficiencyData()} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="efficiency" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Overall Status Distribution</CardTitle>
                <CardDescription>
                  Pie chart showing the breakdown of all food listings by status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={getStatusDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getStatusDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Top Performing Events */}
        {overallStats && overallStats.topPerformingEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Events</CardTitle>
              <CardDescription>
                Events with the highest food pickup efficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overallStats.topPerformingEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{event.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {event.date}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {event.efficiency}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {event.pickedUpQuantity} kg picked up
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Event Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>
              Comprehensive breakdown of all events and their performance
              <br />
              <span className="text-xs text-muted-foreground">
                Quantities are parsed from strings (e.g., "50 plates" → 10kg
                estimated)
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 text-foreground font-medium">
                      Event
                    </th>
                    <th className="text-left p-2 text-foreground font-medium">
                      Date
                    </th>
                    <th className="text-left p-2 text-foreground font-medium">
                      Status
                    </th>
                    <th className="text-left p-2 text-foreground font-medium">
                      Listings
                    </th>
                    <th className="text-left p-2 text-foreground font-medium">
                      Food Saved (g)
                    </th>
                    <th className="text-left p-2 text-foreground font-medium">
                      Picked Up (g)
                    </th>
                    <th className="text-left p-2 text-foreground font-medium">
                      Efficiency
                    </th>
                    <th className="text-left p-2 text-foreground font-medium">
                      Carbon Saved (kg CO₂e)
                    </th>
                    <th className="text-left p-2 text-foreground font-medium">
                      Water Saved (kL)
                    </th>
                    <th className="text-left p-2 text-foreground font-medium">
                      Raw Data
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr
                      key={event.id}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="p-2 font-medium text-foreground">
                        {event.name}
                      </td>
                      <td className="p-2 text-foreground">{event.date}</td>
                      <td className="p-2">
                        <Badge
                          variant={
                            event.status === "completed"
                              ? "default"
                              : event.status === "ongoing"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {event.status}
                        </Badge>
                      </td>
                      <td className="p-2 text-foreground">
                        {event.totalListings}
                      </td>
                      <td className="p-2 text-foreground">
                        {event.totalQuantity > 0
                          ? `${(event.totalQuantity / 1000).toFixed(1)} kg`
                          : "0 kg"}
                      </td>
                      <td className="p-2 text-foreground">
                        {event.pickedUpQuantity > 0
                          ? `${(event.pickedUpQuantity / 1000).toFixed(1)} kg`
                          : "0 kg"}
                      </td>
                      <td className="p-2">
                        <span
                          className={`font-semibold ${
                            event.efficiency >= 80
                              ? "text-green-600 dark:text-green-400"
                              : event.efficiency >= 60
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {event.efficiency}%
                        </span>
                      </td>
                      <td className="p-2 text-foreground">
                        {event.carbonSavedKgCO2e > 0
                          ? event.carbonSavedKgCO2e.toFixed(1)
                          : "0.0"}
                      </td>
                      <td className="p-2 text-foreground">
                        {event.waterSavedLiters > 0
                          ? (event.waterSavedLiters / 1000).toFixed(1)
                          : "0.0"}
                      </td>
                      <td className="p-2 text-xs text-muted-foreground">
                        <div
                          className="max-w-32 truncate"
                          title={event.rawQuantities.join(", ")}
                        >
                          {event.rawQuantities.length > 0
                            ? event.rawQuantities.join(", ")
                            : "No data"}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
