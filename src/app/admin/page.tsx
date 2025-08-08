
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import React, { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { signup } from '@/app/actions/auth';
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FileUp, RefreshCw, UserPlus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

const surplusFormSchema = z.object({
  foodName: z.string().min(2, "Food name must be at least 2 characters."),
  quantity: z.string().min(1, "Please enter a quantity."),
  expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  pickupLocation: z.string().min(5, "Location must be at least 5 characters."),
  image: z.any().optional(),
});

type SurplusFormValues = z.infer<typeof surplusFormSchema>;

const addUserFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    role: z.string().min(1, "Please select a role."),
});

type AddUserFormValues = z.infer<typeof addUserFormSchema>;

interface User {
    id: string;
    email: string;
    role: string;
    verified: boolean;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const { toast } = useToast();

  const [signupState, signupAction, isSignupPending] = useActionState(signup, null);

  const surplusForm = useForm<SurplusFormValues>({
    resolver: zodResolver(surplusFormSchema),
    defaultValues: {
      foodName: "",
      quantity: "",
      expiryDate: "",
      pickupLocation: "",
    },
  });

  const addUserForm = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "Customer",
    },
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Note: With CSV, we can't easily fetch users on the client.
      // This part of the UI would need a dedicated API route to read the CSV on the server.
      // For now, this will likely not display any users.
      console.warn("User fetching is not implemented for CSV storage. This list will be empty.");
      setUsers([]);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch users." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (signupState?.success) {
      toast({
        title: "Success",
        description: "User created successfully!",
      });
      setIsAddUserDialogOpen(false);
      addUserForm.reset();
      fetchUsers(); // Refresh the user list
    } else if (signupState?.success === false) {
      toast({
        variant: "destructive",
        title: "Failed to Create User",
        description: signupState.message,
      });
    }
  }, [signupState, toast, addUserForm]);


  const handleRoleChange = async (userId: string, newRole: string) => {
    // This functionality is complex with a CSV file and would require a dedicated server action.
    toast({ variant: "destructive", title: "Not Implemented", description: "Changing roles is not supported with CSV storage."});
  };
  
  const handleVerificationChange = async (userId: string, verified: boolean) => {
    // This functionality is complex with a CSV file and would require a dedicated server action.
    toast({ variant: "destructive", title: "Not Implemented", description: "Changing verification is not supported with CSV storage."});
  };

  function onSurplusSubmit(data: SurplusFormValues) {
    console.log(data);
    // Here you would handle form submission to your backend
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <h1 className="text-3xl font-headline font-bold mb-8">Admin Dashboard</h1>
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Log or Update Surplus Food</CardTitle>
            <CardDescription>Fill out the form to list new or update surplus items.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...surplusForm}>
              <form onSubmit={surplusForm.handleSubmit(onSurplusSubmit)} className="space-y-6">
                <FormField control={surplusForm.control} name="foodName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Food Name</FormLabel>
                    <FormControl><Input placeholder="e.g. Fresh Sandwiches" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={surplusForm.control} name="quantity" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl><Input placeholder="e.g. 20 units" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={surplusForm.control} name="expiryDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date & Time</FormLabel>
                    <FormControl><Input type="datetime-local" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={surplusForm.control} name="pickupLocation" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup Location</FormLabel>
                    <FormControl><Input placeholder="e.g. Main Canteen, Block A" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Button variant="outline" className="w-full justify-start font-normal gap-2">
                      <FileUp className="h-4 w-4" /> Upload an image
                    </Button>
                  </FormControl>
                </FormItem>
                <Button type="submit" className="w-full">Add/Update Listing</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-headline">User Management</CardTitle>
                <CardDescription>Note: User management is limited with CSV storage.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                 <Button variant="outline" size="sm" onClick={() => setIsAddUserDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                </Button>
                <Button variant="ghost" size="icon" onClick={fetchUsers} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
                {isLoading ? <p>Loading users...</p> : (
                  users.length === 0 ? <p>User list is unavailable with CSV storage.</p> :
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>User Email</TableHead>
                    <TableHead className="w-[180px]">Role</TableHead>
                    <TableHead className="text-center">Verified</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                            <Select defaultValue={user.role} onValueChange={(newRole) => handleRoleChange(user.id, newRole)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                    <SelectItem value="Canteen / Event">Canteen / Event</SelectItem>
                                    <SelectItem value="NGO / Volunteer">NGO / Volunteer</SelectItem>
                                    <SelectItem value="Customer">Customer</SelectItem>
                                </SelectContent>
                            </Select>
                        </TableCell>
                         <TableCell className="text-center">
                            <div className="flex items-center justify-center space-x-2">
                                <Switch
                                    id={`verified-switch-${user.id}`}
                                    checked={user.verified}
                                    onCheckedChange={(checked) => handleVerificationChange(user.id, checked)}
                                    aria-readonly
                                />
                            </div>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
                )}
            </CardContent>
        </Card>
      </div>

       <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
           <Form {...addUserForm}>
              <form action={signupAction} className="space-y-4">
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                        Create a new user account and assign them a role. The user will be saved to the local CSV file.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                   <FormField control={addUserForm.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                     <FormField control={addUserForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" placeholder="user@example.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={addUserForm.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl><Input type="password" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={addUserForm.control} name="role" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} name="role">
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </Trigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                    <SelectItem value="Canteen / Event">Canteen / Event</SelectItem>
                                    <SelectItem value="NGO / Volunteer">NGO / Volunteer</SelectItem>
                                    <SelectItem value="Customer">Customer</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSignupPending}>
                        {isSignupPending ? "Creating User..." : "Create User"}
                    </Button>
                </DialogFooter>
              </form>
           </Form>
        </DialogContent>
      </Dialog>
    </div>
  );

    