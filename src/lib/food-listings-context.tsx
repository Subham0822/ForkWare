"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  createFoodListing,
  getFoodListings,
  updateFoodListing as updateFoodListingDB,
  deleteFoodListing as deleteFoodListingDB,
  FoodListing as DBFoodListing,
} from "./database";
import { supabase } from "./supabase";
import { useToast } from "@/hooks/use-toast";

export interface FoodListing {
  id: string;
  name: string;
  quantity: string;
  expires: string;
  status: "Available" | "Picked Up" | "Expired";
  pickupLocation?: string;
  imageUrl?: string;
  createdAt?: string;
  location?: string;
  image?: string;
  hint?: string;
  // Food Safety Fields
  temperature?: string;
  allergens?: string[];
  preparationMethod?: string;
  safetyRating?: number; // 1-5 scale
  storageConditions?: string;
  lastInspection?: string;
}

interface FoodListingsContextType {
  foodListings: FoodListing[];
  addFoodListing: (listing: Omit<FoodListing, "id">) => Promise<void>;
  updateFoodListing: (
    id: string,
    updates: Partial<FoodListing>
  ) => Promise<void>;
  deleteFoodListing: (id: string) => Promise<void>;
  getAvailableListings: () => FoodListing[];
  isLoading: boolean;
  refreshListings: () => Promise<void>;
}

const FoodListingsContext = createContext<FoodListingsContextType | undefined>(
  undefined
);

// Helper function to convert DB format to UI format
const convertDBToListing = (dbListing: DBFoodListing): FoodListing => {
  return {
    id: dbListing.id,
    name: dbListing.food_name,
    quantity: dbListing.quantity,
    expires: dbListing.expiry_date,
    status:
      dbListing.status === "available"
        ? "Available"
        : dbListing.status === "picked_up"
        ? "Picked Up"
        : "Expired",
    pickupLocation: dbListing.pickup_location,
    location: dbListing.pickup_location,
    imageUrl: dbListing.image_url,
    image: dbListing.image_url || "https://placehold.co/600x400.png",
    createdAt: dbListing.created_at,
    hint: dbListing.food_name.toLowerCase(),
    // Food Safety Fields
    temperature: dbListing.temperature,
    allergens: dbListing.allergens,
    preparationMethod: dbListing.preparation_method,
    safetyRating: dbListing.safety_rating,
    storageConditions: dbListing.storage_conditions,
    lastInspection: dbListing.last_inspection,
  };
};

// Helper function to get current user ID from custom JWT session
const getCurrentUserId = async (): Promise<string> => {
  try {
    // Try to get from custom JWT session first
    const { getSession } = await import("@/app/actions/auth-supabase");
    const customSession = await getSession();
    if (customSession?.user?.id) {
      return customSession.user.id;
    }

    // Fallback to Supabase session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user?.id) {
      return session.user.id;
    }

    throw new Error("No authenticated user found");
  } catch (error) {
    console.error("Failed to get current user ID:", error);
    throw new Error("User not authenticated");
  }
};

// Helper function to convert UI format to DB format
const convertListingToDB = async (
  listing: Omit<FoodListing, "id">
): Promise<Omit<DBFoodListing, "id" | "created_at">> => {
  // Get current user ID from custom JWT session
  const userId = await getCurrentUserId();

  return {
    user_id: userId,
    food_name: listing.name,
    quantity: listing.quantity,
    expiry_date: listing.expires,
    pickup_location: listing.pickupLocation || "",
    status:
      listing.status === "Available"
        ? "available"
        : listing.status === "Picked Up"
        ? "picked_up"
        : "expired",
    image_url: listing.imageUrl,
    // Food Safety Fields
    temperature: listing.temperature,
    allergens: listing.allergens,
    preparation_method: listing.preparationMethod,
    safety_rating: listing.safetyRating,
    storage_conditions: listing.storageConditions,
    last_inspection: listing.lastInspection,
  };
};

export function FoodListingsProvider({ children }: { children: ReactNode }) {
  const [foodListings, setFoodListings] = useState<FoodListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const refreshListings = async () => {
    try {
      setIsLoading(true);
      const dbListings = await getFoodListings();
      const convertedListings = dbListings.map(convertDBToListing);
      setFoodListings(convertedListings);
    } catch (error) {
      console.error("Failed to fetch food listings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load food listings.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addFoodListing = async (listing: Omit<FoodListing, "id">) => {
    try {
      console.log("Starting addFoodListing with:", listing);

      const dbListing = await convertListingToDB(listing);
      console.log("Converted to DB format:", dbListing);

      const newListing = await createFoodListing(dbListing);
      console.log("Created in DB:", newListing);

      const convertedListing = convertDBToListing(newListing);
      console.log("Converted back to UI format:", convertedListing);

      setFoodListings((prev) => [convertedListing, ...prev]);
      toast({
        title: "Success",
        description: "Food listing added successfully!",
      });
    } catch (error) {
      console.error("Failed to add food listing:", error);
      console.error("Error details:", {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      });

      // More specific error messages
      let errorMessage = "Failed to add food listing.";
      if (error instanceof Error) {
        if (
          error.message.includes("relation") &&
          error.message.includes("does not exist")
        ) {
          errorMessage =
            "Database table not found. Please run the SQL migration.";
        } else if (error.message.includes("not authenticated")) {
          errorMessage = "Please log in to add food listings.";
        } else if (
          error.message.includes("new row violates row-level security policy")
        ) {
          errorMessage = "Permission denied. Check your authentication status.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const updateFoodListing = async (
    id: string,
    updates: Partial<FoodListing>
  ) => {
    try {
      const dbUpdates: Partial<DBFoodListing> = {};

      if (updates.name) dbUpdates.food_name = updates.name;
      if (updates.quantity) dbUpdates.quantity = updates.quantity;
      if (updates.expires) dbUpdates.expiry_date = updates.expires;
      if (updates.pickupLocation)
        dbUpdates.pickup_location = updates.pickupLocation;
      if (updates.status) {
        dbUpdates.status =
          updates.status === "Available"
            ? "available"
            : updates.status === "Picked Up"
            ? "picked_up"
            : "expired";
      }
      if (updates.imageUrl) dbUpdates.image_url = updates.imageUrl;

      await updateFoodListingDB(id, dbUpdates);

      setFoodListings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );

      toast({
        title: "Success",
        description: "Food listing updated successfully!",
      });
    } catch (error) {
      console.error("Failed to update food listing:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update food listing.",
      });
    }
  };

  const deleteFoodListing = async (id: string) => {
    try {
      await deleteFoodListingDB(id);
      setFoodListings((prev) => prev.filter((item) => item.id !== id));
      toast({
        title: "Success",
        description: "Food listing deleted successfully!",
      });
    } catch (error) {
      console.error("Failed to delete food listing:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete food listing.",
      });
    }
  };

  const getAvailableListings = () => {
    return foodListings.filter((item) => item.status === "Available");
  };

  // Load initial data
  useEffect(() => {
    refreshListings();
  }, []);

  const value: FoodListingsContextType = {
    foodListings,
    addFoodListing,
    updateFoodListing,
    deleteFoodListing,
    getAvailableListings,
    isLoading,
    refreshListings,
  };

  return (
    <FoodListingsContext.Provider value={value}>
      {children}
    </FoodListingsContext.Provider>
  );
}

export function useFoodListings() {
  const context = useContext(FoodListingsContext);
  if (context === undefined) {
    throw new Error(
      "useFoodListings must be used within a FoodListingsProvider"
    );
  }
  return context;
}
