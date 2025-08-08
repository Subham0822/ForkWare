"use server";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { createUser, getUserByEmail, updateUser } from "@/lib/database";
import { supabase } from "@/lib/supabase";

const secretKey = process.env.SESSION_SECRET || "your-fallback-secret-key";
const key = new TextEncoder().encode(secretKey);

export async function signup(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (password.length < 6) {
    return {
      success: false,
      message: "Password must be at least 6 characters long.",
    };
  }

  try {
    // First create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return { success: false, message: authError.message };
    }

    if (authData.user) {
      // Then create profile in our database
      await createUser({
        id: authData.user.id,
        name,
        email,
        role,
        verified: role === "Customer",
        desired_role: "",
      });

      return {
        success: true,
        message: "Account created successfully! Please login.",
      };
    }

    return { success: false, message: "Failed to create account." };
  } catch (error) {
    return { success: false, message: "An error occurred during signup." };
  }
}

export async function login(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // Authenticate with Supabase
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      return { success: false, message: "Invalid email or password." };
    }

    if (authData.user) {
      try {
        // Try to get user profile from our database
        let user = await getUserByEmail(email);

        // If profile doesn't exist, create it
        if (!user) {
          try {
            await createUser({
              id: authData.user.id,
              name: email.split("@")[0], // Use email prefix as name
              email: email,
              role: "Customer",
              verified: true,
              desired_role: "",
            });

            // Get the newly created user
            user = await getUserByEmail(email);
          } catch (createError) {
            console.error("Error creating user profile:", createError);
            return {
              success: false,
              message: "Failed to create user profile.",
            };
          }
        }

        if (!user) {
          return { success: false, message: "User profile not found." };
        }

        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        const session = await new SignJWT({ user })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime(expires)
          .sign(key);

        const cookieStore = await cookies();
        cookieStore.set("session", session, { expires, httpOnly: true });

        return { success: true, message: "Login successful!" };
      } catch (profileError) {
        console.error("Error handling user profile:", profileError);
        return { success: false, message: "Error accessing user profile." };
      }
    }

    return { success: false, message: "Login failed." };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "An error occurred during login." };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set("session", "", { expires: new Date(0) });

  // Also sign out from Supabase
  await supabase.auth.signOut();

  return { success: true, message: "Logged out successfully." };
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function requestRoleChange(userId: string, newRole: string) {
  try {
    await updateUser(userId, { desired_role: newRole });
    return { success: true, message: "Role change requested successfully!" };
  } catch (error) {
    return { success: false, message: "Failed to request role change." };
  }
}

export async function updateUserRole(userId: string, newRole: string) {
  try {
    await updateUser(userId, {
      role: newRole,
      verified: true,
      desired_role: "",
    });
    return { success: true, message: "User role updated successfully!" };
  } catch (error) {
    return { success: false, message: "Failed to update user role." };
  }
}

export async function deleteUserAction(userId: string) {
  try {
    // Delete from profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("Failed to delete profile:", profileError);
      return { success: false, message: "Failed to delete user profile." };
    }

    // Note: Deleting from auth.users requires admin privileges
    // This would need to be done through Supabase dashboard or admin API
    // For now, we'll just delete the profile and inform the user

    return {
      success: true,
      message:
        "User profile deleted successfully. Note: User account may still exist in auth system.",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, message: "Failed to delete user." };
  }
}
