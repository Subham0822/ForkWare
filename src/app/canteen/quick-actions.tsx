"use client";

import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  Package,
  Plus,
  Zap,
  Calendar,
  MapPin,
  Loader2,
} from "lucide-react";

interface QuickFoodItem {
  name: string;
  quantity: string;
  type: string;
  location: string;
}

const commonFoodItems = [
  { name: "Rice", type: "grains", defaultQuantity: "5 kg" },
  { name: "Bread", type: "bread", defaultQuantity: "20 pieces" },
  { name: "Vegetables", type: "vegetables", defaultQuantity: "3 kg" },
  { name: "Fruits", type: "fruits", defaultQuantity: "2 kg" },
  { name: "Cooked Food", type: "cooked", defaultQuantity: "10 meals" },
];

interface QuickActionsProps {
  onGoToEvents?: () => void;
}

export default function QuickActions({ onGoToEvents }: QuickActionsProps) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [selectedFoodItems, setSelectedFoodItems] = useState<QuickFoodItem[]>(
    []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleQuickAdd = async () => {
    if (selectedFoodItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one food item to add.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Success!",
        description: `Added ${selectedFoodItems.length} food items successfully.`,
      });

      setIsQuickAddOpen(false);
      setSelectedFoodItems([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add food items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFoodItem = (item: (typeof commonFoodItems)[0]) => {
    const newItem: QuickFoodItem = {
      name: item.name,
      quantity: item.defaultQuantity,
      type: item.type,
      location: "Main Canteen", // Default location
    };

    setSelectedFoodItems([...selectedFoodItems, newItem]);
  };

  const removeFoodItem = (index: number) => {
    setSelectedFoodItems(selectedFoodItems.filter((_, i) => i !== index));
  };

  const updateFoodItem = (
    index: number,
    field: keyof QuickFoodItem,
    value: string
  ) => {
    const updated = [...selectedFoodItems];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedFoodItems(updated);
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions Header */}
      <div className="flex items-center gap-4">
        <Zap className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Quick Actions</h2>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Add Common Items */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Quick Add Common Items
            </CardTitle>
            <CardDescription>
              Add frequently listed surplus food items in seconds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setIsQuickAddOpen(true)}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
          </CardContent>
        </Card>

        {/* Event Management */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Management
            </CardTitle>
            <CardDescription>
              Post surplus food for specific events and track performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                if (onGoToEvents) {
                  onGoToEvents();
                  return;
                }
                // Fallback: attempt DOM switch if parent handler not provided
                const tabsList = document.querySelector('[role="tablist"]');
                const eventsTab = tabsList?.querySelector('[value="events"]') as HTMLElement | null;
                if (eventsTab) {
                  eventsTab.click();
                }
              }}
              className="w-full"
              variant="outline"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Manage Events
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Add Dialog */}
      <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Quick Add Common Food Items</DialogTitle>
            <DialogDescription>
              Select and customize common surplus food items
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Available Items */}
            <div>
              <Label className="text-sm font-medium">Available Items</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {commonFoodItems.map((item) => (
                  <Button
                    key={item.name}
                    variant="outline"
                    size="sm"
                    onClick={() => addFoodItem(item)}
                    className="justify-start"
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    {item.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Selected Items */}
            {selectedFoodItems.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Selected Items</Label>
                <div className="space-y-3 mt-2">
                  {selectedFoodItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <Input
                          value={item.name}
                          onChange={(e) =>
                            updateFoodItem(index, "name", e.target.value)
                          }
                          placeholder="Food name"
                        />
                        <Input
                          value={item.quantity}
                          onChange={(e) =>
                            updateFoodItem(index, "quantity", e.target.value)
                          }
                          placeholder="Quantity"
                        />
                        <Input
                          value={item.location}
                          onChange={(e) =>
                            updateFoodItem(index, "location", e.target.value)
                          }
                          placeholder="Location"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFoodItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQuickAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleQuickAdd}
              disabled={isSubmitting || selectedFoodItems.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                `Add ${selectedFoodItems.length} Items`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Add Dialog */}
      <Dialog open={isBulkAddOpen} onOpenChange={setIsBulkAddOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Bulk Add After Event</DialogTitle>
            <DialogDescription>
              Quickly log multiple food items after campus events
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventName">Event Name</Label>
                <Input id="eventName" placeholder="e.g., Tech Fest, Workshop" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventDate">Event Date</Label>
                <Input id="eventDate" type="date" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventLocation">Event Location</Label>
              <Input
                id="eventLocation"
                placeholder="e.g., Main Auditorium, Block B"
              />
            </div>

            <div className="space-y-2">
              <Label>Food Items Available</Label>
              <div className="grid grid-cols-2 gap-2">
                {commonFoodItems.map((item) => (
                  <Button
                    key={item.name}
                    variant="outline"
                    size="sm"
                    onClick={() => addFoodItem(item)}
                    className="justify-start"
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    {item.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Selected Items for Bulk Add */}
            {selectedFoodItems.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Food Items to Add</Label>
                <div className="space-y-2 mt-2">
                  {selectedFoodItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.quantity} at {item.location}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFoodItem(index)}
                        className="text-red-600 hover:text-red-700 h-6 px-2"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleQuickAdd}
              disabled={isSubmitting || selectedFoodItems.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                `Add ${selectedFoodItems.length} Items`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
