"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AuthGuard } from "@/components/auth-guard";
import { RoleGuard } from "@/components/role-guard";
import {
  getEventWithListings,
  postSurplusForEvent,
  getEventPrefillExpiryDate,
  finalizeEvent,
  getEventSummary,
  notifyNgosAboutEventListing,
  type Event as DBEvent,
  type FoodListing as DBFoodListing,
} from "@/lib/database";
import { supabase } from "@/lib/supabase";

// Expiry countdown component
function ExpiryCountdown({ expiryDate }: { expiryDate: string }) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiryDate).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft("Expired");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [expiryDate]);

  return (
    <div
      className={`text-sm ${
        isExpired
          ? "text-red-600 dark:text-red-400 font-semibold"
          : "text-muted-foreground"
      }`}
    >
      {timeLeft}
    </div>
  );
}

// Enhanced status badge with colors
function StatusBadge({ status }: { status: string }) {
  const getVariant = (status: string) => {
    switch (status) {
      case "available":
        return "default";
      case "picked_up":
        return "secondary";
      case "expired":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getLabel = (status: string) => {
    switch (status) {
      case "available":
        return "Available";
      case "picked_up":
        return "Picked Up";
      case "expired":
        return "Expired";
      default:
        return status;
    }
  };

  return <Badge variant={getVariant(status)}>{getLabel(status)}</Badge>;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const eventId = String(params?.id || "");

  const [event, setEvent] = useState<DBEvent | null>(null);
  const [listings, setListings] = useState<DBFoodListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [newBatch, setNewBatch] = useState({
    food_name: "",
    quantity: "",
    pickup_location: "",
    image_url: "",
    expiry_date: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const { event, listings } = await getEventWithListings(eventId);
      setEvent(event);
      setListings(listings);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load event",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) load();
  }, [eventId]);

  const prefillExpiry = useMemo(() => {
    if (!event) return "";
    return getEventPrefillExpiryDate(event);
  }, [event]);

  const handleAddBatch = async () => {
    if (!event) return;
    try {
      // Derive current user id for attribution
      let userId = "";
      try {
        const { getSession } = await import("@/app/actions/auth-supabase");
        const session = await getSession();
        if (session?.user?.id) userId = session.user.id;
      } catch {}

      const created = await postSurplusForEvent(
        eventId,
        {
          user_id: userId,
          food_name: newBatch.food_name,
          quantity: newBatch.quantity,
          pickup_location: newBatch.pickup_location,
          image_url: newBatch.image_url || undefined,
          expiry_date: newBatch.expiry_date || undefined,
        },
        { prefillExpiry: true }
      );

      if (created && created.id) {
        setListings((prev) => [created, ...prev]);
        setIsAddOpen(false);
        setNewBatch({
          food_name: "",
          quantity: "",
          pickup_location: "",
          image_url: "",
          expiry_date: "",
        });
        toast({ title: "Surplus posted", description: created.food_name });

        // Fire-and-forget NGO notifications
        notifyNgosAboutEventListing(eventId, created.id).catch(() => {});
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Failed",
        description: error?.message || "Could not create batch",
      });
    }
  };

  const handleFinalize = async () => {
    try {
      await finalizeEvent(eventId, {
        expireUnclaimed: true,
        markCompleted: true,
      });
      await load();
      toast({ title: "Event finalized" });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Failed",
        description: error?.message || "Could not finalize event",
      });
    }
  };

  const [summary, setSummary] = useState<any>(null);
  const loadSummary = async () => {
    try {
      const s = await getEventSummary(eventId);
      setSummary(s);
    } catch {}
  };

  useEffect(() => {
    if (eventId) loadSummary();
  }, [eventId, listings.length]);

  // Auto-refresh listings every 30 seconds for live monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      if (event && event.status === "ongoing") {
        load();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [event, load]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-red-600">
            Event Not Found
          </h1>
          <Button onClick={() => router.push("/admin/events")} className="mt-4">
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const handleMarkPickedUp = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from("food_listings")
        .update({ status: "picked_up" })
        .eq("id", listingId);

      if (error) throw error;

      // Refresh the listings
      await load();

      toast({
        title: "Status Updated",
        description: "Food listing marked as picked up",
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to update status",
      });
    }
  };

  const handleMarkExpired = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from("food_listings")
        .update({ status: "expired" })
        .eq("id", listingId);

      if (error) throw error;

      // Refresh the listings
      await load();

      toast({
        title: "Status Updated",
        description: "Food listing marked as expired",
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to update status",
      });
    }
  };

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["Admin"]}>
        <div className="container mx-auto p-4 space-y-6">
          {/* Event Header with Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Event Image/Logo */}
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
                {event.image_url ? (
                  <img
                    src={event.image_url}
                    alt={event.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <div className="text-2xl mb-1">📷</div>
                    <div className="text-xs">Add Logo</div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold">{event.name}</h1>
                  <Badge
                    variant={
                      event.status === "ongoing"
                        ? "default"
                        : event.status === "upcoming"
                        ? "secondary"
                        : event.status === "completed"
                        ? "outline"
                        : "destructive"
                    }
                  >
                    {event.status.charAt(0).toUpperCase() +
                      event.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {event.date} • {event.start_time} - {event.end_time} •{" "}
                  {event.venue}
                </p>
                {event.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => router.push("/admin/events")}
              >
                Back
              </Button>
              {event.status !== "completed" && (
                <Button onClick={() => setIsAddOpen(true)}>Post Surplus</Button>
              )}
              {event.status !== "completed" && (
                <Button variant="outline" onClick={handleFinalize}>
                  Finalize Event
                </Button>
              )}
            </div>
          </div>

          {/* Event Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {event.expected_meals?.total || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Expected Meals
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {event.expected_attendees || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Expected Attendees
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{listings.length}</div>
                <div className="text-sm text-muted-foreground">
                  Surplus Listings
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {listings.filter((l) => l.status === "picked_up").length}
                </div>
                <div className="text-sm text-muted-foreground">Picked Up</div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          {summary && (
            <Card>
              <CardHeader>
                <CardTitle>Post-Event Summary</CardTitle>
                <CardDescription>
                  Overview of food saved and redistributed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Listings</div>
                    <div className="text-lg font-semibold">
                      {summary.totals.totalListings}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Picked Up</div>
                    <div className="text-lg font-semibold">
                      {summary.totals.pickedUp}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Expired</div>
                    <div className="text-lg font-semibold">
                      {summary.totals.expired}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">
                      Meals Served (est.)
                    </div>
                    <div className="text-lg font-semibold">
                      {summary.mealsServedEstimate}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Listings table with enhanced UI */}
          <Card>
            <CardHeader>
              <CardTitle>Surplus Listings</CardTitle>
              <CardDescription>
                {event.status === "ongoing" && (
                  <span className="text-green-600 dark:text-green-400">
                    🔄 Live updates every 30 seconds
                  </span>
                )}
                {event.status === "completed" && (
                  <span className="text-muted-foreground">
                    Event completed - no new listings
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Food Name</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Pickup Location</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Time Left</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((l) => (
                      <TableRow
                        key={l.id}
                        className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <TableCell className="font-medium text-foreground">
                          {l.food_name}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {l.quantity}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {l.pickup_location}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {new Date(l.expiry_date).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <ExpiryCountdown expiryDate={l.expiry_date} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={l.status} />
                        </TableCell>
                        <TableCell>
                          {l.status === "available" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkPickedUp(l.id)}
                                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                              >
                                Mark Picked Up
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkExpired(l.id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                              >
                                Mark Expired
                              </Button>
                            </div>
                          )}
                          {l.status === "picked_up" && (
                            <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                              ✅ Confirmed
                            </div>
                          )}
                          {l.status === "expired" && (
                            <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                              ⏰ Expired
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {listings.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      No surplus posted yet.
                    </p>
                    {event.status !== "completed" && (
                      <Button
                        onClick={() => setIsAddOpen(true)}
                        className="mt-2"
                        variant="outline"
                      >
                        Post First Surplus
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Add batch dialog */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Post Surplus for {event.name}</DialogTitle>
                <DialogDescription>
                  Create a new surplus listing for this event. Expiry time will
                  be auto-prefilled based on event settings.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Food Name *</Label>
                  <Input
                    value={newBatch.food_name}
                    onChange={(e) =>
                      setNewBatch({ ...newBatch, food_name: e.target.value })
                    }
                    placeholder="e.g., Vegetarian Biryani"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantity *</Label>
                  <Input
                    value={newBatch.quantity}
                    onChange={(e) =>
                      setNewBatch({ ...newBatch, quantity: e.target.value })
                    }
                    placeholder="e.g., 50 plates"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Pickup Location *</Label>
                  <Input
                    value={newBatch.pickup_location}
                    onChange={(e) =>
                      setNewBatch({
                        ...newBatch,
                        pickup_location: e.target.value,
                      })
                    }
                    placeholder="e.g., Main Canteen, Ground Floor"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Expiry Time (Auto-prefilled)</Label>
                  <Input
                    value={
                      newBatch.expiry_date ||
                      (prefillExpiry
                        ? new Date(prefillExpiry).toLocaleString()
                        : "")
                    }
                    onChange={(e) =>
                      setNewBatch({ ...newBatch, expiry_date: e.target.value })
                    }
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Based on event's default expiry setting (
                    {event.default_surplus_expiry_minutes || 180} minutes)
                  </p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Image URL (optional)</Label>
                  <Input
                    value={newBatch.image_url}
                    onChange={(e) =>
                      setNewBatch({ ...newBatch, image_url: e.target.value })
                    }
                    placeholder="https://example.com/food-image.jpg"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddBatch}
                  disabled={
                    !newBatch.food_name ||
                    !newBatch.quantity ||
                    !newBatch.pickup_location
                  }
                >
                  Post Surplus
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
