import { readUsers } from '@/app/actions/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const users = await readUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users from CSV:', error);
    return NextResponse.json({ message: 'Failed to fetch users.' }, { status: 500 });
  }
}