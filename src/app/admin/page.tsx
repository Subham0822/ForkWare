"use client";

import React, { useState, useEffect, useActionState } from "react";
import {
  signup,
  updateUserRole,
  deleteUserAction,
  getSession,
} from "@/app/actions/auth-supabase";
import { useToast } from "@/hooks/use-toast";
import { getAllUsers, updateUser } from "@/lib/database";
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
import {
  RefreshCw,
  UserPlus,
  HelpCircle,
  Calendar,
  Mail,
  User,
  Trash2,
  Edit,
  CheckCircle,
  Eye,
  Search,
  X,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useFoodListings, FoodListing } from "@/lib/food-listings-context";
import { AuthGuard } from "@/components/auth-guard";
import { RoleGuard } from "@/components/role-guard";
import { FoodSafetyTags } from "@/components/food-safety-tags";
import { TypeAnimation } from "@/components/ui/type-animation";
import { Particles } from "@/components/ui/particles";
import { AnimatedList } from "@/components/ui/animated-list";
import { ScrollStack } from "@/components/ui/scroll-stack";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  verified: boolean;
  desired_role?: string;
  created_at: string;
  updated_at: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodListing | null>(
    null
  );
  const [isViewFoodDialogOpen, setIsViewFoodDialogOpen] = useState(false);
  const [isEditFoodDialogOpen, setIsEditFoodDialogOpen] = useState(false);
  const [isDeleteFoodDialogOpen, setIsDeleteFoodDialogOpen] = useState(false);

  // New state for food listings management
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: "name" | "expiry" | "status" | "quantity";
    direction: "asc" | "desc";
  }>({ key: "name", direction: "asc" });
  const [safetyFilter, setSafetyFilter] = useState("all");

  const { toast } = useToast();
  const router = useRouter();
  const {
    foodListings,
    updateFoodListing,
    deleteFoodListing,
    isLoading: foodListingsLoading,
  } = useFoodListings();

  const [signupState, signupAction, isSignupPending] = useActionState(
    signup,
    null
  );

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const users = await getAllUsers();
      setUsers(users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch users.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (signupState?.success) {
      toast({
        title: "Success",
        description: "User created successfully!",
      });
      resetAddUserForm();
      fetchUsers();
    } else if (signupState?.success === false) {
      toast({
        variant: "destructive",
        title: "Failed to Create User",
        description: signupState.message,
      });
    }
  }, [signupState, toast]);

  // Check if user is admin
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const session = await getSession();
        if (!session) {
          router.push("/login");
          return;
        }

        const user = session.user;
        if (user.role !== "Admin") {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You need admin privileges to access this page.",
          });
          router.push("/profile");
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Error checking admin access:", error);
        router.push("/login");
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAdminAccess();
  }, [router, toast]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const result = await updateUserRole(userId, newRole);
      if (result.success) {
        toast({ title: "Success", description: result.message });
        await fetchUsers();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Failed to update user role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    }
  };

  const handleVerificationChange = async (
    userId: string,
    verified: boolean
  ) => {
    try {
      await updateUser(userId, { verified });
      toast({ title: "Success", description: "Verification status updated." });
      await fetchUsers();
    } catch (error) {
      console.error("Failed to update verification status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update verification status.",
      });
    }
  };

  const handleDeleteUser = async (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const result = await deleteUserAction(userToDelete.id);
      if (result.success) {
        toast({ title: "Success", description: result.message });
        await fetchUsers();
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user.",
      });
    }
  };

  const resetAddUserForm = () => {
    // Reset form fields by clearing the dialog
    setIsAddUserDialogOpen(false);
    // Reopen the dialog to show fresh form
    setTimeout(() => setIsAddUserDialogOpen(true), 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewFood = (item: FoodListing) => {
    setSelectedFoodItem(item);
    setIsViewFoodDialogOpen(true);
  };

  const handleEditFood = (item: FoodListing) => {
    setSelectedFoodItem(item);
    setIsEditFoodDialogOpen(true);
  };

  const handleDeleteFood = (item: FoodListing) => {
    setSelectedFoodItem(item);
    setIsDeleteFoodDialogOpen(true);
  };

  const confirmDeleteFood = async () => {
    if (!selectedFoodItem) return;

    await deleteFoodListing(selectedFoodItem.id);
    setIsDeleteFoodDialogOpen(false);
    setSelectedFoodItem(null);
  };

  const handleStatusChange = async (
    itemId: string,
    newStatus: "Available" | "Picked Up" | "Expired"
  ) => {
    await updateFoodListing(itemId, { status: newStatus });
  };

  const getBadgeVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Available":
        return "default";
      case "Picked Up":
        return "secondary";
      case "Expired":
        return "destructive";
      default:
        return "outline";
    }
  };

  // New functions for food listings management
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

  // Filter and sort food listings
  const filteredListings = foodListings.filter((listing) => {
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

  const sortedListings = [...filteredListings].sort((a, b) => {
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

  // Calculate statistics
  const stats = {
    total: foodListings.length,
    available: foodListings.filter((item) => item.status === "Available")
      .length,
    pickedUp: foodListings.filter((item) => item.status === "Picked Up").length,
    expired: foodListings.filter((item) => item.status === "Expired").length,
    withSafetyData: foodListings.filter(
      (item) => item.safetyRating || item.allergenInfo || item.storageConditions
    ).length,
  };

  // Show loading while checking authorization
  if (isCheckingAuth) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Checking authorization...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied if not authorized
  if (!isAuthorized) {
    return null; // Will redirect in useEffect
  }

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["Admin"]}>
        <div className="container mx-auto py-10 px-4 md:px-6 relative">
          <Particles
            particleCount={30}
            speed={0.5}
            size={2}
            color="hsl(var(--primary))"
          />
          <ScrollStack className="mb-8">
            <h1 className="text-4xl md:text-5xl font-headline font-bold gradient-text">
              <TypeAnimation
                text="Admin Dashboard"
                speed={100}
                className="gradient-text"
                cursorClassName="text-accent"
              />
            </h1>
          </ScrollStack>
          <div className="space-y-8">
            <ScrollStack>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-headline">
                      User Management
                    </CardTitle>
                    <CardDescription className="text-foreground">
                      Manage users, approve role changes, and verify accounts.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddUserDialogOpen(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={fetchUsers}
                      disabled={isLoading}
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                      />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p>Loading users...</p>
                  ) : users.length === 0 ? (
                    <p>No users found.</p>
                  ) : (
                    <TooltipProvider>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-center">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">
                                      {user.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-foreground">
                                    <Mail className="h-3 w-3" />
                                    <span>{user.email}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <Select
                                    defaultValue={user.role}
                                    onValueChange={(newRole) =>
                                      handleRoleChange(user.id, newRole)
                                    }
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Admin">
                                        Admin
                                      </SelectItem>
                                      <SelectItem value="Canteen / Event">
                                        Canteen / Event
                                      </SelectItem>
                                      <SelectItem value="NGO / Volunteer">
                                        NGO / Volunteer
                                      </SelectItem>
                                      <SelectItem value="Students">
                                        Students
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {user.desired_role && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-foreground">
                                        Requested:
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {user.desired_role}
                                      </Badge>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <HelpCircle className="h-3 w-3 text-foreground/70" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>
                                            User requested this role change.
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    id={`verified-switch-${user.id}`}
                                    checked={user.verified}
                                    onCheckedChange={(checked) =>
                                      handleVerificationChange(user.id, checked)
                                    }
                                  />
                                  <Badge
                                    variant={
                                      user.verified ? "default" : "secondary"
                                    }
                                  >
                                    {user.verified ? "Verified" : "Unverified"}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm text-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDate(user.created_at)}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TooltipProvider>
                  )}
                </CardContent>
              </Card>
            </ScrollStack>

            <ScrollStack>
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">
                    Food Listings Management
                  </CardTitle>
                  <CardDescription className="text-foreground">
                    Manage all surplus food listings and their status.
                    {searchQuery ||
                    sortConfig.key !== "name" ||
                    sortConfig.direction !== "asc"
                      ? ` Showing ${filteredListings.length} of ${foodListings.length} items`
                      : ` Total ${foodListings.length} items`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Search and Filter Controls */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search food items, quantity, or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      {searchQuery && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="safety-filter"
                        className="text-sm font-medium"
                      >
                        Safety Filter:
                      </Label>
                      <Select
                        value={safetyFilter}
                        onValueChange={(value) => setSafetyFilter(value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Items</SelectItem>
                          <SelectItem value="5">5 Stars</SelectItem>
                          <SelectItem value="4">4+ Stars</SelectItem>
                          <SelectItem value="3">3+ Stars</SelectItem>
                          <SelectItem value="2">2+ Stars</SelectItem>
                          <SelectItem value="1">1+ Stars</SelectItem>
                          <SelectItem value="none">No Safety Data</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {foodListingsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      <span className="ml-2">Loading food listings...</span>
                    </div>
                  ) : sortedListings.length === 0 ? (
                    <div className="text-center py-8 text-foreground">
                      {searchQuery || safetyFilter !== "all"
                        ? `No food items found matching your filters`
                        : "No food listings available"}
                    </div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead
                              className="cursor-pointer select-none hover:bg-muted/50"
                              onClick={() => handleSort("name")}
                            >
                              <div className="flex items-center gap-2">
                                Food Item {getSortIcon("name")}
                              </div>
                            </TableHead>
                            <TableHead
                              className="cursor-pointer select-none hover:bg-muted/50"
                              onClick={() => handleSort("quantity")}
                            >
                              <div className="flex items-center gap-2">
                                Quantity {getSortIcon("quantity")}
                              </div>
                            </TableHead>
                            <TableHead
                              className="cursor-pointer select-none hover:bg-muted/50"
                              onClick={() => handleSort("status")}
                            >
                              <div className="flex items-center gap-2">
                                Status {getSortIcon("status")}
                              </div>
                            </TableHead>
                            <TableHead
                              className="cursor-pointer select-none hover:bg-muted/50"
                              onClick={() => handleSort("expiry")}
                            >
                              <div className="flex items-center gap-2">
                                Expires {getSortIcon("expiry")}
                              </div>
                            </TableHead>
                            <TableHead>Pickup Location</TableHead>
                            <TableHead>Food Safety</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedListings.map((item, index) => (
                            <TableRow
                              key={item.id}
                              className={`${
                                item.status === "Expired" ? "opacity-50" : ""
                              } ${isExpired(item.expires) ? "bg-red-50" : ""} ${
                                index % 2 === 0
                                  ? "bg-background"
                                  : "bg-muted/30"
                              }`}
                            >
                              <TableCell className="font-medium">
                                {item.name}
                              </TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Badge variant={getBadgeVariant(item.status)}>
                                    {item.status}
                                  </Badge>
                                  {item.status === "Available" && (
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleStatusChange(
                                            item.id,
                                            "Picked Up"
                                          )
                                        }
                                        className="h-6 px-2 text-xs"
                                      >
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Mark Picked Up
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell
                                className={
                                  isExpired(item.expires)
                                    ? "text-red-600 font-medium"
                                    : ""
                                }
                              >
                                {formatExpiryDate(item.expires)}
                              </TableCell>
                              <TableCell>
                                {item.pickupLocation || "Not specified"}
                              </TableCell>
                              <TableCell>
                                {item.safetyRating ||
                                item.allergenInfo ||
                                item.storageConditions ? (
                                  <FoodSafetyTags
                                    safetyRating={item.safetyRating}
                                    allergenInfo={item.allergenInfo}
                                    storageConditions={item.storageConditions}
                                  />
                                ) : (
                                  <span className="text-foreground/70 italic text-sm">
                                    No safety data
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleViewFood(item)}
                                    className="h-8 w-8"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditFood(item)}
                                    className="h-8 w-8"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteFood(item)}
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Table Summary */}
                      <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Total:</span>{" "}
                            {stats.total}
                          </div>
                          <div>
                            <span className="font-medium">Available:</span>{" "}
                            {stats.available}
                          </div>
                          <div>
                            <span className="font-medium">Picked Up:</span>{" "}
                            {stats.pickedUp}
                          </div>
                          <div>
                            <span className="font-medium">Expired:</span>{" "}
                            {stats.expired}
                          </div>
                          <div>
                            <span className="font-medium">
                              With Safety Data:
                            </span>{" "}
                            {stats.withSafetyData}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </ScrollStack>
          </div>

          <Dialog
            open={isAddUserDialogOpen}
            onOpenChange={setIsAddUserDialogOpen}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription className="text-foreground">
                  Create a new user account and assign them a role.
                </DialogDescription>
              </DialogHeader>
              <form action={signupAction} className="space-y-4">
                <div className="grid gap-4 py-4">
                  <div>
                    <label htmlFor="name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="text-sm font-medium">
                      Password
                    </label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="text-sm font-medium">
                      Role
                    </label>
                    <Select name="role" defaultValue="Students">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Canteen / Event">
                          Canteen / Event
                        </SelectItem>
                        <SelectItem value="NGO / Volunteer">
                          NGO / Volunteer
                        </SelectItem>
                        <SelectItem value="Students">Students</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSignupPending}>
                    {isSignupPending ? "Creating User..." : "Create User"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Delete User</DialogTitle>
                <DialogDescription className="text-foreground">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">{userToDelete?.name}</span>?
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={confirmDeleteUser}
                >
                  Delete User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View Food Item Dialog */}
          <Dialog
            open={isViewFoodDialogOpen}
            onOpenChange={setIsViewFoodDialogOpen}
          >
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Food Item Details</DialogTitle>
                <DialogDescription className="text-foreground">
                  View detailed information about this food listing.
                </DialogDescription>
              </DialogHeader>
              {selectedFoodItem && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Food Name
                      </label>
                      <p className="text-sm">{selectedFoodItem.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Quantity
                      </label>
                      <p className="text-sm">{selectedFoodItem.quantity}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Status
                      </label>
                      <Badge variant={getBadgeVariant(selectedFoodItem.status)}>
                        {selectedFoodItem.status}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Expires
                      </label>
                      <p className="text-sm">{selectedFoodItem.expires}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-foreground">
                        Pickup Location
                      </label>
                      <p className="text-sm">
                        {selectedFoodItem.pickupLocation}
                      </p>
                    </div>
                    {selectedFoodItem.createdAt && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-foreground">
                          Created At
                        </label>
                        <p className="text-sm">
                          {formatDate(selectedFoodItem.createdAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Food Item Dialog */}
          <Dialog
            open={isEditFoodDialogOpen}
            onOpenChange={setIsEditFoodDialogOpen}
          >
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit Food Item</DialogTitle>
                <DialogDescription className="text-foreground">
                  Update the details of this food listing.
                </DialogDescription>
              </DialogHeader>
              {selectedFoodItem && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Food Name</label>
                      <Input
                        defaultValue={selectedFoodItem.name}
                        onChange={(e) =>
                          setSelectedFoodItem((prev) =>
                            prev ? { ...prev, name: e.target.value } : null
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Quantity</label>
                      <Input
                        defaultValue={selectedFoodItem.quantity}
                        onChange={(e) =>
                          setSelectedFoodItem((prev) =>
                            prev ? { ...prev, quantity: e.target.value } : null
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <Select
                        defaultValue={selectedFoodItem.status}
                        onValueChange={(
                          value: "Available" | "Picked Up" | "Expired"
                        ) =>
                          setSelectedFoodItem((prev) =>
                            prev ? { ...prev, status: value } : null
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Available">Available</SelectItem>
                          <SelectItem value="Picked Up">Picked Up</SelectItem>
                          <SelectItem value="Expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Pickup Location
                      </label>
                      <Input
                        defaultValue={selectedFoodItem.pickupLocation}
                        onChange={(e) =>
                          setSelectedFoodItem((prev) =>
                            prev
                              ? { ...prev, pickupLocation: e.target.value }
                              : null
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  onClick={async () => {
                    if (selectedFoodItem) {
                      await updateFoodListing(
                        selectedFoodItem.id,
                        selectedFoodItem
                      );
                      setIsEditFoodDialogOpen(false);
                      setSelectedFoodItem(null);
                    }
                  }}
                >
                  Update Item
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Food Item Dialog */}
          <Dialog
            open={isDeleteFoodDialogOpen}
            onOpenChange={setIsDeleteFoodDialogOpen}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Delete Food Item</DialogTitle>
                <DialogDescription className="text-foreground">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">
                    {selectedFoodItem?.name}
                  </span>
                  ? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={confirmDeleteFood}
                >
                  Delete Item
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
