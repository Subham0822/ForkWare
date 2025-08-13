"use client";

import { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import {
  Clock,
  MapPin,
  Heart,
  Users,
  TrendingUp,
  Package,
  Building2,
  GraduationCap,
} from "lucide-react";
import { AnimatedList } from "@/components/ui/animated-list";
import { MagicCard } from "@/components/ui/magic-card";
import { useFoodListings } from "@/lib/food-listings-context";
import { useToast } from "@/hooks/use-toast";

export default function NGODashboard() {
  const { getAvailableListings, updateFoodListing, isLoading } =
    useFoodListings();
  const { toast } = useToast();
  const availableListings = getAvailableListings();

  // Pickup form dialog state
  const [isPickupDialogOpen, setIsPickupDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Pickup form data
  const [pickupForm, setPickupForm] = useState({
    userType: "" as "student" | "ngo" | "",
    // Student fields
    studentName: "",
    studentId: "",
    university: "",
    department: "",
    phone: "",
    email: "",
    // NGO fields
    organizationName: "",
    organizationType: "",
    contactPerson: "",
    organizationPhone: "",
    organizationEmail: "",
    registrationNumber: "",
    // Common fields
    pickupTime: "",
    purpose: "",
    beneficiaries: "",
    additionalNotes: "",
  });

  const handleClaimPickup = async (itemId: string, itemName: string) => {
    // Open the pickup form dialog
    setSelectedItem({ id: itemId, name: itemName });
    setIsPickupDialogOpen(true);
  };

  const handlePickupFormSubmit = async () => {
    if (!selectedItem) return;

    try {
      // Validate required fields based on user type
      if (pickupForm.userType === "student") {
        if (
          !pickupForm.studentName ||
          !pickupForm.studentId ||
          !pickupForm.university ||
          !pickupForm.phone
        ) {
          toast({
            title: "Missing Information",
            description: "Please fill in all required student fields.",
            variant: "destructive",
          });
          return;
        }
      } else if (pickupForm.userType === "ngo") {
        if (
          !pickupForm.organizationName ||
          !pickupForm.contactPerson ||
          !pickupForm.organizationPhone
        ) {
          toast({
            title: "Missing Information",
            description: "Please fill in all required NGO fields.",
            variant: "destructive",
          });
          return;
        }
      }

      // Update the food listing status to "Picked Up"
      await updateFoodListing(selectedItem.id, { status: "Picked Up" });

      // Show success message
      toast({
        title: "Pickup Claimed Successfully!",
        description: `You have successfully claimed ${selectedItem.name}. Please pick it up from the specified location.`,
      });

      // Close dialog and reset form
      setIsPickupDialogOpen(false);
      setSelectedItem(null);
      setPickupForm({
        userType: "",
        studentName: "",
        studentId: "",
        university: "",
        department: "",
        phone: "",
        email: "",
        organizationName: "",
        organizationType: "",
        contactPerson: "",
        organizationPhone: "",
        organizationEmail: "",
        registrationNumber: "",
        pickupTime: "",
        purpose: "",
        beneficiaries: "",
        additionalNotes: "",
      });

      // Refresh the listings to show updated status
      // The context will automatically update the UI
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim pickup. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetPickupForm = () => {
    setPickupForm({
      userType: "",
      studentName: "",
      studentId: "",
      university: "",
      department: "",
      phone: "",
      email: "",
      organizationName: "",
      organizationType: "",
      contactPerson: "",
      organizationPhone: "",
      organizationEmail: "",
      registrationNumber: "",
      pickupTime: "",
      purpose: "",
      beneficiaries: "",
      additionalNotes: "",
    });
    setSelectedItem(null);
    setIsPickupDialogOpen(false);
  };

  // Get total listings and expired count for stats
  const totalListings = useFoodListings().foodListings;
  const expiredCount = totalListings.filter((item) => {
    try {
      const expiryDate = new Date(item.expires);
      return !isNaN(expiryDate.getTime()) && expiryDate <= new Date();
    } catch (error) {
      return false;
    }
  }).length;

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
    {
      label: "Food Saved",
      value: "120kg",
      icon: Heart,
      color: "text-red-500",
    },
    {
      label: "Expired Items",
      value: expiredCount,
      icon: Clock,
      color: "text-orange-500",
    },
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-12">
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
                    <span>
                      Expires{" "}
                      {(() => {
                        try {
                          const date = new Date(item.expires);
                          if (isNaN(date.getTime())) return item.expires;
                          return date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          });
                        } catch (error) {
                          return item.expires;
                        }
                      })()}
                    </span>
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
              There are currently no food listings available. This could be
              because:
              <br />• All available food has been claimed
              <br />• Some food items have expired and been removed
              <br />• No new listings have been posted recently
              <br />
              <br />
              Check back later or contact local canteens directly.
            </p>
          </div>
        )}
      </MagicCard>

      {/* Pickup Form Dialog */}
      <Dialog open={isPickupDialogOpen} onOpenChange={setIsPickupDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-border shadow-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline font-bold gradient-text">
              Claim Food Pickup
            </DialogTitle>
            <DialogDescription className="text-lg text-foreground">
              {selectedItem &&
                `Please provide your details to claim: ${selectedItem.name}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* User Type Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-foreground">
                I am a: *
              </Label>
              <RadioGroup
                value={pickupForm.userType}
                onValueChange={(value: "student" | "ngo") =>
                  setPickupForm({ ...pickupForm, userType: value })
                }
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="student" id="student" />
                  <Label
                    htmlFor="student"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Student</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="ngo" id="ngo" />
                  <Label
                    htmlFor="ngo"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Building2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium">NGO Representative</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Student Form Fields */}
            {pickupForm.userType === "student" && (
              <div className="space-y-4 p-4 border border-blue-200 rounded-lg bg-blue-50/30">
                <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Student Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="studentName"
                      className="text-sm font-medium"
                    >
                      Full Name *
                    </Label>
                    <Input
                      id="studentName"
                      value={pickupForm.studentName}
                      onChange={(e) =>
                        setPickupForm({
                          ...pickupForm,
                          studentName: e.target.value,
                        })
                      }
                      placeholder="Enter your full name"
                      className="bg-background border-border focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentId" className="text-sm font-medium">
                      Student ID *
                    </Label>
                    <Input
                      id="studentId"
                      value={pickupForm.studentId}
                      onChange={(e) =>
                        setPickupForm({
                          ...pickupForm,
                          studentId: e.target.value,
                        })
                      }
                      placeholder="Enter your student ID"
                      className="bg-background border-border focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="university" className="text-sm font-medium">
                      University/College *
                    </Label>
                    <Input
                      id="university"
                      value={pickupForm.university}
                      onChange={(e) =>
                        setPickupForm({
                          ...pickupForm,
                          university: e.target.value,
                        })
                      }
                      placeholder="Enter your university name"
                      className="bg-background border-border focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-medium">
                      Department
                    </Label>
                    <Input
                      id="department"
                      value={pickupForm.department}
                      onChange={(e) =>
                        setPickupForm({
                          ...pickupForm,
                          department: e.target.value,
                        })
                      }
                      placeholder="Enter your department"
                      className="bg-background border-border focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      value={pickupForm.phone}
                      onChange={(e) =>
                        setPickupForm({ ...pickupForm, phone: e.target.value })
                      }
                      placeholder="Enter your phone number"
                      className="bg-background border-border focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={pickupForm.email}
                      onChange={(e) =>
                        setPickupForm({ ...pickupForm, email: e.target.value })
                      }
                      placeholder="Enter your email address"
                      className="bg-background border-border focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* NGO Form Fields */}
            {pickupForm.userType === "ngo" && (
              <div className="space-y-4 p-4 border border-green-200 rounded-lg bg-green-50/30">
                <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Organization Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="organizationName"
                      className="text-sm font-medium"
                    >
                      Organization Name *
                    </Label>
                    <Input
                      id="organizationName"
                      value={pickupForm.organizationName}
                      onChange={(e) =>
                        setPickupForm({
                          ...pickupForm,
                          organizationName: e.target.value,
                        })
                      }
                      placeholder="Enter organization name"
                      className="bg-background border-border focus:ring-2 focus:ring-green-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="organizationType"
                      className="text-sm font-medium"
                    >
                      Organization Type
                    </Label>
                    <Select
                      value={pickupForm.organizationType}
                      onValueChange={(value) =>
                        setPickupForm({
                          ...pickupForm,
                          organizationType: value,
                        })
                      }
                    >
                      <SelectTrigger className="bg-background border-border focus:ring-2 focus:ring-green-500/20">
                        <SelectValue placeholder="Select organization type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="charity">Charity</SelectItem>
                        <SelectItem value="food-bank">Food Bank</SelectItem>
                        <SelectItem value="shelter">Shelter</SelectItem>
                        <SelectItem value="community-center">
                          Community Center
                        </SelectItem>
                        <SelectItem value="religious-organization">
                          Religious Organization
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="contactPerson"
                      className="text-sm font-medium"
                    >
                      Contact Person *
                    </Label>
                    <Input
                      id="contactPerson"
                      value={pickupForm.contactPerson}
                      onChange={(e) =>
                        setPickupForm({
                          ...pickupForm,
                          contactPerson: e.target.value,
                        })
                      }
                      placeholder="Enter contact person name"
                      className="bg-background border-border focus:ring-2 focus:ring-green-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="organizationPhone"
                      className="text-sm font-medium"
                    >
                      Organization Phone *
                    </Label>
                    <Input
                      id="organizationPhone"
                      value={pickupForm.organizationPhone}
                      onChange={(e) =>
                        setPickupForm({
                          ...pickupForm,
                          organizationPhone: e.target.value,
                        })
                      }
                      placeholder="Enter organization phone"
                      className="bg-background border-border focus:ring-2 focus:ring-green-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="organizationEmail"
                      className="text-sm font-medium"
                    >
                      Organization Email
                    </Label>
                    <Input
                      id="organizationEmail"
                      type="email"
                      value={pickupForm.organizationEmail}
                      onChange={(e) =>
                        setPickupForm({
                          ...pickupForm,
                          organizationEmail: e.target.value,
                        })
                      }
                      placeholder="Enter organization email"
                      className="bg-background border-border focus:ring-2 focus:ring-green-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="registrationNumber"
                      className="text-sm font-medium"
                    >
                      Registration Number
                    </Label>
                    <Input
                      id="registrationNumber"
                      value={pickupForm.registrationNumber}
                      onChange={(e) =>
                        setPickupForm({
                          ...pickupForm,
                          registrationNumber: e.target.value,
                        })
                      }
                      placeholder="Enter registration number (if applicable)"
                      className="bg-background border-border focus:ring-2 focus:ring-green-500/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Common Fields */}
            {pickupForm.userType && (
              <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
                <h3 className="text-lg font-semibold text-foreground">
                  Pickup Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pickupTime" className="text-sm font-medium">
                      Preferred Pickup Time
                    </Label>
                    <Input
                      id="pickupTime"
                      type="datetime-local"
                      value={pickupForm.pickupTime}
                      onChange={(e) =>
                        setPickupForm({
                          ...pickupForm,
                          pickupTime: e.target.value,
                        })
                      }
                      className="bg-background border-border focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="beneficiaries"
                      className="text-sm font-medium"
                    >
                      Number of Beneficiaries
                    </Label>
                    <Input
                      id="beneficiaries"
                      value={pickupForm.beneficiaries}
                      onChange={(e) =>
                        setPickupForm({
                          ...pickupForm,
                          beneficiaries: e.target.value,
                        })
                      }
                      placeholder="e.g., 50 people, 20 families"
                      className="bg-background border-border focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose" className="text-sm font-medium">
                    Purpose of Pickup
                  </Label>
                  <Textarea
                    id="purpose"
                    value={pickupForm.purpose}
                    onChange={(e) =>
                      setPickupForm({ ...pickupForm, purpose: e.target.value })
                    }
                    placeholder="Describe how you plan to use this food (e.g., for community meal, student support, etc.)"
                    rows={3}
                    className="bg-background border-border focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="additionalNotes"
                    className="text-sm font-medium"
                  >
                    Additional Notes
                  </Label>
                  <Textarea
                    id="additionalNotes"
                    value={pickupForm.additionalNotes}
                    onChange={(e) =>
                      setPickupForm({
                        ...pickupForm,
                        additionalNotes: e.target.value,
                      })
                    }
                    placeholder="Any additional information or special requirements"
                    rows={2}
                    className="bg-background border-border focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={resetPickupForm}
              className="hover:bg-muted/80 hover:scale-105 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePickupFormSubmit}
              disabled={!pickupForm.userType}
              className="bg-gradient-primary text-white hover:shadow-glow-lg transition-all duration-300 group hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                Confirm Pickup
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
