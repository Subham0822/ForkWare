"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useFoodListings, FoodListing } from "@/lib/food-listings-context";
import QuickActions from "./quick-actions";
import { FoodSafetyTags } from "@/components/food-safety-tags";
import { FoodSafetyForm } from "@/components/food-safety-form";
import { TypeAnimation } from "@/components/ui/type-animation";
import { Particles } from "@/components/ui/particles";
import { AnimatedList } from "@/components/ui/animated-list";
import { ScrollStack } from "@/components/ui/scroll-stack";
import {
  Plus,
  Clock,
  MapPin,
  Users,
  TrendingUp,
  Package,
  CheckCircle,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Shield,
  Calendar,
} from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { RoleGuard } from "@/components/role-guard";
import {
  getUpcomingEvents,
  getEventPrefillExpiryDate,
  type Event as DBEvent,
} from "@/lib/database";

interface CanteenStats {
  totalListings: number;
  activeListings: number;
  pickedUpListings: number;
  expiredListings: number;
  totalFoodSaved: string;
  totalPickups: number;
}

export default function CanteenDashboard() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<FoodListing | null>(
    null
  );
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("listings");
  const [stats, setStats] = useState<CanteenStats>({
    totalListings: 0,
    activeListings: 0,
    pickedUpListings: 0,
    expiredListings: 0,
    totalFoodSaved: "0 kg",
    totalPickups: 0,
  });

  const { toast } = useToast();
  const {
    foodListings,
    addFoodListing,
    updateFoodListing,
    deleteFoodListing,
    isLoading,
    refreshListings,
  } = useFoodListings();

  // Form state for adding new listing
  const [newListing, setNewListing] = useState({
    foodName: "",
    quantity: "",
    expiryDate: "",
    pickupLocation: "",
    description: "",
    foodType: "",
    safeUntil: "",
  });

  // Event integration: fetch ongoing/upcoming events and allow attachment
  const [availableEvents, setAvailableEvents] = useState<DBEvent[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const events = await getUpcomingEvents();
        setAvailableEvents(events);
      } catch (e) {
        // ignore silently
      }
    })();
  }, []);

  // Food safety state
  const [safetyData, setSafetyData] = useState({
    temperature: "",
    allergens: [] as string[],
    preparationMethod: "",
    safetyRating: undefined as number | undefined,
    storageConditions: "",
  });

  // Safety filter state
  const [safetyFilter, setSafetyFilter] = useState("all");

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{
    key: "name" | "expiry" | "status" | "quantity";
    direction: "asc" | "desc";
  }>({ key: "name", direction: "asc" });

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Helper function to check if a food item has expired
  const isExpired = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return false;
      }
      return date < new Date();
    } catch (error) {
      return false;
    }
  };

  // Get canteen's food listings (filtered by user_id in real implementation)
  const canteenListings = foodListings;

  // Create sorted listings for display
  const sortedListings = [...canteenListings].sort((a, b) => {
    // Always show expired foods at the bottom regardless of sorting
    const aExpired = isExpired(a.expires);
    const bExpired = isExpired(b.expires);

    if (aExpired && !bExpired) return 1;
    if (!aExpired && bExpired) return -1;

    // Apply user-selected sorting for non-expired foods
    switch (sortConfig.key) {
      case "name":
        return sortConfig.direction === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      case "expiry":
        const dateA = new Date(a.expires);
        const dateB = new Date(b.expires);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return sortConfig.direction === "asc"
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();
        }
        return 0;
      case "status":
        const statusOrder = { Available: 1, "Picked Up": 2, Expired: 3 };
        const statusA = statusOrder[a.status] || 0;
        const statusB = statusOrder[b.status] || 0;
        return sortConfig.direction === "asc"
          ? statusA - statusB
          : statusB - statusA;
      case "quantity":
        const quantityA = parseFloat(a.quantity) || 0;
        const quantityB = parseFloat(b.quantity) || 0;
        return sortConfig.direction === "asc"
          ? quantityA - quantityB
          : quantityB - quantityA;
      default:
        return 0;
    }
  });

  const calculateStats = useCallback(() => {
    // Re-calculate filtered listings here to avoid dependency issues
    const currentFilteredListings = canteenListings.filter((listing) => {
      // Safety filter
      if (safetyFilter !== "all") {
        if (safetyFilter === "none" && listing.safetyRating) return false;
        if (
          safetyFilter !== "none" &&
          listing.safetyRating !== parseInt(safetyFilter)
        )
          return false;
      }

      // Event filter
      if (selectedEventId && listing.eventId !== selectedEventId) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          listing.name.toLowerCase().includes(query) ||
          listing.quantity.toLowerCase().includes(query) ||
          (listing.pickupLocation &&
            listing.pickupLocation.toLowerCase().includes(query))
        );
      }

      return true;
    });

    const total = currentFilteredListings.length;
    const active = currentFilteredListings.filter(
      (item) => item.status === "Available"
    ).length;
    const pickedUp = currentFilteredListings.filter(
      (item) => item.status === "Picked Up"
    ).length;
    const expired = currentFilteredListings.filter(
      (item) => item.status === "Expired"
    ).length;

    // Calculate total food saved (simplified - in real app, sum actual quantities)
    const totalFoodSaved = `${(total * 2.5).toFixed(1)} kg`; // Estimate 2.5kg per listing

    setStats({
      totalListings: total,
      activeListings: active,
      pickedUpListings: pickedUp,
      expiredListings: expired,
      totalFoodSaved,
      totalPickups: pickedUp,
    });
  }, [canteenListings, safetyFilter, searchQuery, selectedEventId]);

  useEffect(() => {
    calculateStats();
  }, [canteenListings, safetyFilter, searchQuery, selectedEventId]);

  const handleAddListing = async () => {
    try {
      // Create the food listing using the context
      await addFoodListing({
        name: newListing.foodName,
        quantity: newListing.quantity,
        expires: newListing.expiryDate,
        status: "Available",
        pickupLocation: newListing.pickupLocation,
        imageUrl: "",
        eventId: selectedEventId || undefined,
        // Food Safety Fields
        temperature: safetyData.temperature || undefined,
        allergens:
          safetyData.allergens.length > 0 ? safetyData.allergens : undefined,
        preparationMethod: safetyData.preparationMethod || undefined,
        safetyRating: safetyData.safetyRating,
        storageConditions: safetyData.storageConditions || undefined,
      });

      setIsAddDialogOpen(false);
      setNewListing({
        foodName: "",
        quantity: "",
        expiryDate: "",
        pickupLocation: "",
        description: "",
        foodType: "",
        safeUntil: "",
      });
      // Reset safety data
      setSafetyData({
        temperature: "",
        allergens: [],
        preparationMethod: "",
        safetyRating: undefined,
        storageConditions: "",
      });
      setSelectedEventId("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add food listing. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditListing = async () => {
    if (!editingListing) return;

    try {
      // Update the food listing using the context
      await updateFoodListing(editingListing.id, {
        status: editingListing.status,
      });

      setIsEditDialogOpen(false);
      setEditingListing(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update food listing. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    try {
      // Delete the food listing using the context
      await deleteFoodListing(listingId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete food listing. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSort = (key: "name" | "expiry" | "status" | "quantity") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (key: "name" | "expiry" | "status" | "quantity") => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Available":
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case "Picked Up":
        return <Badge className="bg-blue-100 text-blue-800">Picked Up</Badge>;
      case "Expired":
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Available":
        return <Package className="h-4 w-4 text-green-600" />;
      case "Picked Up":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "Expired":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatExpiryDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">
              Loading canteen dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["Admin", "Canteen / Event"]}>
        <div className="container mx-auto py-10 px-4 md:px-6 relative">
          <Particles
            particleCount={30}
            speed={0.5}
            size={2}
            color="hsl(var(--primary))"
          />
          {/* Header */}
          <ScrollStack className="mb-8">
            <div className="flex justify-between items-center animate-fade-in-down">
              <div>
                <h1 className="text-4xl md:text-5xl font-headline font-bold gradient-text">
                  <TypeAnimation
                    text="Canteen Dashboard"
                    speed={100}
                    className="gradient-text"
                    cursorClassName="text-accent"
                  />
                </h1>
                <p className="text-xl text-foreground mt-2">
                  Manage your surplus food listings and track pickups
                </p>
              </div>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-glow-lg transition-all duration-300 group hover:scale-105"
              >
                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                  Add Food Listing
                </span>
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div
                className="bg-card text-center group hover:scale-105 transition-all duration-300 animate-fade-in-up border border-border rounded-xl p-6 shadow-lg"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <div className="text-2xl font-bold font-headline mb-2">
                  {stats.totalListings}
                </div>
                <div className="text-sm text-foreground mb-1">
                  Total Listings
                </div>
                <div className="text-xs text-primary font-medium">All time</div>
              </div>

              <div
                className="bg-card text-center group hover:scale-105 transition-all duration-300 animate-fade-in-up border border-border rounded-xl p-6 shadow-lg"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <div className="text-2xl font-bold font-headline mb-2 text-green-600">
                  {stats.activeListings}
                </div>
                <div className="text-sm text-foreground mb-1">
                  Active Listings
                </div>
                <div className="text-xs text-green-500 font-medium">
                  Available now
                </div>
              </div>

              <div
                className="bg-card text-center group hover:scale-105 transition-all duration-300 animate-fade-in-up border border-border rounded-xl p-6 shadow-lg"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div className="text-2xl font-bold font-headline mb-2 text-blue-600">
                  {stats.totalFoodSaved}
                </div>
                <div className="text-sm text-foreground mb-1">Food Saved</div>
                <div className="text-xs text-blue-500 font-medium">
                  Total impact
                </div>
              </div>

              <div
                className="bg-card text-center group hover:scale-105 transition-all duration-300 animate-fade-in-up border border-border rounded-xl p-6 shadow-lg"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="text-2xl font-bold font-headline mb-2 text-purple-600">
                  {stats.totalPickups}
                </div>
                <div className="text-sm text-foreground mb-1">Pickups</div>
                <div className="text-xs text-purple-500 font-medium">
                  Completed
                </div>
              </div>

              {/* Safety Rating Card */}
              <div
                className="bg-card text-center group hover:scale-105 transition-all duration-300 animate-fade-in-up border border-border rounded-xl p-6 shadow-lg"
                style={{ animationDelay: "0.5s" }}
              >
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div className="text-2xl font-bold font-headline mb-2 text-emerald-600">
                  {(() => {
                    const ratings = canteenListings
                      .filter((listing) => listing.safetyRating)
                      .map((listing) => listing.safetyRating!);
                    if (ratings.length === 0) return "N/A";
                    const avg =
                      ratings.reduce((a, b) => a + b, 0) / ratings.length;
                    return avg.toFixed(1);
                  })()}
                </div>
                <div className="text-sm text-foreground mb-1">
                  Safety Rating
                </div>
                <div className="text-xs text-emerald-500 font-medium">
                  Average
                </div>
              </div>
            </div>
          </ScrollStack>

          {/* Quick Actions Section */}
          <QuickActions />

          {/* Main Content Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="bg-card border border-border shadow-lg rounded-lg">
              <TabsTrigger
                value="listings"
                className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                Active Listings
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                Event Management
              </TabsTrigger>
              <TabsTrigger
                value="pickups"
                className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                Pickup Tracking
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                Venue Analytics
              </TabsTrigger>
            </TabsList>

            {/* Active Listings Tab */}
            <TabsContent value="listings" className="space-y-6">
              <Card className="bg-card border border-border shadow-xl rounded-xl">
                <CardHeader className="p-6 border-b border-border/50">
                  <h3 className="text-2xl font-headline font-semibold mb-2">
                    Food Listings
                  </h3>
                  <p className="text-foreground">
                    Manage your current surplus food listings
                    {searchQuery || safetyFilter !== "all" ? (
                      <span className="text-foreground/70">
                        {" "}
                        (Showing {canteenListings.length} of{" "}
                        {canteenListings.length} total)
                      </span>
                    ) : null}
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Safety Filter and Search */}
                  <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="safetyFilter"
                        className="text-sm font-medium whitespace-nowrap text-foreground"
                      >
                        Filter by Safety:
                      </Label>
                      <Select
                        value={safetyFilter}
                        onValueChange={setSafetyFilter}
                      >
                        <SelectTrigger className="w-32 bg-background border border-border">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border border-border shadow-xl rounded-lg">
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="5">5 - Excellent</SelectItem>
                          <SelectItem value="4">4 - Good</SelectItem>
                          <SelectItem value="3">3 - Fair</SelectItem>
                          <SelectItem value="2">2 - Poor</SelectItem>
                          <SelectItem value="1">1 - Unsafe</SelectItem>
                          <SelectItem value="none">No Rating</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Event Filter */}
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="eventFilter"
                        className="text-sm font-medium whitespace-nowrap text-foreground"
                      >
                        Filter by Event:
                      </Label>
                      <Select
                        value={selectedEventId || "all"}
                        onValueChange={(v) =>
                          setSelectedEventId(v === "all" ? "" : v)
                        }
                      >
                        <SelectTrigger className="w-48 bg-background border border-border">
                          <SelectValue placeholder="All Events" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border border-border shadow-xl rounded-lg">
                          <SelectItem value="all">All Events</SelectItem>
                          {availableEvents.map((ev) => (
                            <SelectItem key={ev.id} value={ev.id}>
                              {ev.name} • {ev.date}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2 flex-1 max-w-md">
                      <Label
                        htmlFor="searchQuery"
                        className="text-sm font-medium whitespace-nowrap text-foreground"
                      >
                        Search:
                      </Label>
                      <Input
                        id="searchQuery"
                        placeholder="Search by name, quantity, or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-background border border-border focus:ring-2 focus:ring-primary/20"
                      />
                      {searchQuery && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchQuery("")}
                          className="h-8 w-8 p-0 hover:bg-primary/10 hover:scale-105 transition-all duration-200"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </div>

                  {canteenListings.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        {searchQuery || safetyFilter !== "all"
                          ? "No listings found"
                          : "No food listings yet"}
                      </h3>
                      <p className="text-foreground mb-4">
                        {searchQuery
                          ? `No listings found matching "${searchQuery}". Try adjusting your search terms.`
                          : safetyFilter !== "all"
                          ? `No listings found with the selected safety filter. Try changing the filter or add new listings.`
                          : "Start by adding your first surplus food listing"}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        {(searchQuery || safetyFilter !== "all") && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSearchQuery("");
                              setSafetyFilter("all");
                            }}
                          >
                            Clear Filters
                          </Button>
                        )}
                        <Button onClick={() => setIsAddDialogOpen(true)}>
                          Add New Listing
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-border rounded-xl overflow-hidden bg-background">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border">
                            <TableHead
                              className="cursor-pointer hover:bg-primary/10 select-none font-medium text-foreground transition-colors duration-200 py-4"
                              onClick={() => handleSort("name")}
                            >
                              <div className="flex items-center gap-2">
                                Food Item
                                {getSortIcon("name") && (
                                  <span className="text-sm text-primary font-bold">
                                    {getSortIcon("name")}
                                  </span>
                                )}
                              </div>
                            </TableHead>
                            <TableHead
                              className="cursor-pointer hover:bg-primary/10 select-none font-medium text-foreground transition-colors duration-200 py-4"
                              onClick={() => handleSort("quantity")}
                            >
                              <div className="flex items-center gap-2">
                                Quantity
                                {getSortIcon("quantity") && (
                                  <span className="text-sm text-primary font-bold">
                                    {getSortIcon("quantity")}
                                  </span>
                                )}
                              </div>
                            </TableHead>
                            <TableHead className="font-medium text-foreground py-4">
                              Event
                            </TableHead>
                            <TableHead className="font-medium text-foreground py-4">
                              Location
                            </TableHead>
                            <TableHead
                              className="cursor-pointer hover:bg-primary/10 select-none font-medium text-foreground transition-colors duration-200 py-4"
                              onClick={() => handleSort("expiry")}
                            >
                              <div className="flex items-center gap-2">
                                Expiry
                                {getSortIcon("expiry") && (
                                  <span className="text-sm text-primary font-bold">
                                    {getSortIcon("expiry")}
                                  </span>
                                )}
                              </div>
                            </TableHead>
                            <TableHead
                              className="cursor-pointer hover:bg-primary/10 select-none font-medium text-foreground transition-colors duration-200 py-4"
                              onClick={() => handleSort("status")}
                            >
                              <div className="flex items-center gap-2">
                                Status
                                {getSortIcon("status") && (
                                  <span className="text-sm text-primary font-bold">
                                    {getSortIcon("status")}
                                  </span>
                                )}
                              </div>
                            </TableHead>
                            <TableHead className="font-medium text-foreground py-4">
                              Food Safety
                            </TableHead>
                            <TableHead className="font-medium text-center text-foreground py-4">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(() => {
                            const nonExpiredListings = sortedListings.filter(
                              (listing) => !isExpired(listing.expires)
                            );
                            const expiredListings = sortedListings.filter(
                              (listing) => isExpired(listing.expires)
                            );

                            return (
                              <>
                                {/* Non-expired listings */}
                                {nonExpiredListings.map((listing, index) => (
                                  <TableRow
                                    key={listing.id}
                                    className={`${
                                      index % 2 === 0
                                        ? "bg-background hover:bg-muted"
                                        : "bg-muted hover:bg-muted/80"
                                    } transition-all duration-200 hover:shadow-sm`}
                                  >
                                    <TableCell className="font-medium py-3">
                                      {listing.name}
                                    </TableCell>
                                    <TableCell className="py-3">
                                      {listing.quantity}
                                    </TableCell>
                                    <TableCell className="py-3">
                                      {listing.eventId ? (
                                        <div className="flex items-center gap-2">
                                          <Calendar className="h-4 w-4 text-blue-600" />
                                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                            {listing.eventName ||
                                              "Unknown Event"}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-sm text-muted-foreground italic">
                                          No event
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell className="py-3">
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-foreground" />
                                        {listing.pickupLocation ||
                                          "Not specified"}
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-3">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-foreground" />
                                        <span
                                          className={
                                            isExpired(listing.expires)
                                              ? "text-red-600 font-medium"
                                              : ""
                                          }
                                        >
                                          {formatExpiryDate(listing.expires)}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-3">
                                      <div className="flex items-center gap-2">
                                        {getStatusIcon(listing.status)}
                                        {getStatusBadge(listing.status)}
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-3">
                                      {listing.safetyRating ||
                                      listing.temperature ||
                                      (listing.allergens &&
                                        listing.allergens.length > 0) ? (
                                        <FoodSafetyTags
                                          temperature={listing.temperature}
                                          allergens={listing.allergens}
                                          preparationMethod={
                                            listing.preparationMethod
                                          }
                                          safetyRating={listing.safetyRating}
                                          storageConditions={
                                            listing.storageConditions
                                          }
                                        />
                                      ) : (
                                        <span className="text-foreground text-sm italic">
                                          No safety data
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell className="py-3">
                                      <div className="flex items-center justify-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setEditingListing(listing);
                                            setIsEditDialogOpen(true);
                                          }}
                                          className="h-8 w-8 p-0 hover:bg-primary/10 hover:scale-105 transition-all duration-200 group"
                                        >
                                          <Edit className="h-4 w-4 group-hover:text-primary transition-colors duration-200" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteListing(listing.id)
                                          }
                                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-500/10 hover:scale-105 transition-all duration-200 group"
                                        >
                                          <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}

                                {/* Expired listings section header */}
                                {expiredListings.length > 0 && (
                                  <TableRow className="bg-red-50 border-l-4 border-l-red-500">
                                    <TableCell colSpan={8} className="py-3">
                                      <div className="flex items-center gap-2 text-red-700 font-medium">
                                        <AlertTriangle className="h-4 w-4" />
                                        Expired Food Items (Shown at bottom for
                                        reference)
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )}

                                {/* Expired listings */}
                                {expiredListings.map((listing, index) => (
                                  <TableRow
                                    key={listing.id}
                                    className="bg-red-500/10 border-l-4 border-l-red-500 hover:bg-red-500/20 transition-all duration-200"
                                  >
                                    <TableCell className="font-medium py-3">
                                      {listing.name}
                                    </TableCell>
                                    <TableCell className="py-3">
                                      {listing.quantity}
                                    </TableCell>
                                    <TableCell className="py-3">
                                      {listing.eventId ? (
                                        <div className="flex items-center gap-2">
                                          <Calendar className="h-4 w-4 text-blue-600" />
                                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                            {listing.eventName ||
                                              "Unknown Event"}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-sm text-muted-foreground italic">
                                          No event
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell className="py-3">
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-foreground" />
                                        {listing.pickupLocation ||
                                          "Not specified"}
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-3">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-foreground" />
                                        <span className="text-red-600 font-medium">
                                          {formatExpiryDate(listing.expires)}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-3">
                                      <div className="flex items-center gap-2">
                                        {getStatusIcon(listing.status)}
                                        {getStatusBadge(listing.status)}
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-3">
                                      {listing.safetyRating ||
                                      listing.temperature ||
                                      (listing.allergens &&
                                        listing.allergens.length > 0) ? (
                                        <FoodSafetyTags
                                          temperature={listing.temperature}
                                          allergens={listing.allergens}
                                          preparationMethod={
                                            listing.preparationMethod
                                          }
                                          safetyRating={listing.safetyRating}
                                          storageConditions={
                                            listing.storageConditions
                                          }
                                        />
                                      ) : (
                                        <span className="text-foreground text-sm italic">
                                          No safety data
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell className="py-3">
                                      <div className="flex items-center justify-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setEditingListing(listing);
                                            setIsEditDialogOpen(true);
                                          }}
                                          className="h-8 w-8 p-0 hover:bg-primary/10 hover:scale-105 transition-all duration-200 group"
                                        >
                                          <Edit className="h-4 w-4 group-hover:text-primary transition-colors duration-200" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteListing(listing.id)
                                          }
                                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-500/10 hover:scale-105 transition-all duration-200 group"
                                        >
                                          <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </>
                            );
                          })()}
                        </TableBody>
                      </Table>

                      {/* Table Summary */}
                      <div className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-t border-border">
                        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                          <div className="flex items-center gap-6">
                            <span className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-primary rounded-full"></div>
                              Total Items:{" "}
                              <strong className="text-foreground font-headline">
                                {sortedListings.length}
                              </strong>
                            </span>
                            <span className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              Available:{" "}
                              <strong className="text-green-600 font-headline">
                                {
                                  sortedListings.filter(
                                    (l) => l.status === "Available"
                                  ).length
                                }
                              </strong>
                            </span>
                            <span className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              Picked Up:{" "}
                              <strong className="text-blue-600 font-headline">
                                {
                                  sortedListings.filter(
                                    (l) => l.status === "Picked Up"
                                  ).length
                                }
                              </strong>
                            </span>
                            <span className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              Expired:{" "}
                              <strong className="text-red-600 font-headline">
                                {
                                  sortedListings.filter(
                                    (l) => l.status === "Expired"
                                  ).length
                                }
                              </strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                              With Safety Data:{" "}
                              <strong className="text-foreground font-headline">
                                {
                                  sortedListings.filter(
                                    (l) =>
                                      l.safetyRating ||
                                      l.temperature ||
                                      (l.allergens && l.allergens.length > 0)
                                  ).length
                                }
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Event Management Tab */}
            <TabsContent value="events" className="space-y-6">
              <div className="bg-card border border-border shadow-xl rounded-xl">
                <div className="p-6 border-b border-border/50">
                  <h3 className="text-2xl font-headline font-semibold mb-2">
                    Event Management
                  </h3>
                  <p className="text-foreground">
                    Manage food listings for specific events and track event
                    performance
                  </p>
                </div>
                <div className="p-6">
                  {availableEvents.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No Events Available
                      </h3>
                      <p className="text-foreground mb-4">
                        There are no upcoming events to manage. Contact an admin
                        to create events.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {availableEvents.map((event) => {
                        const eventListings = foodListings.filter(
                          (l) => l.eventId === event.id
                        );
                        const availableCount = eventListings.filter(
                          (l) => l.status === "Available"
                        ).length;
                        const pickedUpCount = eventListings.filter(
                          (l) => l.status === "Picked Up"
                        ).length;
                        const expiredCount = eventListings.filter(
                          (l) => l.status === "Expired"
                        ).length;

                        return (
                          <div
                            key={event.id}
                            className="border border-border rounded-xl p-6 bg-background/50 hover:bg-background/80 transition-all duration-200"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="text-xl font-headline font-semibold mb-2">
                                  {event.name}
                                </h4>
                                <div className="flex items-center gap-4 text-sm text-foreground">
                                  <span className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {event.date}
                                  </span>
                                  <span className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {event.start_time} - {event.end_time}
                                  </span>
                                  <span className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {event.venue}
                                  </span>
                                </div>
                              </div>
                              <Badge
                                variant={
                                  event.status === "ongoing"
                                    ? "default"
                                    : event.status === "upcoming"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {event.status}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                              <div className="text-center p-3 bg-primary/5 rounded-lg">
                                <div className="text-2xl font-bold text-primary">
                                  {eventListings.length}
                                </div>
                                <div className="text-sm text-foreground">
                                  Total Listings
                                </div>
                              </div>
                              <div className="text-center p-3 bg-green-500/5 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                  {availableCount}
                                </div>
                                <div className="text-sm text-foreground">
                                  Available
                                </div>
                              </div>
                              <div className="text-center p-3 bg-blue-500/5 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                  {pickedUpCount}
                                </div>
                                <div className="text-sm text-foreground">
                                  Picked Up
                                </div>
                              </div>
                              <div className="text-center p-3 bg-red-500/5 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">
                                  {expiredCount}
                                </div>
                                <div className="text-sm text-foreground">
                                  Expired
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <Button
                                onClick={() => {
                                  setSelectedEventId(event.id);
                                  setIsAddDialogOpen(true);
                                }}
                                size="sm"
                                className="bg-gradient-primary text-white hover:shadow-glow-lg"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Food for Event
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedEventId(event.id);
                                  setActiveTab("listings");
                                }}
                              >
                                View Event Listings
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Pickup Tracking Tab */}
            <TabsContent value="pickups" className="space-y-6">
              <div className="bg-card border border-border shadow-xl rounded-xl">
                <div className="p-6 border-b border-border/50">
                  <h3 className="text-2xl font-headline font-semibold mb-2">
                    Pickup Tracking
                  </h3>
                  <p className="text-foreground">
                    Monitor the status of your food pickups
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid gap-4">
                    {canteenListings
                      .filter((listing) => listing.status === "Picked Up")
                      .map((listing, index) => (
                        <div
                          key={listing.id}
                          className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-background/50 hover:bg-background/80 transition-all duration-200 hover:shadow-md group"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                              <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium font-headline">
                                {listing.name}
                              </h4>
                              <p className="text-sm text-foreground">
                                Picked up on{" "}
                                {new Date(
                                  listing.createdAt || ""
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-md">
                            Completed
                          </Badge>
                        </div>
                      ))}
                    {canteenListings.filter(
                      (listing) => listing.status === "Picked Up"
                    ).length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                          <CheckCircle className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-xl font-headline font-semibold mb-2">
                          No Pickups Yet
                        </h3>
                        <p className="text-foreground max-w-md mx-auto">
                          When volunteers pick up your food listings, they'll
                          appear here for tracking.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Venue Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="bg-card border border-border shadow-xl rounded-xl">
                <div className="p-6 border-b border-border/50">
                  <h3 className="text-2xl font-headline font-semibold mb-2">
                    Venue Analytics
                  </h3>
                  <p className="text-foreground">
                    Insights about your food waste reduction impact
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="text-lg font-headline font-semibold text-primary">
                        This Month
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-border/50">
                          <span className="text-foreground">Food Saved:</span>
                          <span className="font-bold font-headline text-lg text-primary">
                            {stats.totalFoodSaved}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-xl border border-border/50">
                          <span className="text-foreground">Pickups:</span>
                          <span className="font-bold font-headline text-lg text-green-600">
                            {stats.totalPickups}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-xl border border-border/50">
                          <span className="text-foreground">
                            Active Listings:
                          </span>
                          <span className="font-bold font-headline text-lg text-blue-600">
                            {stats.activeListings}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h4 className="text-lg font-headline font-semibold text-emerald-600">
                        Environmental Impact
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-xl border border-border/50">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                          <span className="text-sm text-foreground">
                            CO2 emissions reduced
                          </span>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-xl border border-border/50">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-foreground">
                            Water saved from food production
                          </span>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl border border-border/50">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-sm text-foreground">
                            Landfill waste prevented
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </RoleGuard>

      {/* Add Food Listing Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border shadow-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline font-bold gradient-text">
              Add New Food Listing
            </DialogTitle>
            <DialogDescription className="text-lg text-foreground">
              Create a new surplus food listing with safety information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Food Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="foodName"
                  className="text-sm font-medium text-foreground"
                >
                  Food Name *
                </Label>
                <Input
                  id="foodName"
                  value={newListing.foodName}
                  onChange={(e) =>
                    setNewListing({ ...newListing, foodName: e.target.value })
                  }
                  placeholder="e.g., Fresh Bread, Cooked Rice"
                  className="bg-background/80 backdrop-blur-sm border-border/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="quantity"
                  className="text-sm font-medium text-foreground"
                >
                  Quantity *
                </Label>
                <Input
                  id="quantity"
                  value={newListing.quantity}
                  onChange={(e) =>
                    setNewListing({ ...newListing, quantity: e.target.value })
                  }
                  placeholder="e.g., 5 kg, 20 pieces"
                  className="bg-background/80 backdrop-blur-sm border-border/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="expiryDate"
                  className="text-sm font-medium text-foreground"
                >
                  Expiry Date *
                </Label>
                <Input
                  id="expiryDate"
                  type="datetime-local"
                  value={newListing.expiryDate}
                  onChange={(e) =>
                    setNewListing({ ...newListing, expiryDate: e.target.value })
                  }
                  className="bg-background/80 backdrop-blur-sm border-border/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Attach to Event (optional)
                </Label>
                <Select
                  value={selectedEventId}
                  onValueChange={(v) => {
                    setSelectedEventId(v);
                    const ev = availableEvents.find((e) => e.id === v);
                    if (ev) {
                      const suggested = getEventPrefillExpiryDate(ev);
                      // Convert ISO to local datetime-local format
                      const dt = new Date(suggested);
                      const local = new Date(
                        dt.getTime() - dt.getTimezoneOffset() * 60000
                      )
                        .toISOString()
                        .slice(0, 16);
                      setNewListing((prev) => ({ ...prev, expiryDate: local }));
                    }
                  }}
                >
                  <SelectTrigger className="bg-background/80 backdrop-blur-sm border-border/50 focus:ring-2 focus:ring-primary/20">
                    <SelectValue
                      placeholder={
                        availableEvents.length > 0
                          ? "Select event"
                          : "No upcoming events"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-border shadow-xl rounded-lg">
                    {availableEvents.map((ev) => (
                      <SelectItem key={ev.id} value={ev.id}>
                        {ev.name} • {ev.date}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="pickupLocation"
                  className="text-sm font-medium text-foreground"
                >
                  Pickup Location *
                </Label>
                <Input
                  id="pickupLocation"
                  value={newListing.pickupLocation}
                  onChange={(e) =>
                    setNewListing({
                      ...newListing,
                      pickupLocation: e.target.value,
                    })
                  }
                  placeholder="e.g., Main Kitchen, Staff Canteen"
                  className="bg-background/80 backdrop-blur-sm border-border/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-foreground"
              >
                Description
              </Label>
              <Textarea
                id="description"
                value={newListing.description}
                onChange={(e) =>
                  setNewListing({ ...newListing, description: e.target.value })
                }
                placeholder="Additional details about the food item..."
                rows={3}
                className="bg-background/80 backdrop-blur-sm border-border/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>

            {/* Food Safety Information */}
            <FoodSafetyForm
              temperature={safetyData.temperature}
              allergens={safetyData.allergens}
              preparationMethod={safetyData.preparationMethod}
              safetyRating={safetyData.safetyRating}
              storageConditions={safetyData.storageConditions}
              onSafetyChange={(newSafetyData) => {
                setSafetyData({
                  temperature: newSafetyData.temperature || "",
                  allergens: newSafetyData.allergens || [],
                  preparationMethod: newSafetyData.preparationMethod || "",
                  safetyRating: newSafetyData.safetyRating,
                  storageConditions: newSafetyData.storageConditions || "",
                });
              }}
            />
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              className="hover:bg-muted/80 hover:scale-105 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddListing}
              className="bg-gradient-primary text-white hover:shadow-glow-lg transition-all duration-300 group hover:scale-105"
            >
              <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                Add Listing
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Food Listing Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md bg-card border border-border shadow-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-headline font-bold gradient-text">
              Edit Food Listing
            </DialogTitle>
            <DialogDescription className="text-foreground">
              Update the status of this food listing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {editingListing && (
              <div className="space-y-2">
                <Label
                  htmlFor="status"
                  className="text-sm font-medium text-foreground"
                >
                  Status
                </Label>
                <Select
                  value={editingListing.status}
                  onValueChange={(
                    value: "Available" | "Picked Up" | "Expired"
                  ) =>
                    setEditingListing({
                      ...editingListing,
                      status: value,
                    })
                  }
                >
                  <SelectTrigger className="bg-background/80 backdrop-blur-sm border-border/50 focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-border shadow-xl rounded-lg">
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Picked Up">Picked Up</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="hover:bg-muted/80 hover:scale-105 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditListing}
              className="bg-gradient-primary text-white hover:shadow-glow-lg transition-all duration-300 group hover:scale-105"
            >
              <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                Update Listing
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  );
}
