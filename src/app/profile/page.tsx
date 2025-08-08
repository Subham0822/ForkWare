
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/use-user';
import { auth } from '@/lib/firebase';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading } = useUser();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <div className="container mx-auto py-10 text-center">Loading profile...</div>;
  }

  if (!user || !profile) {
    // This state is hit if useUser hook redirects. It's a fallback.
    // The hook should handle the redirect now.
    return (
        <div className="container mx-auto py-10 text-center">
            <p>You must be logged in to view this page.</p>
            <Button onClick={() => router.push('/login')} className="mt-4">Go to Login</Button>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6 flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">My Profile</CardTitle>
          <CardDescription>Your personal and role information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Name</h3>
            <p>{profile.name}</p>
          </div>
          <div>
            <h3 className="font-semibold">Email</h3>
            <p>{profile.email}</p>
          </div>
          <div>
            <h3 className="font-semibold">Role</h3>
            <p>{profile.role}</p>
          </div>
           <div>
            <h3 className="font-semibold">Verification Status</h3>
            {profile.verified ? (
                <p className="text-green-600">Verified</p>
            ) : (
                <p className="text-amber-600">Pending Verification. An admin will review your request soon.</p>
            )}
          </div>
          <Button onClick={handleLogout} className="w-full" variant="outline">
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
