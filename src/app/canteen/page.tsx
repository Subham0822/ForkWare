'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";

const mockPostings = [
  { id: '1', name: 'Fresh Sandwiches', quantity: '20 units', expires: 'in 2 hours', status: 'Available' },
  { id: '2', name: 'Vegetable Curry', quantity: '15 portions', expires: 'in 4 hours', status: 'Available' },
  { id: '3', name: 'Assorted Pastries', quantity: '3 dozen', expires: 'Expired', status: 'Expired' },
  { id: '4', name: 'Leftover Pizza', quantity: '5 boxes', expires: 'Picked Up', status: 'Picked Up' },
];

export default function CanteenPage() {

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
        <Card>
        <CardHeader>
            <CardTitle className="font-headline">My Food Postings</CardTitle>
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
  );
}