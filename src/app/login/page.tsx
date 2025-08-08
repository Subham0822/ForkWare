"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useActionState } from "react";
import { signup, login } from "@/app/actions/auth";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "customer"; // Default to customer
  const isSignup = searchParams.get("signup") === "true";
  const { toast } = useToast();
  const { user, loading } = useUser();

  const [loginState, loginAction, isLoginPending] = useActionState(login, null);
  const [signupState, signupAction, isSignupPending] = useActionState(signup, null);

  useEffect(() => {
    // If user is logged in (and not loading), redirect to profile
    if (!loading && user) {
      router.push('/profile');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    if (loginState?.success) {
      toast({
        title: "Login Successful",
        description: "Redirecting to your profile...",
      });
      // The user object listener will trigger the redirect.
      // Forcing it here can be unreliable if the auth state hasn't propagated yet.
      router.push('/profile');
    } else if (loginState?.success === false) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: loginState.message,
      });
    }
  }, [loginState, router, toast]);

  useEffect(() => {
    if (signupState?.success) {
       toast({
        variant: "default",
        title: "Success",
        description: signupState.message,
      });
       if (signupState.success) {
        // Switch to the login tab after successful signup
        router.push(`/login?role=${role}`);
      }
    } else if (signupState?.success === false) {
        toast({
            variant: "destructive",
            title: "Signup Failed",
            description: signupState.message,
        });
    }
  }, [signupState, toast, role, router]);


  const getRoleName = (roleKey: string) => {
    const roles: { [key: string]: string } = {
        canteen: "Canteen / Event",
        ngo: "NGO / Volunteer",
        customer: "Customer",
    };
    return roles[roleKey] || "Customer";
  };
  
  const currentRole = getRoleName(role);

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)] py-12">
      <Tabs
        defaultValue={isSignup ? "signup" : "login"}
        className="w-full max-w-md"
        onValueChange={(value) => router.push(`/login?role=${role}${value === 'signup' ? '&signup=true' : ''}`)}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <form action={loginAction}>
            <Card>
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-headline">
                  Login to your Account
                </CardTitle>
                <CardDescription>
                  Enter your email below to login to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login">Email</Label>
                  <Input
                    id="email-login"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-login">Password</Label>
                  <Input id="password-login" name="password" type="password" required />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" type="submit" disabled={isLoginPending}>
                  {isLoginPending ? "Logging in..." : "Login"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
        <TabsContent value="signup">
          <form action={signupAction}>
            <Card>
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-headline">
                  Create a {currentRole} Account
                </CardTitle>
                <CardDescription>
                  Enter your information to create an account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                  <Label htmlFor="name-signup">Organization/Full Name</Label>
                  <Input
                    id="name-signup"
                    name="name"
                    placeholder="e.g. Campus Kitchen or John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input
                    id="email-signup"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <Input id="password-signup" name="password" type="password" required />
                </div>
                 <input type="hidden" name="role" value={currentRole} />
              </CardContent>
              <CardFooter>
                <Button className="w-full" type="submit" disabled={isSignupPending}>
                    {isSignupPending ? "Creating Account..." : "Create Account"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
