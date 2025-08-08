'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/use-user';
import { logout, requestRoleChange } from '@/app/actions/auth';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FormEvent } from 'react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading } = useUser();
  const { toast } = useToast();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleRoleRequest = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!user) return;
      
      const formData = new FormData(e.currentTarget);
      const newRole = formData.get('role') as string;

      if (!newRole) {
          toast({ variant: "destructive", title: "Error", description: "Please select a role to request." });
          return;
      }
      
      try {
          const result = await requestRoleChange(user.uid, newRole);
          if (result.success) {
              toast({ title: "Success", description: "Your role change request has been submitted." });
          } else {
              toast({ variant: "destructive", title: "Error", description: result.message });
          }
      } catch (error) {
          toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
      }
  };


  if (loading) {
    return <div className="container mx-auto py-10 text-center">Loading profile...</div>;
  }

  if (!user || !profile) {
    // This can be a loading state or a redirect. useUser hook handles redirection.
    return (
        <div className="container mx-auto py-10 text-center">
            <p>You must be logged in to view this page.</p>
            <Button onClick={() => router.push('/login')} className="mt-4">Go to Login</Button>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6 flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">My Profile</CardTitle>
          <CardDescription>Your personal and role information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Name</h3>
              <p>{profile.name}</p>
            </div>
            <div>
              <h3 className="font-semibold">Email</h3>
              <p>{profile.email}</p>
            </div>
          </div>
           <div>
            <h3 className="font-semibold">Current Role</h3>
            <p>{profile.role}</p>
          </div>
           <div>
            <h3 className="font-semibold">Verification Status</h3>
            {profile.verified ? (
                <p className="text-green-600">Verified</p>
            ) : (
                <div className='text-amber-600'>
                    <p>Pending Verification.</p>
                    {profile.desiredRole && <p className='text-sm opacity-80'>Your request for the '{profile.desiredRole}' role is awaiting admin approval.</p>}
                </div>
            )}
          </div>

          {profile.role === 'Customer' && (
              <form onSubmit={handleRoleRequest}>
                <Card className='bg-muted/50'>
                    <CardHeader>
                        <CardTitle className='text-xl'>Request Role Change</CardTitle>
                        <CardDescription>Want to become a food donor or a volunteer? Request a role change here. An administrator will review your request.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-2">
                            <Label htmlFor="role">Request New Role</Label>
                            <Select name="role" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a new role to request" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Canteen / Event">Canteen / Event (Food Donor)</SelectItem>
                                    <SelectItem value="NGO / Volunteer">NGO / Volunteer (Food Recipient)</SelectItem>
                                </SelectContent>
                            </Select>
                            {profile.desiredRole && (
                                <p className='text-sm text-muted-foreground pt-2'>
                                    Current pending request: <span className='font-medium opacity-70'>{profile.desiredRole}</span>
                                </p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={!!profile.desiredRole}>
                            {profile.desiredRole ? 'Request Pending' : 'Submit Request'}
                        </Button>
                    </CardFooter>
                </Card>
              </form>
          )}

        </CardContent>
        <CardFooter>
            <form action={handleLogout} className="w-full">
                <Button type="submit" className="w-full" variant="outline">
                    Logout
                </Button>
            </form>
        </CardFooter>
      </Card>
    </div>
  );
}
