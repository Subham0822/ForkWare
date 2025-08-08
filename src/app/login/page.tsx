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
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { signup, login } from "@/app/actions/auth";
import { useToast } from "@/hooks/use-toast";
import React, { useActionState } from "react";
import { useRouter } from "next/navigation";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get("role") || "ngo";
  const isSignup = searchParams.get("signup") === "true";
  const { toast } = useToast();

  const [loginState, loginAction, isLoginPending] = useActionState(login, undefined);
  const [signupState, signupAction, isSignupPending] = useActionState(signup, undefined);
  
  useEffect(() => {
    if (loginState?.message) {
      toast({
        variant: loginState.success ? "default" : "destructive",
        title: loginState.success ? "Success" : "Error",
        description: loginState.message,
      });
    }
  }, [loginState, toast]);

  useEffect(() => {
    if (signupState?.message) {
      toast({
        variant: signupState.success ? "default" : "destructive",
        title: signupState.success ? "Success" : "Error",
        description: signupState.message,
      });
       if (signupState.success) {
        router.push('/login?role=' + role);
      }
    }
  }, [signupState, toast, role, router]);


  const getRoleName = (role: string) => {
    if (role === "canteen") return "Canteen / Event";
    if (role === "ngo") return "NGO / Volunteer";
    return "Customer";
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)] py-12">
      <Tabs
        defaultValue={isSignup ? "signup" : "login"}
        className="w-full max-w-md"
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
                <Button className="w-full" disabled={isLoginPending}>
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
                  Create a {getRoleName(role)} Account
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
                 <input type="hidden" name="role" value={getRoleName(role)} />
              </CardContent>
              <CardFooter>
                <Button className="w-full" disabled={isSignupPending}>
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
