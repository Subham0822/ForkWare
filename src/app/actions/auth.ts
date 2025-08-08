'use server'

import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export async function signup(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Customers are verified by default. Other roles need admin approval.
    const isVerified = role === 'Customer';

    await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        role: role,
        verified: isVerified,
    });
    
    return { success: true, message: 'Account created successfully! Please login.' };
  } catch (error: any) {
    let errorMessage = 'An unexpected error occurred. Please try again.';
    if (error.code) {
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'This email address is already in use.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
            case 'auth/weak-password':
                errorMessage = 'The password is too weak. Please choose a stronger password.';
                break;
            default:
                errorMessage = 'An error occurred during signup. Please try again.';
        }
    } else if (error.message) {
        errorMessage = error.message;
    }
    return { success: false, message: errorMessage };
  }
}

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        return { success: true, message: 'Login successful!' };
    } catch (error: any) {
        let errorMessage = 'An unexpected error occurred. Please try again.';
        // Firebase Auth errors have a `code` property.
        if (error.code) {
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMessage = 'Invalid email or password. Please try again.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Please enter a valid email address.';
                    break;
                case 'auth/too-many-requests':
                     errorMessage = 'Too many login attempts. Please try again later.';
                     break;
                default:
                    errorMessage = 'An error occurred during login. Please try again.';
            }
        } else if (error.message) {
            errorMessage = error.message;
        }
        return { success: false, message: errorMessage };
    }
}
