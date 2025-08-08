import { getAllUsers } from '@/app/actions/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await getAllUsers();
    if (result.success) {
      return NextResponse.json(result.data);
    }
    return NextResponse.json({ message: result.message }, { status: 500 });

  } catch (error) {
    console.error('Failed to fetch users from CSV:', error);
    return NextResponse.json({ message: 'Failed to fetch users.' }, { status: 500 });
  }
}
