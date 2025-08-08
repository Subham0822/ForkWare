import { supabase } from "./supabase";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  verified: boolean;
  desired_role?: string;
  created_at: string;
  updated_at: string;
}

export interface FoodListing {
  id: string;
  user_id: string;
  food_name: string;
  quantity: string;
  expiry_date: string;
  pickup_location: string;
  status: "available" | "picked_up" | "expired";
  image_url?: string;
  created_at: string;
}

// User management functions
export async function createUser(
  userData: Omit<User, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await supabase
    .from("profiles")
    .insert([userData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    // If no user found, return null instead of throwing
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }
  return data;
}

export async function updateUser(id: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Food listing functions
export async function createFoodListing(
  listingData: Omit<FoodListing, "id" | "created_at">
) {
  const { data, error } = await supabase
    .from("food_listings")
    .insert([listingData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getFoodListings(status?: string) {
  let query = supabase
    .from("food_listings")
    .select(
      `
      *,
      profiles:user_id (name, email)
    `
    )
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function updateFoodListing(
  id: string,
  updates: Partial<FoodListing>
) {
  const { data, error } = await supabase
    .from("food_listings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
