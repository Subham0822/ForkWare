'use server'

import fs from 'fs/promises';
import path from 'path';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-key-that-is-long-enough');

interface UserPayload {
  uid: string;
  name: string;
  email: string;
  role: string;
  verified: boolean;
}

const csvFilePath = path.join(process.cwd(), 'data', 'users.csv');

async function readUsers() {
  try {
    const data = await fs.readFile(csvFilePath, 'utf-8');
    const lines = data.trim().split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const user: any = {};
      headers.forEach((header, i) => {
        user[header.trim()] = values[i].trim();
      });
      return user;
    });
  } catch (error) {
    // If the file doesn't exist, return an empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeUsers(users: any[]) {
  const headers = Object.keys(users[0]).join(',');
  const rows = users.map(user => Object.values(user).join(','));
  const csvContent = `${headers}\n${rows.join('\n')}`;
  await fs.mkdir(path.dirname(csvFilePath), { recursive: true });
  await fs.writeFile(csvFilePath, csvContent, 'utf-8');
}


export async function signup(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  try {
    const users = await readUsers();
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return { success: false, message: 'This email address is already in use.' };
    }
    
    if (password.length < 6) {
        return { success: false, message: 'The password is too weak. Please choose a stronger password.' };
    }

    const newUser = {
      uid: Date.now().toString(),
      name,
      email,
      password, // In a real app, you MUST hash passwords
      role,
      verified: role === 'Customer' ? 'true' : 'false',
    };

    users.push(newUser);
    if(users.length === 1) { // First user, write headers
        const headers = Object.keys(newUser).join(',');
        const row = Object.values(newUser).join(',');
        await fs.mkdir(path.dirname(csvFilePath), { recursive: true });
        await fs.writeFile(csvFilePath, `${headers}\n${row}`, 'utf-8');
    } else {
        await fs.appendFile(csvFilePath, `\n${Object.values(newUser).join(',')}`, 'utf-8');
    }
    
    return { success: true, message: 'Account created successfully! Please login.' };
  } catch (error: any) {
    return { success: false, message: 'An unexpected error occurred during signup.' };
  }
}

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
        const users = await readUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return { success: false, message: 'Invalid email or password. Please try again.' };
        }

        const payload: UserPayload = {
            uid: user.uid,
            name: user.name,
            email: user.email,
            role: user.role,
            verified: user.verified === 'true',
        };

        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        const session = await new SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime(expires)
            .setIssuedAt()
            .setSubject(user.uid)
            .sign(secretKey);

        cookies().set('session', session, { expires, httpOnly: true });

        return { success: true, message: 'Login successful!' };
    } catch (error: any) {
        return { success: false, message: 'An unexpected error occurred during login.' };
    }
}

export async function logout() {
  cookies().set('session', '', { expires: new Date(0) });
  redirect('/login');
}

export async function getSession() {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return null;
  try {
    const { payload } = await jwtVerify(sessionCookie, secretKey, {
      algorithms: ['HS256'],
    });
    return payload as UserPayload;
  } catch (error) {
    return null;
  }
}