
'use client';

import { useState, useEffect } from "react";
import { LayoutDashboard, Package, ShoppingBag, MessageSquare, Settings, LogOut, Search, ExternalLink, IndianRupee, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { initializeFirebase, useCollection } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc } from "firebase/firestore";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const { firestore } = initializeFirebase();

  // Orders Collection
  const ordersQuery = query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
  const { data: orders, loading: ordersLoading } = useCollection(ordersQuery);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin") {
      setIsAuthenticated(true);
    } else {
      alert("Invalid credentials. (Hint: password is 'admin')");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-accent/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 shadow-2xl rounded-[2.5rem] border-none">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LayoutDashboard />
            </div>
            <h1 className="text-3xl font-headline font-bold">Admin Portal</h1>
            <p className="text-muted-foreground mt-2">Enter your credentials to manage store orders</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Access Key</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-12 rounded-full px-6" />
            </div>
            <Button type="submit" className="w-full h-14 rounded-full text-lg shadow-lg">Authorize Access</Button>
          </form>
        </Card>
      </div>
    );
  }

  const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

  return (
    <div className="bg-background min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-headline font-bold leading-none">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-bold mt-2">Store Management System</p>
            </div>
          </div>
          <Button variant="outline" size="lg" className="rounded-full border-2 gap-2" onClick={() => setIsAuthenticated(false)}>
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="rounded-[2.5rem] border-none shadow-soft bg-card p-6">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
                 <IndianRupee className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Total Revenue</p>
                 <h2 className="text-3xl font-headline font-bold">₹{totalRevenue}</h2>
               </div>
             </div>
          </Card>
          <Card className="rounded-[2.5rem] border-none shadow-soft bg-card p-6">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                 <ShoppingBag className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Orders</p>
                 <h2 className="text-3xl font-headline font-bold">{orders?.length || 0}</h2>
               </div>
             </div>
          </Card>
          <Card className="rounded-[2.5rem] border-none shadow-soft bg-card p-6">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                 <TrendingUp className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Active Store</p>
                 <h2 className="text-3xl font-headline font-bold">Live</h2>
               </div>
             </div>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-8">
          <TabsList className="bg-card/50 p-2 rounded-full border-2 w-full max-w-2xl mx-auto flex h-16">
            <TabsTrigger value="orders" className="flex-1 rounded-full text-lg data-[state=active]:bg-primary data-[state=active]:text-white">
              <ShoppingBag className="mr-2 w-5 h-5" /> Orders
            </TabsTrigger>
            <TabsTrigger value="products" className="flex-1 rounded-full text-lg data-[state=active]:bg-primary data-[state=active]:text-white">
              <Package className="mr-2 w-5 h-5" /> Catalog
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="font-headline text-3xl">Customer Orders</CardTitle>
                <CardDescription>Real-time orders processed through Razorpay</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {ordersLoading ? (
                  <div className="text-center py-20">Loading orders...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-b-2">
                          <TableHead className="font-bold">Customer</TableHead>
                          <TableHead className="font-bold">Items</TableHead>
                          <TableHead className="font-bold">Total</TableHead>
                          <TableHead className="font-bold">Status</TableHead>
                          <TableHead className="font-bold">Date</TableHead>
                          <TableHead className="text-right font-bold">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders?.map((order) => (
                          <TableRow key={order.id} className="hover:bg-accent/10">
                            <TableCell>
                              <div className="font-bold">{order.customerName}</div>
                              <div className="text-xs text-muted-foreground">{order.phone}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {order.items?.map((item: any) => `${item.name} (x${item.quantity})`).join(', ')}
                              </div>
                            </TableCell>
                            <TableCell className="font-bold">₹{order.total}</TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-full px-3">{order.paymentStatus}</Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {order.createdAt?.toDate().toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="rounded-full gap-1">
                                View <ExternalLink className="w-3 h-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <div className="text-center py-24 bg-card rounded-[3rem] shadow-xl">
               <Package className="w-16 h-16 mx-auto mb-6 text-muted-foreground opacity-20" />
               <h3 className="text-3xl font-headline font-bold mb-4">Catalog Manager</h3>
               <p className="text-muted-foreground max-w-md mx-auto">
                 Catalog management is currently reading from the static master list. Firestore product sync coming in next update.
               </p>
               <Button className="mt-8 rounded-full px-12 h-14" variant="outline" disabled>Add New Product</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
