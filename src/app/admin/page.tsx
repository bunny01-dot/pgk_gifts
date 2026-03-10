'use client';

import { useState, useEffect } from "react";
import { LayoutDashboard, ShoppingBag, LogOut, IndianRupee, TrendingUp, Search, Filter, CheckCircle2, Clock, Truck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { initializeFirebase } from "@/firebase";
import { OrdersService } from "@/services/orders.service";
import { Order, OrderStatus } from "@/types/order";
import { formatPrice } from "@/utils/currency";
import { formatDate } from "@/utils/date";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin") {
      setIsAuthenticated(true);
    } else {
      alert("Invalid access key.");
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const { firestore } = initializeFirebase();
    const ordersService = new OrdersService(firestore);

    const unsubscribe = ordersService.subscribeToOrders((data) => {
      setOrders(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const { firestore } = initializeFirebase();
    const ordersService = new OrdersService(firestore);
    await ordersService.updateOrderStatus(orderId, status);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-accent/10 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-10 shadow-2xl rounded-[3rem] border-none">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary text-primary-foreground rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <LayoutDashboard size={32} />
            </div>
            <h1 className="text-4xl font-headline font-bold">Admin Portal</h1>
            <p className="text-muted-foreground mt-3">Authorize access to manage orders</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Access Key</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-14 rounded-full px-8 bg-accent/5 border-none" />
            </div>
            <Button type="submit" className="w-full h-16 rounded-full text-lg font-bold shadow-lg">Login to Dashboard</Button>
          </form>
        </Card>
      </div>
    );
  }

  const filteredOrders = orders.filter(o => 
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.orderId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="bg-background min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl">
              <LayoutDashboard className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-4xl font-headline font-bold leading-none">Management</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold mt-2">PGK Gifts Operations</p>
            </div>
          </div>
          <Button variant="outline" size="lg" className="rounded-full border-2 h-14 px-8 font-bold" onClick={() => setIsAuthenticated(false)}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <StatCard icon={IndianRupee} color="green" label="Total Revenue" value={formatPrice(totalRevenue)} />
          <StatCard icon={ShoppingBag} color="blue" label="Total Orders" value={orders.length.toString()} />
          <StatCard icon={TrendingUp} color="purple" label="Active Status" value="Online" />
        </div>

        {/* Orders Table */}
        <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden">
          <CardHeader className="p-10 border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <CardTitle className="font-headline text-3xl">Live Orders</CardTitle>
                <CardDescription>Track and manage customer fulfillments</CardDescription>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search order or customer..." 
                  className="pl-10 h-12 rounded-full border-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-32 text-center text-muted-foreground">Synchronizing database...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-accent/5">
                    <TableRow>
                      <TableHead className="pl-10 font-bold py-6">Order ID</TableHead>
                      <TableHead className="font-bold">Customer</TableHead>
                      <TableHead className="font-bold">Items</TableHead>
                      <TableHead className="font-bold">Amount</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="font-bold">Date</TableHead>
                      <TableHead className="pr-10 text-right font-bold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-accent/5 transition-colors">
                        <TableCell className="pl-10 font-mono text-xs font-bold text-primary">{order.orderId}</TableCell>
                        <TableCell>
                          <div className="font-bold">{order.customerName}</div>
                          <div className="text-[10px] text-muted-foreground uppercase font-bold">{order.phone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs max-w-[200px] truncate">
                            {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-lg">{formatPrice(order.total)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`rounded-full px-3 py-1 font-bold border-none ${getStatusColor(order.status)}`}>
                            {order.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell className="pr-10 text-right">
                          <Select defaultValue={order.status} onValueChange={(v) => updateStatus(order.id, v as OrderStatus)}>
                            <SelectTrigger className="w-[140px] rounded-full border-2 h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, color, label, value }: { icon: any, color: string, label: string, value: string }) {
  const colors: any = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600"
  };
  return (
    <Card className="rounded-[3rem] border-none shadow-soft bg-card p-8 transition-transform hover:scale-[1.02]">
      <div className="flex items-center gap-6">
        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg ${colors[color]}`}>
          <Icon className="w-8 h-8" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">{label}</p>
          <h2 className="text-4xl font-headline font-bold mt-1">{value}</h2>
        </div>
      </div>
    </Card>
  );
}

function getStatusColor(status: OrderStatus) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-700';
    case 'processing': return 'bg-blue-100 text-blue-700';
    case 'shipped': return 'bg-purple-100 text-purple-700';
    case 'delivered': return 'bg-green-100 text-green-700';
    case 'cancelled': return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-700';
  }
}
