'use server';

import { auth, db } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
} from 'firebase/firestore';

// Note: We are not implementing server-side session management for this example.
// In a production app, you would use session cookies or other mechanisms.

export async function signup(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  if (password.length < 6) {
    return {
      success: false,
      message: 'Password must be at least 6 characters long.',
    };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Create a user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name,
      email,
      role,
      verified: role === 'Customer', // Customers are auto-verified
      desiredRole: '',
    });

    return { success: true, message: 'Account created successfully! Please login.' };
  } catch (error: any) {
    // Basic error handling
    if (error.code === 'auth/email-already-in-use') {
      return { success: false, message: 'This email address is already in use.' };
    }
    return {
      success: false,
      message: 'An unexpected error occurred during signup.',
    };
  }
}

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true, message: 'Login successful!' };
  } catch (error: any) {
    if (
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-credential'
    ) {
      return {
        success: false,
        message: 'Invalid email or password. Please try again.',
      };
    }
    return {
      success: false,
      message: 'An unexpected error occurred during login.',
    };
  }
}

// This function is intended to be called from a client-side context where auth state is managed
export async function logout() {
  try {
    await signOut(auth);
    return { success: true, message: 'Logged out successfully.' };
  } catch (error: any) {
    return {
      success: false,
      message: 'An error occurred during logout.',
    };
  }
}

export async function getUserProfile(uid: string) {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, message: 'User profile not found.' };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to fetch user profile.',
    };
  }
}


export async function requestRoleChange(userId: string, newRole: string) {
    try {
        const userDocRef = doc(db, "users", userId);
        await updateDoc(userDocRef, {
            desiredRole: newRole,
        });
        return { success: true, message: "Role change requested successfully!" };
    } catch (error) {
        return { success: false, message: "An unexpected error occurred." };
    }
}

export async function updateUserRole(userId: string, newRole: string) {
    try {
        const userDocRef = doc(db, "users", userId);
        await updateDoc(userDocRef, {
            role: newRole,
            verified: true, // Approve and verify
            desiredRole: "", // Clear the request
        });
        return { success: true, message: "User role updated successfully!" };
    } catch (error) {
        return { success: false, message: "An unexpected error occurred." };
    }
}

export async function getAllUsers() {
  try {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(query(usersCollection));
    const usersList = usersSnapshot.docs.map(doc => doc.data());
    return { success: true, data: usersList };
  } catch (error) {
    console.error("Error fetching users from Firestore: ", error);
    return { success: false, message: "Failed to fetch users." };
  }
}
