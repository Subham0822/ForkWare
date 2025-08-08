'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FileUp } from "lucide-react";

const surplusFormSchema = z.object({
  foodName: z.string().min(2, "Food name must be at least 2 characters."),
  quantity: z.string().min(1, "Please enter a quantity."),
  expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  pickupLocation: z.string().min(5, "Location must be at least 5 characters."),
  image: z.any().optional(),
});

type SurplusFormValues = z.infer<typeof surplusFormSchema>;

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
      <div className="flex justify-center">
        <div className="w-full max-w-lg">
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
        </div>
      </div>
    </div>
  );
}
