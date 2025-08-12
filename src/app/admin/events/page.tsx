"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AuthGuard } from "@/components/auth-guard";
import { RoleGuard } from "@/components/role-guard";
import {
  getAllEvents,
  registerEvent,
  type Event as DBEvent,
  type EventRegistrationInput,
} from "@/lib/database";

export default function EventsDashboardPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [events, setEvents] = useState<DBEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const [form, setForm] = useState<EventRegistrationInput>({
    name: "",
    description: "",
    date: "",
    start_time: "",
    end_time: "",
    venue: "",
    venue_address: "",
    organizer_id: "", // will be set from session on submit if empty
    organizer_name: "",
    organizer_contact: "",
    expected_meals: { veg: 0, non_veg: 0 },
    food_vendor: "",
    auto_notify_ngos: true,
    ngo_auto_reserve_minutes: 0,
    default_surplus_expiry_minutes: 180,
    notify_radius_km: 5,
    trusted_ngo_ids: [],
  });

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getAllEvents();
      setEvents(data || []);
    } catch (error) {
      console.error("Failed to load events:", error);
      setEvents([]);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load events. Please check your connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleRegister = async () => {
    try {
      // Best-effort organizer id via session if not provided
      if (!form.organizer_id) {
        try {
          const { getSession } = await import("@/app/actions/auth-supabase");
          const session = await getSession();
          if (session?.user?.id) {
            form.organizer_id = session.user.id;
          }
        } catch (error) {
          console.log("Could not get session:", error);
        }
      }

      const created = await registerEvent({
        ...form,
        expected_meals: {
          veg: Number(form.expected_meals.veg) || 0,
          non_veg: Number(form.expected_meals.non_veg) || 0,
          total:
            (Number(form.expected_meals.veg) || 0) +
            (Number(form.expected_meals.non_veg) || 0),
        },
      });
      toast({
        title: "Event registered",
        description: `${created.name} created`,
      });
      setIsDialogOpen(false);
      setForm((f) => ({ ...f, name: "", description: "", venue: "" }));
      await refresh();
      router.push(`/admin/events/${created.id}`);
    } catch (error: any) {
      console.error("Failed to register event:", error);
      toast({
        variant: "destructive",
        title: "Failed",
        description: error?.message || "Could not register event",
      });
    }
  };

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["Admin"]}>
        <div className="container mx-auto p-4 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Event Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Register events and track surplus in real time.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsDialogOpen(true)}>
                Register Event
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {!loading && events.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No events yet. Click "Register Event" to create one.
              </p>
            )}
            {events.map((ev) => (
              <Card
                key={ev.id}
                className="hover:shadow-md transition cursor-pointer"
                onClick={() => router.push(`/admin/events/${ev.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="truncate">{ev.name}</CardTitle>
                    <Badge
                      variant={
                        ev.status === "ongoing"
                          ? "default"
                          : ev.status === "upcoming"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {ev.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {ev.date} • {ev.venue}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <div>
                      Expected meals: {ev.expected_meals?.total ?? 0} (Veg{" "}
                      {ev.expected_meals?.veg ?? 0} / Non-veg{" "}
                      {ev.expected_meals?.non_veg ?? 0})
                    </div>
                    {ev.food_vendor && <div>Vendor: {ev.food_vendor}</div>}
                    <div>Organizer: {ev.organizer_name}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Register Event</DialogTitle>
                <DialogDescription>
                  Create and configure an event to track surplus postings.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Event Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start">Start Time</Label>
                  <Input
                    id="start"
                    type="time"
                    value={form.start_time}
                    onChange={(e) =>
                      setForm({ ...form, start_time: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">End Time</Label>
                  <Input
                    id="end"
                    type="time"
                    value={form.end_time}
                    onChange={(e) =>
                      setForm({ ...form, end_time: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="desc">Description</Label>
                  <Input
                    id="desc"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    value={form.venue}
                    onChange={(e) =>
                      setForm({ ...form, venue: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Venue Address</Label>
                  <Input
                    id="address"
                    value={form.venue_address}
                    onChange={(e) =>
                      setForm({ ...form, venue_address: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor">Food Vendor (optional)</Label>
                  <Input
                    id="vendor"
                    value={form.food_vendor}
                    onChange={(e) =>
                      setForm({ ...form, food_vendor: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attendees">
                    Expected Attendees (optional)
                  </Label>
                  <Input
                    id="attendees"
                    type="number"
                    min={0}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        expected_attendees: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Veg Meals</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.expected_meals.veg}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        expected_meals: {
                          ...form.expected_meals,
                          veg: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Non-Veg Meals</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.expected_meals.non_veg}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        expected_meals: {
                          ...form.expected_meals,
                          non_veg: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Expiry (minutes)</Label>
                  <Input
                    type="number"
                    min={30}
                    value={form.default_surplus_expiry_minutes}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        default_surplus_expiry_minutes: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Auto-reserve after (minutes)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.ngo_auto_reserve_minutes}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        ngo_auto_reserve_minutes: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notify Radius (km)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.notify_radius_km}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        notify_radius_km: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={form.status || "upcoming"}
                    onValueChange={(v) =>
                      setForm({ ...form, status: v as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Organizer Name</Label>
                  <Input
                    value={form.organizer_name}
                    onChange={(e) =>
                      setForm({ ...form, organizer_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Organizer Contact</Label>
                  <Input
                    value={form.organizer_contact}
                    onChange={(e) =>
                      setForm({ ...form, organizer_contact: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleRegister}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
