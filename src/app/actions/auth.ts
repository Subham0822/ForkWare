'use server'

import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { redirect } from 'next/navigation';

export async function signup(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const isVerified = role === 'Customer';

    await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        role: role,
        verified: isVerified,
    });
    
    return { success: true, message: 'Account created successfully! You can now login.' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        return { success: true, message: 'Login successful!' };
    } catch (error: any) {
        let errorMessage = 'Invalid login credentials. Please try again.';
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
             errorMessage = 'Invalid email or password.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        return { success: false, message: errorMessage };
    }
}