'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingBag, LogOut, IndianRupee, TrendingUp, Search, ShieldAlert, CheckCircle2, Clock, Truck, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { initializeFirebase, useFirestore, useUser, useAuth, useDoc, useMemoFirebase } from "@/firebase";
import { OrdersService } from "@/services/orders.service";
import { Order, OrderStatus } from "@/types/order";
import { formatPrice } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { doc } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function AdminPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // DBAC: Check if current user is in roles_admin collection
  const adminDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [firestore, user]);

  const { data: adminRole, isLoading: isAdminCheckLoading } = useDoc(adminDocRef);

  useEffect(() => {
    if (isUserLoading || isAdminCheckLoading) return;

    if (!user) {
      router.push('/login?redirect=/admin');
      return;
    }

    // Note: In production, the role check is crucial.
    // For this prototype, we'll allow access if we find the role doc or if it's the first admin.
    const ordersService = new OrdersService(firestore);
    const unsubscribe = ordersService.subscribeToOrders((data) => {
      setOrders(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isUserLoading, isAdminCheckLoading, firestore, router]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const ordersService = new OrdersService(firestore);
    await ordersService.updateOrderStatus(orderId, status);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (isUserLoading || isAdminCheckLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent/5">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  // If user is logged in but not an admin (no document in roles_admin)
  // We'll show an unauthorized state
  if (user && !adminRole) {
    return (
      <div className="min-h-screen bg-accent/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-10 shadow-2xl rounded-[3rem] border-none text-center">
          <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={40} />
          </div>
          <h1 className="text-3xl font-headline font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-8">
            You are logged in as <span className="font-bold text-foreground">{user.email}</span>, but you do not have administrative privileges.
          </p>
          <div className="space-y-4">
            <Button asChild className="w-full h-14 rounded-full font-bold">
              <a href="/">Back to Home</a>
            </Button>
            <Button variant="outline" onClick={handleLogout} className="w-full h-14 rounded-full font-bold">
              Logout
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const filteredOrders = orders.filter(o => 
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.orderId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0);

  return (
    <div className="bg-background min-h-screen pt-40 pb-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl">
              <LayoutDashboard className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-4xl font-headline font-bold leading-none">Management</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold mt-2">Authenticated: {user?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="lg" className="rounded-full border-2 h-14 px-8 font-bold" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <StatCard icon={IndianRupee} color="green" label="Net Revenue" value={formatPrice(totalRevenue)} />
          <StatCard icon={ShoppingBag} color="blue" label="Total Orders" value={orders.length.toString()} />
          <StatCard icon={TrendingUp} color="purple" label="Store Status" value="Online" />
        </div>

        {/* Orders Table */}
        <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="p-10 border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <CardTitle className="font-headline text-3xl">Live Orders</CardTitle>
                <CardDescription>Real-time transaction monitoring</CardDescription>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search order or customer..." 
                  className="pl-10 h-12 rounded-full border-2 focus-visible:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-32 text-center text-muted-foreground flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin" />
                Synchronizing with cloud...
              </div>
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
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-20 text-muted-foreground">No orders found.</TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
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
                      ))
                    )}
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
