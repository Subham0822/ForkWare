'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FileUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const surplusFormSchema = z.object({
  foodName: z.string().min(2, "Food name must be at least 2 characters."),
  quantity: z.string().min(1, "Please enter a quantity."),
  expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  pickupLocation: z.string().min(5, "Location must be at least 5 characters."),
  image: z.any().optional(),
});

type SurplusFormValues = z.infer<typeof surplusFormSchema>;

const mockUsers = [
  { id: '1', email: 'volunteer@example.com', role: 'NGO / Volunteer' },
  { id: '2', email: 'canteen.staff@example.com', role: 'Canteen / Event' },
  { id: '3', email: 'admin@example.com', role: 'Admin' },
  { id: '4', email: 'new.user@example.com', role: 'Customer' },
];

export default function AdminDashboard() {
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
            <CardHeader>
                <CardTitle className="font-headline">User Management</CardTitle>
                <CardDescription>View and manage user roles across the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>User Email</TableHead>
                    <TableHead className="w-[180px]">Role</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {mockUsers.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                            <Select defaultValue={user.role}>
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
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
