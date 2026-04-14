'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingBag, LogOut, IndianRupee, TrendingUp, Search, ShieldAlert, Loader2, Eye, Plus, PackageOpen, DownloadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useFirestore, useUser, useAuth, useDoc, useMemoFirebase, useFirebase } from "@/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { OrdersService } from "@/services/orders.service";
import { ProductsService } from "@/services/products.service";
import { Order, OrderStatus } from "@/types/order";
import { Product } from "@/types/product";
import { formatPrice } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { PRODUCTS } from "@/lib/data"; // Import the static products to seed
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [seeding, setSeeding] = useState(false);
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '', price: 0, image: '', category: 'Customized Gifts', description: '', featured: false, stockCount: 10
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const adminDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [firestore, user]);

  const { data: adminRole, isLoading: isAdminCheckLoading } = useDoc(adminDocRef);

  const fetchProducts = async () => {
    if (!firestore) return;
    const svc = new ProductsService(firestore);
    const data = await svc.getAllProducts();
    setProducts(data);
  };

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

    fetchProducts();

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

  const handleSeedProducts = async () => {
    if (!firestore) return;
    setSeeding(true);
    const svc = new ProductsService(firestore);
    let count = 0;
    try {
      for (const item of PRODUCTS) {
        // @ts-ignore
        const { id, ...rest } = item; 
        await svc.createProduct(rest as any);
        count++;
      }
      toast({ title: "Success", description: `Added ${count} base products to the database.` });
      fetchProducts();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
    setSeeding(false);
  };

  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({ ...product, images: product.images || (product.image ? [product.image] : []) });
    } else {
      setEditingProduct(null);
      setProductForm({ name: '', price: 0, image: '', images: [], videoUrl: '', category: 'Customized Gifts', description: '', featured: false, stockCount: 10 });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!firestore) return;
    const svc = new ProductsService(firestore);
    try {
      if (editingProduct) {
        await svc.updateProduct(editingProduct.id, productForm);
        toast({ title: "Updated", description: "Product updated successfully." });
      } else {
        await svc.createProduct(productForm as any);
        toast({ title: "Created", description: "Product added successfully." });
      }
      setIsProductModalOpen(false);
      fetchProducts();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!firestore) return;
    const svc = new ProductsService(firestore);
    try {
      await svc.deleteProduct(id);
      toast({ title: "Deleted", description: "Product deleted successfully." });
      fetchProducts();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const { firebaseApp } = useFirebase();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      toast({ title: "Uploading...", description: `Uploading ${files.length} images...` });
      const storage = getStorage(firebaseApp);
      
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        newUrls.push(url);
      }
      
      setProductForm(prev => {
        const existingImages = prev.images || (prev.image ? [prev.image] : []);
        const combined = [...existingImages, ...newUrls];
        return { ...prev, image: combined[0] || prev.image, images: combined };
      });
      
      toast({ title: "Success", description: "Images attached successfully!" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: error.message });
    }
  };

  if (!isMounted || isUserLoading || isAdminCheckLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent/5">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const isSuperAdmin = user?.uid === '30S6HkIJXKWWSrmlLD8c8GBskst1';

  if (user && !adminRole && !isSuperAdmin) {
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

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0);

  return (
    <div className="bg-background min-h-screen pt-40 pb-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-primary rounded-[2rem] flex items-center justify-center text-primary-foreground shadow-2xl">
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
          <StatCard icon={PackageOpen} color="purple" label="Active Inventory" value={products.length.toString()} />
        </div>

        <Tabs defaultValue="inventory" className="w-full space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-4 rounded-3xl shadow-sm border border-border/40">
            <TabsList className="flex gap-2 rounded-2xl h-14 bg-transparent p-0 w-full md:w-auto">
              <TabsTrigger value="inventory" className="rounded-xl px-6 h-full font-bold uppercase tracking-widest text-[10px] border-2 border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all">
                Inventory Manager
              </TabsTrigger>
              <TabsTrigger value="orders" className="rounded-xl px-6 h-full font-bold uppercase tracking-widest text-[10px] border-2 border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all">
                Live Orders
              </TabsTrigger>
            </TabsList>
            
            <div className="relative w-full md:w-96">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                placeholder="Search across portal..." 
                className="w-full pl-12 h-14 rounded-full border-none bg-secondary/50 focus:ring-2 focus:ring-primary outline-none px-6 text-sm font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value="inventory">
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-card/50 backdrop-blur-sm">
              <CardHeader className="p-10 border-b flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-headline text-4xl text-foreground">Active Products</CardTitle>
                  <CardDescription className="text-lg mt-2">Manage your storefront items directly</CardDescription>
                </div>
                <div className="flex gap-4">
                  {products.length === 0 && (
                    <Button variant="secondary" onClick={handleSeedProducts} disabled={seeding} className="h-14 px-8 rounded-full font-bold">
                       {seeding ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <DownloadCloud className="w-5 h-5 mr-2" />}
                       Seed Base Products
                    </Button>
                  )}
                  <Button onClick={() => handleOpenProductModal()} className="h-14 px-8 rounded-full font-bold shadow-xl shadow-primary/20">
                    <Plus className="w-5 h-5 mr-2" /> Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-accent/5 focus:outline-none">
                    <TableRow>
                      <TableHead className="pl-10 font-bold py-6 text-xs uppercase tracking-widest">Item</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-widest">Category</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-widest">Price</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-widest">Stock</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-widest">Status</TableHead>
                      <TableHead className="pr-10 text-right font-bold text-xs uppercase tracking-widest">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                          {products.length === 0 ? "No inventory found. Click 'Seed Base Products' to import your existing catalog." : "No products match your search."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map(p => (
                        <TableRow key={p.id} className="hover:bg-accent/5 transition-colors">
                          <TableCell className="pl-10">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-secondary overflow-hidden relative">
                                {p.image ? (
                                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <PackageOpen className="w-6 h-6 text-muted-foreground/50" />
                                  </div>
                                )}
                              </div>
                              <span className="font-bold text-lg">{p.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground font-medium">{p.category}</TableCell>
                          <TableCell className="font-bold text-lg text-primary font-sans">{formatPrice(p.price)}</TableCell>
                          <TableCell>
                            {p.stockCount !== undefined ? (
                              p.stockCount > 0 ? (
                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 font-bold">{p.stockCount} left</Badge>
                              ) : (
                                <Badge variant="destructive" className="font-bold">Sold Out</Badge>
                              )
                            ) : (
                              <Badge variant="outline" className="font-bold text-muted-foreground">Unlimited</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={p.featured ? "default" : "secondary"} className="rounded-full">
                              {p.featured ? "Featured" : "Standard"}
                            </Badge>
                          </TableCell>
                          <TableCell className="pr-10 text-right">
                            <Button onClick={() => handleOpenProductModal(p)} variant="ghost" className="rounded-full font-bold text-primary hover:bg-primary/10">Edit</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
              <DialogContent className="max-w-xl rounded-[2rem] p-8 border-none shadow-2xl">
                <DialogHeader className="mb-6">
                  <DialogTitle className="font-headline text-3xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                  <DialogDescription>Modify specific fields to update your live storefront catalog.</DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Product Name</Label>
                      <Input
                        value={productForm.name || ''}
                        onChange={e => setProductForm({...productForm, name: e.target.value})}
                        className="rounded-xl h-12 bg-secondary/50 focus-visible:ring-primary border-none font-bold"
                        placeholder="E.g. LED Panda Frame"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Stock</Label>
                      <Input
                        type="number"
                        value={productForm.stockCount?.toString() ?? ''}
                        onChange={e => setProductForm({...productForm, stockCount: parseInt(e.target.value) || 0})}
                        className="rounded-xl h-12 bg-secondary/50 focus-visible:ring-primary border-none font-bold font-sans"
                        placeholder="10"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Price (INR)</Label>
                      <Input
                        type="number"
                        value={productForm.price?.toString() || ''}
                        onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value) || 0})}
                        className="rounded-xl h-12 bg-secondary/50 focus-visible:ring-primary border-none font-bold font-sans"
                        placeholder="250"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category</Label>
                      <Select value={productForm.category || 'Customized Gifts'} onValueChange={v => setProductForm({...productForm, category: v as any})}>
                        <SelectTrigger className="rounded-xl h-12 bg-secondary/50 focus-visible:ring-primary border-none font-bold shadow-none">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[1.5rem] p-2 shadow-xl border-none bg-card">
                          <SelectItem value="Customized Gifts" className="rounded-lg h-10 px-4">Customized Gifts</SelectItem>
                          <SelectItem value="Light Lamps" className="rounded-lg h-10 px-4">Light Lamps</SelectItem>
                          <SelectItem value="Cute Toys" className="rounded-lg h-10 px-4">Cute Toys</SelectItem>
                          <SelectItem value="Photography" className="rounded-lg h-10 px-4">Photography</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Product Display Images (Up to 5)</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {/* Existing Uploaded Images */}
                      {productForm.images?.map((imgUrl, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group bg-secondary/10">
                          <img src={imgUrl} className="w-full h-full object-cover" />
                          {i === 0 && (
                             <Badge className="absolute bottom-2 left-2 text-[8px] px-1.5 h-4 border-none bg-primary text-primary-foreground pointer-events-none">Cover</Badge>
                          )}
                          <button 
                            onClick={() => {
                               const newImages = productForm.images!.filter((_, index) => index !== i);
                               setProductForm({...productForm, images: newImages, image: newImages[0] || ''});
                            }}
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                             <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      {/* Upload Button */}
                      {(!productForm.images || productForm.images.length < 5) && (
                        <div className="relative flex flex-col items-center justify-center w-full aspect-square rounded-xl border-2 border-dashed border-primary/20 bg-secondary/20 hover:bg-secondary/40 transition-colors cursor-pointer group">
                          <input 
                            type="file" 
                            accept="image/*" 
                            multiple
                            onChange={handleImageUpload} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                          />
                          <DownloadCloud className="h-6 w-6 mb-2 text-primary/50 group-hover:text-primary transition-colors" />
                          <p className="text-[10px] font-bold text-muted-foreground text-center px-2">Add Images</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">YouTube / Video URL (Optional)</Label>
                    <Input
                      value={productForm.videoUrl || ''}
                      onChange={e => setProductForm({...productForm, videoUrl: e.target.value})}
                      className="rounded-xl h-12 bg-secondary/50 focus-visible:ring-primary border-none font-sans"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</Label>
                    <Textarea
                      value={productForm.description || ''}
                      onChange={e => setProductForm({...productForm, description: e.target.value})}
                      className="rounded-xl bg-secondary/50 focus-visible:ring-primary border-none resize-none"
                      rows={3}
                      placeholder="Detailed product info..."
                    />
                  </div>

                  <div className="flex items-center space-x-3 pt-2">
                    <Checkbox
                      id="featured"
                      checked={productForm.featured}
                      onCheckedChange={c => setProductForm({...productForm, featured: !!c})}
                      className="rounded-md w-5 h-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label htmlFor="featured" className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Feature on Home Page Carousel
                    </label>
                  </div>
                </div>
                <DialogFooter className="mt-8 flex justify-between sm:justify-between w-full">
                  {editingProduct ? (
                    <Button variant="destructive" onClick={() => handleDeleteProduct(editingProduct.id)} className="rounded-full font-bold px-8 h-12">Delete</Button>
                  ) : <div />}
                  <Button onClick={handleSaveProduct} className="rounded-full font-bold px-8 h-12 shadow-lg shadow-primary/20">Save Product</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-card/50 backdrop-blur-sm">
              <CardHeader className="p-10 border-b">
                <CardTitle className="font-headline text-4xl text-foreground">Live Transactions</CardTitle>
                <CardDescription className="text-lg">Real-time order tracking and fulfillment</CardDescription>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, color, label, value }: { icon: any, color: string, label: string, value: string }) {
  const colors: any = {
    green: "bg-green-100 text-green-700 shadow-green-100 dark:bg-green-500/10 dark:text-green-400 dark:shadow-none",
    blue: "bg-blue-100 text-blue-700 shadow-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:shadow-none",
    purple: "bg-purple-100 text-purple-700 shadow-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:shadow-none"
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
    case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400';
    case 'processing': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
    case 'shipped': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400';
    case 'delivered': return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400';
    case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400';
    default: return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400';
  }
}