"use server";

import fs from "fs/promises";
import path from "path";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET || "your-fallback-secret-key";
const key = new TextEncoder().encode(secretKey);

// On Vercel/serverless, the filesystem is read-only under /var/task.
// We keep a seed CSV in public for read-only access in production and use /data for local dev where writes are allowed.
const isReadOnlyFs =
  !!process.env.VERCEL || process.env.NODE_ENV === "production";
const csvFilePath = isReadOnlyFs
  ? path.join(process.cwd(), "public", "users.csv")
  : path.join(process.cwd(), "data", "users.csv");

// Helper to read users from CSV
async function readUsers() {
  try {
    const data = await fs.readFile(csvFilePath, "utf-8");
    const lines = data.trim().split("\n");
    const headers = lines[0].split(",");
    return lines.slice(1).map((line) => {
      const values = line.split(",");
      return headers.reduce((obj, header, index) => {
        obj[header.trim()] = values[index].trim();
        return obj;
      }, {} as any);
    });
  } catch (error) {
    // If file doesn't exist, return empty array
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      // Try fallback to public/users.csv if primary path missing (e.g., during certain build setups)
      try {
        const fallbackPath = path.join(process.cwd(), "public", "users.csv");
        const data = await fs.readFile(fallbackPath, "utf-8");
        const lines = data.trim().split("\n");
        const headers = lines[0].split(",");
        return lines.slice(1).map((line) => {
          const values = line.split(",");
          return headers.reduce((obj, header, index) => {
            (obj as any)[header.trim()] = (values[index] ?? "").trim();
            return obj;
          }, {} as any);
        });
      } catch {
        return [];
      }
    }
    throw error;
  }
}

// Helper to write users to CSV
async function writeUsers(users: any[]) {
  if (isReadOnlyFs) {
    throw new Error("WRITE_UNAVAILABLE_READ_ONLY_FS");
  }
  const headers = [
    "uid",
    "name",
    "email",
    "password",
    "role",
    "verified",
    "desiredRole",
  ];
  const csvLines = [
    headers.join(","),
    ...users.map((user) =>
      headers.map((header) => user[header] ?? "").join(",")
    ),
  ];
  await fs.mkdir(path.dirname(csvFilePath), { recursive: true });
  await fs.writeFile(csvFilePath, csvLines.join("\n"), "utf-8");
}

export async function signup(prevState: any, formData: FormData) {
  if (isReadOnlyFs) {
    return {
      success: false,
      message:
        "Signups are disabled on the deployed demo. Please run locally to add users.",
    };
  }
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

  const users = await readUsers();
  if (users.some((u) => u.email === email)) {
    return { success: false, message: "This email address is already in use." };
  }

  const newUser = {
    uid: Date.now().toString(),
    name,
    email,
    password, // In a real app, hash this!
    role,
    verified: role === "Customer",
    desiredRole: "",
  };

  await writeUsers([...users, newUser]);

  return {
    success: true,
    message: "Account created successfully! Please login.",
  };
}

export async function login(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const users = await readUsers();
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return { success: false, message: "Invalid email or password." };
  }

  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const session = await new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expires)
    .sign(key);

  cookies().set("session", session, { expires, httpOnly: true });

  return { success: true, message: "Login successful!" };
}

export async function logout() {
  cookies().set("session", "", { expires: new Date(0) });
  return { success: true, message: "Logged out successfully." };
}

export async function getSession() {
  const session = cookies().get("session")?.value;
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

export async function updateUser(updatedUser: any) {
  if (isReadOnlyFs) {
    return {
      success: false,
      message: "Profile updates are disabled on the deployed demo.",
    };
  }
  let users = await readUsers();
  const index = users.findIndex((u) => u.uid === updatedUser.uid);
  if (index !== -1) {
    users[index] = { ...users[index], ...updatedUser };
    await writeUsers(users);
    return { success: true };
  }
  return { success: false, message: "User not found" };
}

export async function requestRoleChange(userId: string, newRole: string) {
  if (isReadOnlyFs) {
    return {
      success: false,
      message: "Role change requests are disabled on the deployed demo.",
    };
  }
  let users = await readUsers();
  const user = users.find((u) => u.uid === userId);

  if (!user) {
    return { success: false, message: "User not found." };
  }

  user.desiredRole = newRole;
  await writeUsers(users);
  return { success: true, message: "Role change requested successfully!" };
}

export async function updateUserRole(userId: string, newRole: string) {
  if (isReadOnlyFs) {
    return {
      success: false,
      message: "Admin role updates are disabled on the deployed demo.",
    };
  }
  let users = await readUsers();
  const user = users.find((u) => u.uid === userId);

  if (!user) {
    return { success: false, message: "User not found." };
  }

  user.role = newRole;
  user.verified = true; // Approve and verify
  user.desiredRole = ""; // Clear the request
  await writeUsers(users);
  return { success: true, message: "User role updated successfully!" };
}

export async function getAllUsers() {
  try {
    const users = await readUsers();
    // Remove password from the user data sent to the client
    const safeUsers = users.map((user) => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    return { success: true, data: safeUsers };
  } catch (error) {
    console.error("Error reading users.csv: ", error);
    return { success: false, message: "Failed to fetch users." };
  }
}
