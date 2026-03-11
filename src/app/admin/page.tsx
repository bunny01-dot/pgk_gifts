'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingBag, LogOut, IndianRupee, TrendingUp, Search, ShieldAlert, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore, useUser, useAuth, useDoc, useMemoFirebase } from "@/firebase";
import { OrdersService } from "@/services/orders.service";
import { Order, OrderStatus } from "@/types/order";
import { formatPrice } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const adminDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [firestore, user]);

  const { data: adminRole, isLoading: isAdminCheckLoading } = useDoc(adminDocRef);

  useEffect(() => {
    if (isUserLoading || isAdminCheckLoading || !isMounted) return;

    if (!user) {
      router.push('/login?redirect=/admin');
      return;
    }

    const ordersService = new OrdersService(firestore);
    const unsubscribe = ordersService.subscribeToOrders((data) => {
      setOrders(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isUserLoading, isAdminCheckLoading, firestore, router, isMounted]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const ordersService = new OrdersService(firestore);
    await ordersService.updateOrderStatus(orderId, status);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (!isMounted || isUserLoading || isAdminCheckLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent/5">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (user && !adminRole) {
    return (
      <div className="min-h-screen bg-accent/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-10 shadow-2xl rounded-[3rem] border-none text-center">
          <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={40} />
          </div>
          <h1 className="text-3xl font-headline font-bold mb-4 text-foreground">Access Denied</h1>
          <p className="text-muted-foreground mb-8">
            Authenticated as <span className="font-bold text-foreground">{user.email}</span>. No admin role assigned.
          </p>
          <div className="space-y-4">
            <Button asChild className="w-full h-14 rounded-full font-bold">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button variant="outline" onClick={handleLogout} className="w-full h-14 rounded-full font-bold border-2">
              Logout
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const filteredOrders = orders.filter(o => 
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.orderId && o.orderId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0);

  return (
    <div className="bg-background min-h-screen pt-40 pb-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-primary rounded-[2rem] flex items-center justify-center text-white shadow-2xl">
              <LayoutDashboard className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-5xl font-headline font-bold leading-none text-foreground">Management</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.4em] font-bold mt-2">Authenticated: {user?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="lg" className="rounded-full border-2 h-16 px-10 font-bold" onClick={handleLogout}>
            <LogOut className="w-5 h-5 mr-3" /> Logout
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <StatCard icon={IndianRupee} color="green" label="Net Revenue" value={formatPrice(totalRevenue)} />
          <StatCard icon={ShoppingBag} color="blue" label="Total Orders" value={orders.length.toString()} />
          <StatCard icon={TrendingUp} color="purple" label="Store Status" value="Active" />
        </div>

        {/* Orders Table */}
        <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="p-10 border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <CardTitle className="font-headline text-4xl text-foreground">Live Transactions</CardTitle>
                <CardDescription className="text-lg">Real-time order tracking and fulfillment</CardDescription>
              </div>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  placeholder="Filter by customer or ID..." 
                  className="w-full pl-12 h-16 rounded-full border-2 bg-background focus:ring-2 focus:ring-primary outline-none px-6 text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-32 text-center text-muted-foreground flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                Synchronizing with cloud...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-accent/5">
                    <TableRow>
                      <TableHead className="pl-10 font-bold py-8 text-xs uppercase tracking-widest">ID</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-widest">Customer</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-widest">Details</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-widest">Revenue</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-widest">Status</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-widest">Timeline</TableHead>
                      <TableHead className="pr-10 text-right font-bold text-xs uppercase tracking-widest">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-24 text-muted-foreground text-xl">No transactions found.</TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-accent/5 transition-colors group">
                          <TableCell className="pl-10 font-mono text-xs font-bold text-primary">#{order.orderId || order.id.slice(0, 6)}</TableCell>
                          <TableCell>
                            <div className="font-bold text-lg text-foreground">{order.customerName}</div>
                            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{order.phone}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs max-w-[250px] truncate font-medium text-muted-foreground">
                              {order.items?.map(i => `${i.name} (x${i.quantity})`).join(', ') || 'No items'}
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-xl text-foreground">{formatPrice(order.total)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`rounded-full px-4 py-1.5 font-bold border-none ${getStatusColor(order.status)}`}>
                              {order.status?.toUpperCase() || 'PENDING'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-bold text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </TableCell>
                          <TableCell className="pr-10 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <Button asChild variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                                <Link href={`/order/${order.id}`}>
                                  <Eye className="w-5 h-5 text-primary" />
                                </Link>
                              </Button>
                              <Select defaultValue={order.status} onValueChange={(v) => updateStatus(order.id, v as OrderStatus)}>
                                <SelectTrigger className="w-[160px] rounded-full border-2 h-12 font-bold shadow-soft">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-[1.5rem] p-2 shadow-2xl">
                                  <SelectItem value="pending" className="rounded-xl h-10 px-4">Pending</SelectItem>
                                  <SelectItem value="processing" className="rounded-xl h-10 px-4">Processing</SelectItem>
                                  <SelectItem value="shipped" className="rounded-xl h-10 px-4">Shipped</SelectItem>
                                  <SelectItem value="delivered" className="rounded-xl h-10 px-4">Delivered</SelectItem>
                                  <SelectItem value="cancelled" className="rounded-xl h-10 px-4 text-destructive">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
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
    green: "bg-green-100 text-green-600 shadow-green-100",
    blue: "bg-blue-100 text-blue-600 shadow-blue-100",
    purple: "bg-purple-100 text-purple-600 shadow-purple-100"
  };
  return (
    <Card className="rounded-[3rem] border-none shadow-soft bg-card p-10 transition-all hover:scale-[1.03] hover:shadow-2xl">
      <div className="flex items-center gap-8">
        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl ${colors[color]}`}>
          <Icon className="w-10 h-10" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.3em]">{label}</p>
          <h2 className="text-5xl font-headline font-bold mt-2 text-foreground">{value}</h2>
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
