'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileUp, MoreHorizontal } from "lucide-react";

const surplusFormSchema = z.object({
  foodName: z.string().min(2, "Food name must be at least 2 characters."),
  quantity: z.string().min(1, "Please enter a quantity."),
  expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  pickupLocation: z.string().min(5, "Location must be at least 5 characters."),
  image: z.any().optional(),
});

type SurplusFormValues = z.infer<typeof surplusFormSchema>;

const mockPostings = [
  { id: '1', name: 'Fresh Sandwiches', quantity: '20 units', expires: 'in 2 hours', status: 'Available' },
  { id: '2', name: 'Vegetable Curry', quantity: '15 portions', expires: 'in 4 hours', status: 'Available' },
  { id: '3', name: 'Assorted Pastries', quantity: '3 dozen', expires: 'Expired', status: 'Expired' },
  { id: '4', name: 'Leftover Pizza', quantity: '5 boxes', expires: 'Picked Up', status: 'Picked Up' },
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

  const getBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Available': return 'default';
      case 'Picked Up': return 'secondary';
      case 'Expired': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <h1 className="text-3xl font-headline font-bold mb-8">Canteen Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Log Surplus Food</CardTitle>
              <CardDescription>Fill out the form to list new surplus items.</CardDescription>
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
                  <Button type="submit" className="w-full">Add Listing</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Active Postings</CardTitle>
              <CardDescription>Manage your current surplus food listings.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Food Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPostings.map((item) => (
                    <TableRow key={item.id} className={item.status === 'Expired' ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        <Badge variant={getBadgeVariant(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell className={item.status === 'Expired' ? 'text-destructive' : ''}>{item.expires}</TableCell>
                      <TableCell className="text-right">
                         <Button variant="ghost" size="icon">
                           <MoreHorizontal className="h-4 w-4" />
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
