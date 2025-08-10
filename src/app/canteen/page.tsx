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
} from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { RoleGuard } from "@/components/role-guard";

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

  // Get canteen's food listings (filtered by user_id in real implementation)
  const canteenListings = foodListings;

  // Create sorted listings for display
  const sortedListings = [...canteenListings].sort((a, b) => {
    // Apply user-selected sorting
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
  }, [canteenListings, safetyFilter, searchQuery]);

  useEffect(() => {
    calculateStats();
  }, [canteenListings, safetyFilter, searchQuery]);

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
                <p className="text-xl text-muted-foreground mt-2">
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
                className="glass-card text-center group hover:scale-105 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <div className="text-2xl font-bold font-headline mb-2">
                  {stats.totalListings}
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  Total Listings
                </div>
                <div className="text-xs text-primary font-medium">All time</div>
              </div>

              <div
                className="glass-card text-center group hover:scale-105 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <div className="text-2xl font-bold font-headline mb-2 text-green-600">
                  {stats.activeListings}
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  Active Listings
                </div>
                <div className="text-xs text-green-500 font-medium">
                  Available now
                </div>
              </div>

              <div
                className="glass-card text-center group hover:scale-105 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div className="text-2xl font-bold font-headline mb-2 text-blue-600">
                  {stats.totalFoodSaved}
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  Food Saved
                </div>
                <div className="text-xs text-blue-500 font-medium">
                  Total impact
                </div>
              </div>

              <div
                className="glass-card text-center group hover:scale-105 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="text-2xl font-bold font-headline mb-2 text-purple-600">
                  {stats.totalPickups}
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  Pickups
                </div>
                <div className="text-xs text-purple-500 font-medium">
                  Completed
                </div>
              </div>

              {/* Safety Rating Card */}
              <div
                className="glass-card text-center group hover:scale-105 transition-all duration-300 animate-fade-in-up"
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
                <div className="text-sm text-muted-foreground mb-1">
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
          <Tabs defaultValue="listings" className="space-y-6">
            <TabsList className="glass-card border-0 shadow-lg backdrop-blur-md">
              <TabsTrigger
                value="listings"
                className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                Active Listings
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
              <Card className="glass-card border-0 shadow-xl backdrop-blur-md">
                <CardHeader className="p-6 border-b border-border/50">
                  <h3 className="text-2xl font-headline font-semibold mb-2">
                    Food Listings
                  </h3>
                  <p className="text-muted-foreground">
                    Manage your current surplus food listings
                    {searchQuery || safetyFilter !== "all" ? (
                      <span className="text-muted-foreground">
                        {" "}
                        (Showing {canteenListings.length} of{" "}
                        {canteenListings.length} total)
                      </span>
                    ) : null}
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Safety Filter and Search */}
                  <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 bg-muted/20 rounded-lg">
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
                        <SelectTrigger className="w-32 bg-background/80 backdrop-blur-sm border-border/50">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-0 shadow-xl">
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
                        className="flex-1 bg-background/80 backdrop-blur-sm border-border/50 focus:ring-2 focus:ring-primary/20"
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
                      <p className="text-muted-foreground mb-4">
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
                    <div className="border border-border/50 rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border/50">
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
                          {sortedListings.map((listing, index) => (
                            <TableRow
                              key={listing.id}
                              className={`${
                                isExpired(listing.expires)
                                  ? "bg-red-500/10 border-l-4 border-l-red-500"
                                  : ""
                              } ${
                                index % 2 === 0
                                  ? "bg-background/80 hover:bg-background/90"
                                  : "bg-muted/20 hover:bg-muted/30"
                              } transition-all duration-200 hover:shadow-sm`}
                            >
                              <TableCell className="font-medium py-3">
                                {listing.name}
                              </TableCell>
                              <TableCell className="py-3">
                                {listing.quantity}
                              </TableCell>
                              <TableCell className="py-3">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  {listing.pickupLocation || "Not specified"}
                                </div>
                              </TableCell>
                              <TableCell className="py-3">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
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
                                  <span className="text-muted-foreground text-sm italic">
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
                        </TableBody>
                      </Table>

                      {/* Table Summary */}
                      <div className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-t border-border/50">
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

            {/* Pickup Tracking Tab */}
            <TabsContent value="pickups" className="space-y-6">
              <div className="glass-card border-0 shadow-xl backdrop-blur-md">
                <div className="p-6 border-b border-border/50">
                  <h3 className="text-2xl font-headline font-semibold mb-2">
                    Pickup Tracking
                  </h3>
                  <p className="text-muted-foreground">
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
                              <p className="text-sm text-muted-foreground">
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
                        <p className="text-muted-foreground max-w-md mx-auto">
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
              <div className="glass-card border-0 shadow-xl backdrop-blur-md">
                <div className="p-6 border-b border-border/50">
                  <h3 className="text-2xl font-headline font-semibold mb-2">
                    Venue Analytics
                  </h3>
                  <p className="text-muted-foreground">
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
                          <span className="text-muted-foreground">
                            Food Saved:
                          </span>
                          <span className="font-bold font-headline text-lg text-primary">
                            {stats.totalFoodSaved}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-xl border border-border/50">
                          <span className="text-muted-foreground">
                            Pickups:
                          </span>
                          <span className="font-bold font-headline text-lg text-green-600">
                            {stats.totalPickups}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-xl border border-border/50">
                          <span className="text-muted-foreground">
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
                          <span className="text-sm text-muted-foreground">
                            CO2 emissions reduced
                          </span>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-xl border border-border/50">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-muted-foreground">
                            Water saved from food production
                          </span>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl border border-border/50">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-sm text-muted-foreground">
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-card border-0 shadow-2xl backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline font-bold gradient-text">
              Add New Food Listing
            </DialogTitle>
            <DialogDescription className="text-lg text-muted-foreground">
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
        <DialogContent className="max-w-md glass-card border-0 shadow-2xl backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-headline font-bold gradient-text">
              Edit Food Listing
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
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
                  <SelectContent className="glass-card border-0 shadow-xl">
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
