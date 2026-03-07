
"use client";

import { useState } from "react";
import { LayoutDashboard, Package, Image as ImageIcon, MessageSquare, Settings, Plus, Edit2, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

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
        <Card className="max-w-md w-full p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LayoutDashboard />
            </div>
            <h1 className="text-2xl font-headline font-bold">Admin Portal</h1>
            <p className="text-muted-foreground">Enter your credentials to manage PGK Legacy content</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">Access Key</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full h-12 rounded-full">Authorize Access</Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-headline font-bold">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Welcome back, John Solomon</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsAuthenticated(false)}>Logout</Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="bg-accent/30 p-1 rounded-full w-full max-w-2xl mx-auto flex">
            <TabsTrigger value="products" className="flex-1 rounded-full"><Package className="mr-2 w-4 h-4" /> Products</TabsTrigger>
            <TabsTrigger value="portfolio" className="flex-1 rounded-full"><ImageIcon className="mr-2 w-4 h-4" /> Portfolio</TabsTrigger>
            <TabsTrigger value="inquiries" className="flex-1 rounded-full"><MessageSquare className="mr-2 w-4 h-4" /> Inquiries <Badge className="ml-2 bg-primary">3</Badge></TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 rounded-full"><Settings className="mr-2 w-4 h-4" /> Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card className="border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <div>
                  <CardTitle className="font-headline text-2xl">Gift Catalog</CardTitle>
                  <CardDescription>Manage your personalized gift products and pricing</CardDescription>
                </div>
                <Button className="rounded-full"><Plus className="mr-2 w-4 h-4" /> New Product</Button>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-10" placeholder="Search products..." />
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { name: "Classic Mug", cat: "Drinkware", price: "$15.00", status: "Active" },
                      { name: "Cotton T-Shirt", cat: "Apparel", price: "$25.00", status: "Active" },
                      { name: "Gallery Canvas", cat: "Home Decor", price: "$45.00", status: "Out of Stock" }
                    ].map((p, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-bold">{p.name}</TableCell>
                        <TableCell>{p.cat}</TableCell>
                        <TableCell>{p.price}</TableCell>
                        <TableCell>
                          <Badge variant={p.status === "Active" ? "default" : "secondary"}>{p.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon"><Edit2 className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <Card className="border-2 border-dashed flex flex-col items-center justify-center p-12 text-muted-foreground cursor-pointer hover:bg-accent/20 transition-all">
                 <Plus className="w-12 h-12 mb-4" />
                 <p className="font-bold">Add New Collection</p>
               </Card>
               {[1, 2, 3].map((i) => (
                 <Card key={i} className="overflow-hidden group">
                   <div className="aspect-video relative">
                     <img src={`https://picsum.photos/seed/port-${i}/600/400`} className="object-cover w-full h-full" alt="Portfolio" />
                   </div>
                   <CardContent className="p-4 flex items-center justify-between">
                     <h4 className="font-bold">Collection {i}</h4>
                     <div className="flex gap-2">
                       <Button variant="ghost" size="icon"><Edit2 className="w-4 h-4" /></Button>
                       <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                     </div>
                   </CardContent>
                 </Card>
               ))}
            </div>
          </TabsContent>

          <TabsContent value="inquiries">
             <div className="space-y-4">
                {[
                  { from: "Sarah Jenkins", type: "Wedding Photography", date: "2 hours ago", status: "New" },
                  { from: "Robert Miller", type: "Bulk Mug Order", date: "Yesterday", status: "Pending" },
                  { from: "Emily White", type: "Portrait Session", date: "3 days ago", status: "Responded" }
                ].map((msg, i) => (
                  <Card key={i} className="hover:shadow-md transition-all">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center font-bold text-primary">
                          {msg.from[0]}
                        </div>
                        <div>
                          <h4 className="font-bold">{msg.from}</h4>
                          <p className="text-sm text-muted-foreground">{msg.type} • {msg.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={msg.status === "New" ? "default" : "secondary"}>{msg.status}</Badge>
                        <Button variant="outline" size="sm">View Message</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
