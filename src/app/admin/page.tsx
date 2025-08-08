'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FileUp, RefreshCw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";


const surplusFormSchema = z.object({
  foodName: z.string().min(2, "Food name must be at least 2 characters."),
  quantity: z.string().min(1, "Please enter a quantity."),
  expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  pickupLocation: z.string().min(5, "Location must be at least 5 characters."),
  image: z.any().optional(),
});

type SurplusFormValues = z.infer<typeof surplusFormSchema>;

interface User {
    id: string;
    email: string;
    role: string;
    verified: boolean;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    const usersCollection = collection(db, 'users');
    const userSnapshot = await getDocs(usersCollection);
    const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    setUsers(userList);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role: newRole });
    setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
  };
  
  const handleVerificationChange = async (userId: string, verified: boolean) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { verified });
    setUsers(users.map(user => user.id === userId ? { ...user, verified } : user));
  };

  const form = useForm<SurplusFormValues>({
    resolver: zodResolver(surplusFormSchema),
    defaultValues: {
      foodName: "",
      quantity: "",
      expiryDate: "",
      pickupLocation: "",
    },
  });

  function onSubmit(data: SurplusFormValues) {
    console.log(data);
    // Here you would handle form submission to Firebase
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="foodName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Food Name</FormLabel>
                    <FormControl><Input placeholder="e.g. Fresh Sandwiches" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="quantity" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl><Input placeholder="e.g. 20 units" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="expiryDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date & Time</FormLabel>
                    <FormControl><Input type="datetime-local" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="pickupLocation" render={({ field }) => (
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
                <CardDescription>View and manage user roles across the platform.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={fetchUsers} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? <p>Loading users...</p> : (
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
    </div>
  );
}
