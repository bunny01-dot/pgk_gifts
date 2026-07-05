'use client';

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutDashboard, ShoppingBag, LogOut, IndianRupee, TrendingUp, Search, ShieldAlert, Loader2, Eye, Plus, PackageOpen, DownloadCloud, X, Bell, BellRing, AlertCircle, MessageSquare, CloudDownload, Globe, ShieldCheck, Star, Settings, LayoutGrid, List } from "lucide-react";
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
import { formatDate, toDate } from "@/utils/date";
import { doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { PRODUCTS, ADMIN_EMAILS } from "@/lib/data"; // Import the static products to seed
import { useToast } from "@/hooks/use-toast";

import { useNotifications } from "@/hooks/use-notifications";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewOrderId = searchParams.get('viewOrder');
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  const { requestPermission, permission } = useNotifications();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [seeding, setSeeding] = useState(false);
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '', price: 0, image: '', category: 'Personalized Gifts', description: '', active: true, featured: false, stockCount: 10, requiredPhotoSlots: null, needsMainImage: false, deliveryCharge: 'regular'
  });
  const [viewingOrderForReturn, setViewingOrderForReturn] = useState<Order | null>(null);
  const [viewingOrderDetails, setViewingOrderDetails] = useState<Order | null>(null);

  // Razorpay unverified orders state
  const [razorpayOrders, setRazorpayOrders] = useState<any[]>([]);
  const [loadingRazorpayOrders, setLoadingRazorpayOrders] = useState(false);
  const [selectedRzpOrder, setSelectedRzpOrder] = useState<any | null>(null);
  const [manualPaymentId, setManualPaymentId] = useState("");
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyingOrder, setVerifyingOrder] = useState(false);

  // Shipping details state
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);
  const [shippingCourierName, setShippingCourierName] = useState("");
  const [customCourierName, setCustomCourierName] = useState("");
  const [shippingTrackingNumber, setShippingTrackingNumber] = useState("");
  const [shippingTrackingUrl, setShippingTrackingUrl] = useState("");

  // Global settings state
  const [adminGiftWrapPrice, setAdminGiftWrapPrice] = useState(50);
  const [savingSettings, setSavingSettings] = useState(false);

  // Notification Center state
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  
  // Inventory view mode state (grid vs list/table)
  const [inventoryView, setInventoryView] = useState<'grid' | 'list'>('grid');
  
  // Custom categories state
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Dynamic categories list (extracting from database products + defaults)
  const categoriesList = useMemo(() => {
    const defaultCats = [
      "Night Lamps",
      "MDF Wall Frames",
      "Wall Decor and Photo Frames",
      "Personalized Gifts",
      "Keychains",
      "Unique Gifts",
      "Car Dashboard Accessories",
      "Hamper Boxes",
      "Cute Toys",
      "Customized Gifts"
    ];
    const dbCats = products.map(p => p.category).filter(Boolean);
    const combined = Array.from(new Set([...defaultCats, ...customCategories, ...dbCats]));
    return combined.sort();
  }, [products, customCategories]);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_inventory_view');
      if (saved === 'grid' || saved === 'list') {
        setInventoryView(saved);
      }
    }
  }, []);

  const handleSetInventoryView = (view: 'grid' | 'list') => {
    setInventoryView(view);
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_inventory_view', view);
    }
  };

  // Load global settings
  useEffect(() => {
    if (!firestore) return;
    const fetchGlobalSettings = async () => {
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const docRef = doc(firestore, "settings", "global");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (typeof data.giftWrapPrice === 'number') {
            setAdminGiftWrapPrice(data.giftWrapPrice);
          }
          if (Array.isArray(data.customCategories)) {
            setCustomCategories(data.customCategories);
          }
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };
    fetchGlobalSettings();
  }, [firestore]);

  const handleSaveSettings = async () => {
    if (!firestore) return;
    setSavingSettings(true);
    try {
      const { doc, setDoc } = await import("firebase/firestore");
      const docRef = doc(firestore, "settings", "global");
      await setDoc(docRef, { giftWrapPrice: adminGiftWrapPrice }, { merge: true });
      toast({
        title: "Settings Saved",
        description: `Premium Gift Wrap price updated to ₹${adminGiftWrapPrice}.`
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error Saving Settings",
        description: e.message
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !newCategoryName.trim()) return;
    setIsSavingCategory(true);
    try {
      const cleanName = newCategoryName.trim();
      if (categoriesList.includes(cleanName)) {
        toast({
          variant: "destructive",
          title: "Category Exists",
          description: `"${cleanName}" is already in the categories list.`
        });
        setIsSavingCategory(false);
        return;
      }

      const updatedCustom = [...customCategories, cleanName];
      const { doc, setDoc } = await import("firebase/firestore");
      const docRef = doc(firestore, "settings", "global");
      await setDoc(docRef, { customCategories: updatedCustom }, { merge: true });
      
      setCustomCategories(updatedCustom);
      setNewCategoryName("");
      setIsAddCategoryOpen(false);
      
      toast({
        title: "Category Added",
        description: `Successfully added category "${cleanName}".`
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message
      });
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Load and save read notification IDs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_read_notifications');
      if (saved) {
        try {
          setReadNotificationIds(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const markAsRead = (id: string) => {
    setReadNotificationIds(prev => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      localStorage.setItem('admin_read_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const notifications = useMemo(() => {
    const list: any[] = [];
    orders.forEach(order => {
      const orderIdShort = order.orderId || order.id.slice(0, 6);
      const orderDate = toDate(order.createdAt);
      
      list.push({
        id: `new_order_${order.id}`,
        type: 'new_order',
        title: 'New Order Placed',
        description: `Order #${orderIdShort} placed by ${order.customerName} for ${formatPrice(order.total)}.`,
        timestamp: orderDate,
        orderId: order.id,
        order: order,
        read: readNotificationIds.includes(`new_order_${order.id}`)
      });

      if (order.feedback) {
        const feedbackDate = new Date(order.feedback.createdAt);
        list.push({
          id: `feedback_${order.id}`,
          type: 'feedback',
          title: 'New Feedback Received',
          description: `${order.feedback.rating} ★ review by ${order.customerName} on #${orderIdShort}: "${order.feedback.comment.slice(0, 40)}${order.feedback.comment.length > 40 ? '...' : ''}"`,
          timestamp: feedbackDate,
          orderId: order.id,
          order: order,
          read: readNotificationIds.includes(`feedback_${order.id}`)
        });
      }

      if (order.returnRequest) {
        const returnDate = toDate(order.returnRequest.createdAt);
        list.push({
          id: `return_${order.id}`,
          type: 'return_request',
          title: 'Return Request Submitted',
          description: `Return (${order.returnRequest.status}) requested by ${order.customerName} for #${orderIdShort}.`,
          timestamp: returnDate,
          orderId: order.id,
          order: order,
          read: readNotificationIds.includes(`return_${order.id}`)
        });
      }
    });

    return list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [orders, readNotificationIds]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotificationIds(allIds);
    localStorage.setItem('admin_read_notifications', JSON.stringify(allIds));
  };

  const adminDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [firestore, user]);

  const { data: adminRole, isLoading: isAdminCheckLoading } = useDoc(adminDocRef);
  const isSuperAdmin = user?.uid === '30S6HkIJXKWWSrmlLD8c8GBskst1';
  const isAdmin = Boolean(
    adminRole ||
    isSuperAdmin ||
    (user?.email && ADMIN_EMAILS.includes(user.email))
  );

  const fetchProducts = async () => {
    if (!firestore) return;
    const svc = new ProductsService(firestore);
    const data = await svc.getAllProducts();
    setProducts(data);
  };

  useEffect(() => {
    if (viewOrderId && orders.length > 0) {
      const matched = orders.find(o => o.id === viewOrderId);
      if (matched) {
        setViewingOrderDetails(matched);
      }
    }
  }, [viewOrderId, orders]);

  useEffect(() => {
    if (isUserLoading || isAdminCheckLoading || !isMounted) return;

    if (!user) {
      router.push('/login?redirect=/admin');
      return;
    }

    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You do not have administrative privileges."
      });
      router.push("/");
      return;
    }

    const ordersService = new OrdersService(firestore);
    const unsubscribe = ordersService.subscribeToOrders((data) => {
      setOrders((prev) => {
        // Only trigger alerts if this is not the initial load and new orders were added
        if (prev.length > 0 && data.length > prev.length) {
          const newOrders = data.filter(o => !prev.some(p => p.id === o.id));
          newOrders.forEach(o => {
            // Synthesize pleasant double-chime sound using Web Audio API (zero external assets needed)
            try {
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
              
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.type = 'sine';
              osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
              gain.gain.setValueAtTime(0.1, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
              osc.start(ctx.currentTime);
              osc.stop(ctx.currentTime + 0.6);

              const osc2 = ctx.createOscillator();
              const gain2 = ctx.createGain();
              osc2.connect(gain2);
              gain2.connect(ctx.destination);
              osc2.type = 'sine';
              osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5 (harmonious harmony)
              gain2.gain.setValueAtTime(0, ctx.currentTime);
              gain2.gain.setValueAtTime(0.1, ctx.currentTime + 0.15);
              gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.75);
              osc2.start(ctx.currentTime + 0.15);
              osc2.stop(ctx.currentTime + 0.75);
            } catch (e) {
              console.error("Audio chime failed to play:", e);
            }

            // Real-time Toast Alert in Dashboard
            toast({
              title: "🆕 New Order Received!",
              description: `Order #${o.orderId || o.id.slice(0, 6)} placed by ${o.customerName} for ${formatPrice(o.total)}.`,
              variant: "default",
            });

            // Browser Desktop Notification
            if (Notification.permission === 'granted') {
              new Notification("New Order Placed!", {
                body: `${o.customerName} ordered items totaling ${formatPrice(o.total)}.`,
                icon: "/logo.png"
              });
            }
          });
        }
        return data;
      });
      setLoading(false);
    });

    fetchProducts();
    fetchRazorpayOrders();

    return () => unsubscribe();
  }, [user, isUserLoading, isAdminCheckLoading, firestore, router, isMounted, isAdmin, toast]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const ordersService = new OrdersService(firestore);
    await ordersService.updateOrderStatus(orderId, status);
  };

  const fetchRazorpayOrders = async () => {
    if (!user) return;
    setLoadingRazorpayOrders(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/admin/razorpay-orders', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setRazorpayOrders(data.orders || []);
      } else {
        console.error("Failed to fetch Razorpay orders:", data.error);
      }
    } catch (err) {
      console.error("Error fetching Razorpay orders:", err);
    } finally {
      setLoadingRazorpayOrders(false);
    }
  };

  const handleForceCreateOrder = async () => {
    if (!user || !selectedRzpOrder) return;
    setVerifyingOrder(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/admin/force-create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          razorpayOrderId: selectedRzpOrder.razorpayOrderId,
          paymentId: manualPaymentId.trim() || undefined
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({
          title: "Order Created!",
          description: `Order successfully converted. Main Order ID: ${data.orderId}`,
        });
        setIsVerifyModalOpen(false);
        setManualPaymentId("");
        setSelectedRzpOrder(null);
        fetchRazorpayOrders();
      } else {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: data.error || "Could not verify payment.",
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "An unexpected error occurred.",
      });
    } finally {
      setVerifyingOrder(false);
    }
  };

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    if (status === 'shipped') {
      setShippingOrderId(orderId);
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const isStandardCourier = ['dtdc', 'delhivery', 'blue dart', 'india post', 'professional couriers'].includes(order.courierName?.toLowerCase() || "");
        setShippingCourierName(order.courierName ? (isStandardCourier ? order.courierName : 'Other') : 'DTDC');
        setCustomCourierName(order.courierName && !isStandardCourier ? order.courierName : "");
        setShippingTrackingNumber(order.trackingNumber || "");
        setShippingTrackingUrl(order.trackingUrl || "");
      } else {
        setShippingCourierName('DTDC');
        setCustomCourierName("");
        setShippingTrackingNumber("");
        setShippingTrackingUrl("");
      }
      setIsShippingModalOpen(true);
    } else {
      updateStatus(orderId, status);
    }
  };

  const getAutoTrackingUrl = (courier: string, trackingNumber: string): string => {
    if (!trackingNumber) return "";
    const cleanNum = trackingNumber.trim();
    switch (courier?.toLowerCase()) {
      case 'dtdc':
        return `https://www.dtdc.in/tracking/tracking_results.asp?cttcval=${cleanNum}`;
      case 'delhivery':
        return `https://www.delhivery.com/track/package/${cleanNum}`;
      case 'blue dart':
        return `https://www.bluedart.com/tracking?trackNo=${cleanNum}`;
      case 'india post':
        return `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?consignNo=${cleanNum}`;
      case 'professional couriers':
        return `https://tpcglobe.com/`;
      case 'st courier':
        return `https://stcourier.com/track/shipment`;
      case 'franch express':
        return `https://franchexpress.com/courier-tracking/`;
      default:
        return "";
    }
  };

  const downloadAllPhotos = async (order: Order) => {
    const urls: string[] = [];
    order.items?.forEach((item: any) => {
      if (item.customPhotos && Array.isArray(item.customPhotos)) {
        item.customPhotos.forEach((photo: any) => {
          if (photo.imageUrl) {
            urls.push(photo.imageUrl);
          }
        });
      }
    });

    if (urls.length === 0) {
      toast({
        title: "No Photos Found",
        description: "This order does not contain any customized photo uploads.",
        variant: "destructive",
      });
      return;
    }

    if (urls.length === 1) {
      toast({
        title: "Downloading Photo",
        description: "Fetching and saving your photo...",
      });
      try {
        const response = await fetch(`/api/admin/proxy-image?url=${encodeURIComponent(urls[0]!)}`);
        if (!response.ok) throw new Error("Network response was not ok");
        const blob = await response.blob();
        
        let ext = "jpg";
        const contentType = response.headers.get("content-type");
        if (contentType) {
          const matched = contentType.match(/\/([a-zA-Z0-9]+)/);
          if (matched && matched[1]) ext = matched[1];
        }
        
        const cleanCustomerName = order.customerName ? order.customerName.replace(/[^a-zA-Z0-9]/g, "_") : "customer";
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `order_${order.orderId || order.id}_${cleanCustomerName}_photo_1.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } catch (err: any) {
        console.error("Failed to download photo:", err);
        window.open(urls[0]!, "_blank");
      }
      return;
    }

    toast({
      title: "Creating ZIP Archive",
      description: `Fetching ${urls.length} photos and packaging them...`,
    });

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      const fetchPromises = urls.map(async (url, index) => {
        const response = await fetch(`/api/admin/proxy-image?url=${encodeURIComponent(url)}`);
        if (!response.ok) throw new Error(`Failed to fetch photo ${index + 1}`);
        const blob = await response.blob();
        
        let ext = "jpg";
        const contentType = response.headers.get("content-type");
        if (contentType) {
          const matched = contentType.match(/\/([a-zA-Z0-9]+)/);
          if (matched && matched[1]) ext = matched[1];
        }
        
        const filename = `photo_${index + 1}.${ext}`;
        zip.file(filename, blob);
      });

      await Promise.all(fetchPromises);

      const content = await zip.generateAsync({ type: "blob" });
      const blobUrl = URL.createObjectURL(content);

      const cleanCustomerName = order.customerName ? order.customerName.replace(/[^a-zA-Z0-9]/g, "_") : "customer";
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `order_${order.orderId || order.id}_${cleanCustomerName}_photos.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      toast({
        title: "Download Complete",
        description: `Successfully packaged and saved ${urls.length} photos.`,
      });
    } catch (err: any) {
      console.error("Failed to generate ZIP archive:", err);
      toast({
        title: "ZIP Generation Failed",
        description: "Failed to package photos. Opening them in separate tabs instead.",
        variant: "destructive",
      });

      urls.forEach((url) => {
        window.open(url, "_blank");
      });
    }
  };

  const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#64748b'];

  const dailySalesData = useMemo(() => {
    const dailyMap: Record<string, { date: string; sales: number; count: number }> = {};
    
    // Last 7 days initialized
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyMap[dateStr] = { date: dateStr, sales: 0, count: 0 };
    }

    orders.forEach(order => {
      if (order.paymentStatus === 'paid' && order.createdAt) {
        const orderDate = toDate(order.createdAt);
        if (orderDate) {
          const dateStr = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (dailyMap[dateStr]) {
            dailyMap[dateStr].sales += order.total;
            dailyMap[dateStr].count += 1;
          }
        }
      }
    });

    return Object.values(dailyMap);
  }, [orders]);

  const categoryData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    orders.forEach(order => {
      if (order.paymentStatus === 'paid') {
        order.items?.forEach(item => {
          const cat = item.category || 'Other';
          categoryMap[cat] = (categoryMap[cat] || 0) + (item.quantity || 1);
        });
      }
    });
    return Object.keys(categoryMap).map(name => ({
      name,
      value: categoryMap[name]
    }));
  }, [orders]);

  const handleSaveShippingDetails = async () => {
    if (!shippingOrderId || !firestore) return;
    const finalCourier = shippingCourierName === 'Other' ? customCourierName : shippingCourierName;
    const ordersService = new OrdersService(firestore);
    
    await ordersService.updateOrderStatus(shippingOrderId, 'shipped', {
      courierName: finalCourier,
      trackingNumber: shippingTrackingNumber,
      trackingUrl: shippingTrackingUrl
    });
    
    setIsShippingModalOpen(false);
    setShippingOrderId(null);
    setShippingCourierName("");
    setCustomCourierName("");
    setShippingTrackingNumber("");
    setShippingTrackingUrl("");
    
    toast({
      title: "Order Dispatch Info Saved",
      description: "Order marked as Shipped and tracking details saved successfully."
    });
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
        // Check if product already exists to avoid duplicates
        const existing = products.find(p => p.name === item.name);
        if (existing) continue;

        // @ts-ignore
        const { id, ...rest } = item; 
        await svc.createProduct(rest as any);
        count++;
      }

      // Seed default coupons
      const defaultCoupons = [
        { code: "WELCOME10", type: "percentage", value: 10, minOrderAmount: 500, active: true, usageCount: 0 },
        { code: "PGK100", type: "flat", value: 100, minOrderAmount: 1000, active: true, usageCount: 0 },
        { code: "BUNNY15", type: "percentage", value: 15, minOrderAmount: 0, active: true, usageCount: 0 }
      ];
      const { collection, doc, setDoc, getDoc } = await import("firebase/firestore");
      let couponCount = 0;
      for (const coupon of defaultCoupons) {
        const docRef = doc(firestore, "coupons", coupon.code);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          await setDoc(docRef, coupon);
          couponCount++;
        }
      }

      toast({ 
        title: "Success", 
        description: `Synced ${count} new products and ${couponCount} default coupons to the database.` 
      });
      fetchProducts();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
    setSeeding(false);
  };

  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({ 
        ...product, 
        images: product.images || (product.image ? [product.image] : []),
        needsMainImage: product.needsMainImage ?? false,
        weight: product.weight ?? 1
      });
    } else {
      setEditingProduct(null);
      setProductForm({ name: '', price: 0, image: '', images: [], videoUrl: '', category: 'Customized Gifts', description: '', active: true, featured: false, stockCount: 10, requiredPhotoSlots: null, needsMainImage: false, deliveryCharge: 'regular', weight: 1 });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!firestore || !productForm.name) return;
    const svc = new ProductsService(firestore);
    try {
      toast({ title: "Securing Assets...", description: "Verifying image hosting..." });
      
      // Elite: Automatic migration of external URLs
      let finalImageUrl = productForm.image;
      if (finalImageUrl && !finalImageUrl.includes('firebasestorage') && finalImageUrl.startsWith('http')) {
        try {
          const ext = finalImageUrl.split('.').pop()?.split('?')[0] || 'png';
          finalImageUrl = await svc.downloadAndUpload(finalImageUrl, `products/${Date.now()}-${ext}`);
        } catch (e) {
          console.warn("Auto-migration failed", e);
        }
      }

      const cleanData = { ...productForm, image: finalImageUrl || '', active: productForm.active ?? true };

      if (editingProduct) {
        await svc.updateProduct(editingProduct.id, cleanData);
        toast({ title: "Updated", description: "Boutique collection updated." });
      } else {
        await svc.createProduct(cleanData as any);
        toast({ title: "Created", description: "New masterpiece added to catalog." });
      }
      setIsProductModalOpen(false);
      fetchProducts();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleRunMigration = async () => {
    if (!firestore) return;
    const svc = new ProductsService(firestore);
    try {
      toast({ title: "Migration Started", description: "Scanning for external assets..." });
      const count = await svc.migrateAllToFirebase((msg) => {
        toast({ title: "Migrating", description: msg });
      });
      toast({ title: "Migration Complete", description: `Secured ${count} images in Firebase Storage!` });
      fetchProducts();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Migration Failed", description: "Check console for CORS errors. Some hosts block direct downloads." });
    }
  };

  const handleSyncData = async () => {
    if (!firestore) return;
    const svc = new ProductsService(firestore);
    try {
      toast({ title: "Sync Started", description: "Connecting static library..." });
      const count = await svc.syncStaticProducts((msg) => {
        toast({ title: "Syncing", description: msg });
      });
      toast({ title: "Sync Complete", description: `Uploaded ${count} new items to Firestore!` });
      fetchProducts();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: e.message });
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
        if (!file) continue;
        const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
        try {
          const snapshot = await uploadBytes(storageRef, file);
          const url = await getDownloadURL(snapshot.ref);
          newUrls.push(url);
        } catch (uploadErr: any) {
          if (process.env.NODE_ENV !== 'production' && uploadErr.code === 'storage/quota-exceeded') {
            console.warn('Firebase Storage quota exceeded. Falling back to local URL for product image.');
            newUrls.push(URL.createObjectURL(file));
          } else {
            throw uploadErr;
          }
        }
      }
      
      setProductForm(prev => {
        const existingImages = prev.images || (prev.image ? [prev.image] : []);
        const combined = [...existingImages, ...newUrls];
        return { ...prev, image: combined[0] || prev.image || '', images: combined };
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

  if (user && !isAdmin) {
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
    <div className="bg-background min-h-screen pt-24 md:pt-40 pb-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-12 gap-5 md:gap-6">
          <div className="flex items-center gap-4 md:gap-5 min-w-0">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-2xl md:rounded-[2rem] flex items-center justify-center text-primary-foreground shadow-2xl shrink-0">
              <LayoutDashboard className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl md:text-5xl font-headline font-bold leading-none text-foreground">Management</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.25em] md:tracking-[0.4em] font-bold mt-2 truncate">Authenticated: {user?.email}</p>
            </div>
          </div>
          <div className="flex w-full md:w-auto gap-3 md:gap-4 items-center relative">
            <Button 
              variant={permission === 'granted' ? "default" : "outline"} 
              size="lg" 
              className={`flex-1 md:flex-none rounded-full border-2 h-12 md:h-16 px-4 md:px-8 text-xs md:text-sm font-bold transition-all ${permission === 'granted' ? 'bg-green-600 hover:bg-green-700 border-green-600 text-white' : ''}`}
              onClick={() => requestPermission()}
            >
              {permission === 'granted' ? (
                <><BellRing className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 animate-pulse" /> Alerts Active</>
              ) : (
                <><Bell className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" /> Enable Alerts</>
              )}
            </Button>
            <Button variant="outline" size="lg" className="flex-1 md:flex-none rounded-full border-2 h-12 md:h-16 px-4 md:px-10 text-xs md:text-sm font-bold" onClick={handleLogout}>
              <LogOut className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" /> Logout
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12">
          <StatCard icon={IndianRupee} color="green" label="Net Revenue" value={formatPrice(totalRevenue)} />
          <StatCard icon={ShoppingBag} color="blue" label="Total Orders" value={orders.length.toString()} />
          <StatCard icon={PackageOpen} color="purple" label="Active Inventory" value={products.length.toString()} />
        </div>

        <Tabs defaultValue="overview" className="w-full space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 bg-card p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-sm border border-border/40">
            <TabsList className="grid grid-cols-5 gap-2 rounded-2xl h-auto bg-transparent p-0 w-full md:w-auto md:flex">
              <TabsTrigger value="overview" className="rounded-xl px-2 md:px-6 h-11 md:h-14 font-bold uppercase tracking-wider md:tracking-widest text-[10px] md:text-sm border-2 border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all">
                Overview
              </TabsTrigger>
              <TabsTrigger value="inventory" className="rounded-xl px-2 md:px-6 h-11 md:h-14 font-bold uppercase tracking-wider md:tracking-widest text-[10px] md:text-sm border-2 border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all">
                Inventory
              </TabsTrigger>
              <TabsTrigger value="orders" className="rounded-xl px-2 md:px-6 h-11 md:h-14 font-bold uppercase tracking-wider md:tracking-widest text-[10px] md:text-sm border-2 border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all">
                Orders
              </TabsTrigger>
              <TabsTrigger value="stuck_payments" className="rounded-xl px-2 md:px-6 h-11 md:h-14 font-bold uppercase tracking-wider md:tracking-widest text-[10px] md:text-sm border-2 border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all text-center">
                Stuck Payments
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-xl px-2 md:px-6 h-11 md:h-14 font-bold uppercase tracking-wider md:tracking-widest text-[10px] md:text-sm border-2 border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all">
                Settings
              </TabsTrigger>
            </TabsList>
            
            <div className="relative w-full md:w-96">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                placeholder="Search across portal..." 
                className="w-full pl-12 h-14 rounded-full border-none bg-secondary/50 focus:ring-2 focus:ring-primary outline-none px-6 text-sm md:text-base font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value="overview" className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-card/50 backdrop-blur-md border border-border/40 p-6 rounded-3xl flex flex-col justify-between shadow-md">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Conversion Rate</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-headline font-bold text-foreground">3.2%</span>
                  <span className="text-xs text-green-500 font-bold font-sans">+0.4%</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Vs. last 7 days</p>
              </div>
              <div className="bg-card/50 backdrop-blur-md border border-border/40 p-6 rounded-3xl flex flex-col justify-between shadow-md">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Average Order Value</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-headline font-bold text-foreground">{formatPrice(orders.length ? totalRevenue / orders.filter(o => o.paymentStatus === 'paid').length || 1 : 0)}</span>
                  <span className="text-xs text-green-500 font-bold font-sans">+1.2%</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Per paid invoice</p>
              </div>
              <div className="bg-card/50 backdrop-blur-md border border-border/40 p-6 rounded-3xl flex flex-col justify-between shadow-md">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Pending Fulfillment</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-headline font-bold text-amber-500">{orders.filter(o => o.status === 'pending' || o.status === 'processing').length}</span>
                  <span className="text-xs text-amber-500 font-bold">Awaiting Action</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Needs packaging/shipping</p>
              </div>
              <div className="bg-card/50 backdrop-blur-md border border-border/40 p-6 rounded-3xl flex flex-col justify-between shadow-md">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Stuck Drafts</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-headline font-bold text-rose-500">{razorpayOrders.length}</span>
                  <span className="text-xs text-rose-500 font-bold">Recoverable</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Initialized checkout sessions</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <Card className="lg:col-span-2 border-none shadow-2xl rounded-[3rem] p-6 bg-card/45 backdrop-blur-md">
                <CardHeader className="px-4 pb-4">
                  <CardTitle className="font-headline text-2xl font-bold flex items-center justify-between">
                    <span>Revenue Trend (Last 7 Days)</span>
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80 w-full p-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailySalesData}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.3)" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => `Rs.${v}`} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        labelClassName="font-bold text-foreground"
                        formatter={(value) => [`Rs. ${value}`, 'Sales']}
                      />
                      <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-none shadow-2xl rounded-[3rem] p-6 bg-card/45 backdrop-blur-md">
                <CardHeader className="px-4 pb-4">
                  <CardTitle className="font-headline text-2xl font-bold">Category Shares</CardTitle>
                </CardHeader>
                <CardContent className="h-80 w-full p-0 flex flex-col justify-between">
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData.length ? categoryData : [{ name: 'None', value: 1 }]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, 'Quantity']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold px-4">
                    {categoryData.slice(0, 4).map((entry, idx) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                        <span className="truncate text-muted-foreground">{entry.name} ({entry.value})</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <Card className="border-none shadow-2xl rounded-3xl md:rounded-[3rem] overflow-hidden bg-card/50 backdrop-blur-sm">
              <CardHeader className="p-5 md:p-10 border-b flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                  <CardTitle className="font-headline text-3xl md:text-4xl text-foreground">Active Products</CardTitle>
                  <CardDescription className="text-sm md:text-lg mt-2">Manage your storefront items directly</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full md:w-auto">
                  {/* Grid/List Toggle */}
                  <div className="flex bg-secondary/85 p-1 rounded-full border border-border/40 shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleSetInventoryView('list')}
                      className={`h-9 w-9 rounded-full transition-all ${inventoryView === 'list' ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground hover:bg-transparent'}`}
                      title="List View"
                    >
                      <List className="w-4.5 h-4.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleSetInventoryView('grid')}
                      className={`h-9 w-9 rounded-full transition-all ${inventoryView === 'grid' ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground hover:bg-transparent'}`}
                      title="Grid View"
                    >
                      <LayoutGrid className="w-4.5 h-4.5" />
                    </Button>
                  </div>
                  <Button variant="secondary" onClick={handleSeedProducts} disabled={seeding} className="flex-1 md:flex-initial h-12 md:h-14 px-3 md:px-8 rounded-full text-xs md:text-sm font-bold">
                     {seeding ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <DownloadCloud className="w-5 h-5 mr-2" />}
                     {products.length === 0 ? "Seed Products" : "Sync Catalog"}
                  </Button>
                  <Button onClick={() => setIsAddCategoryOpen(true)} variant="outline" className="flex-1 md:flex-initial h-12 md:h-14 px-3 md:px-8 rounded-full text-xs md:text-sm font-bold border-2 shrink-0">
                    <Plus className="w-5 h-5 mr-2" /> Add Category
                  </Button>
                  <Button onClick={() => handleOpenProductModal()} className="flex-1 md:flex-initial h-12 md:h-14 px-3 md:px-8 rounded-full text-xs md:text-sm font-bold shadow-xl shadow-primary/20 shrink-0">
                    <Plus className="w-5 h-5 mr-2" /> Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-10">
                {inventoryView === 'grid' ? (
                  filteredProducts.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                      {products.length === 0 ? "No inventory found. Click 'Seed Products' to import your existing catalog." : "No products match your search."}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredProducts.map((p) => (
                        <div 
                          key={p.id} 
                          className="group relative bg-card rounded-[2rem] border border-border/60 overflow-hidden hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full cursor-pointer"
                          onClick={() => handleOpenProductModal(p)}
                        >
                          {/* Product Image Container */}
                          <div className="relative aspect-[4/3] w-full bg-secondary overflow-hidden">
                            {p.image ? (
                              <img 
                                src={p.image} 
                                alt={p.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <PackageOpen className="w-10 h-10 text-muted-foreground/30" />
                              </div>
                            )}
                            
                            {/* Badges overlaid on top of image */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                              <Badge variant={p.active === false ? "destructive" : "secondary"} className="rounded-full shadow-md backdrop-blur-md px-3 py-1 font-bold text-[10px] border-none">
                                {p.active === false ? "Hidden" : "Active"}
                              </Badge>
                              
                              {p.featured && (
                                <Badge className="rounded-full shadow-md bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 font-bold text-[10px] border-none">
                                  ★ Featured
                                </Badge>
                              )}
                            </div>

                            <div className="absolute top-4 right-4">
                              {p.stockCount !== undefined ? (
                                p.stockCount > 0 ? (
                                  <Badge className="rounded-full shadow-md bg-green-600 hover:bg-green-700 text-white px-3 py-1 font-bold text-[10px] border-none">
                                    {p.stockCount} left
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="rounded-full shadow-md px-3 py-1 font-bold text-[10px] border-none">
                                    Sold Out
                                  </Badge>
                                )
                              ) : (
                                <Badge className="rounded-full shadow-md bg-sky-600 hover:bg-sky-700 text-white px-3 py-1 font-bold text-[10px] border-none">
                                  Unlimited
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Product Info */}
                          <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                {p.category}
                              </p>
                              <h3 className="font-bold text-base text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                                {p.name}
                              </h3>
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
                              <span className="font-sans text-xl font-bold text-primary">
                                {formatPrice(p.price)}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="rounded-full font-bold text-primary hover:bg-primary/10 px-4 h-9"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenProductModal(p);
                                }}
                              >
                                Edit
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <>
                    <div className="md:hidden space-y-3">
                      {filteredProducts.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                          {products.length === 0 ? "No inventory found. Tap 'Seed Products' to import your catalog." : "No products match your search."}
                        </div>
                      ) : (
                        filteredProducts.map(p => (
                          <div key={p.id} className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                            <div className="flex gap-3">
                              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-secondary">
                                {p.image ? (
                                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-muted">
                                    <PackageOpen className="h-6 w-6 text-muted-foreground/50" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground">{p.name}</h3>
                                  <Badge variant={p.active === false ? "destructive" : "secondary"} className="shrink-0 rounded-full text-[10px]">
                                    {p.active === false ? "Hidden" : "Active"}
                                  </Badge>
                                </div>
                                <p className="mt-1 truncate text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{p.category}</p>
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                  <span className="font-sans text-base font-bold text-primary">{formatPrice(p.price)}</span>
                                  {p.stockCount !== undefined ? (
                                    p.stockCount > 0 ? (
                                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-[10px] font-bold">{p.stockCount} left</Badge>
                                    ) : (
                                      <Badge variant="destructive" className="text-[10px] font-bold">Sold Out</Badge>
                                    )
                                  ) : (
                                    <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground">Unlimited</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button onClick={() => handleOpenProductModal(p)} className="mt-4 h-11 w-full rounded-xl font-bold">
                              Edit Item
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="hidden md:block">
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
                                  <Badge variant={p.active === false ? "destructive" : "secondary"} className="rounded-full">
                                    {p.active === false ? "Hidden" : "Active"}
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
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
              <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl md:rounded-[2rem] p-5 md:p-8 border-none shadow-2xl">
                <DialogHeader className="mb-4 md:mb-6">
                  <DialogTitle className="font-headline text-2xl md:text-3xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                  <DialogDescription>Modify specific fields to update your live storefront catalog.</DialogDescription>
                </DialogHeader>
                <div className="space-y-5 md:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2 sm:col-span-2">
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
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                      <Select value={productForm.category || 'Personalized Gifts'} onValueChange={v => setProductForm({...productForm, category: v as any})}>
                        <SelectTrigger className="rounded-xl h-12 bg-secondary/50 focus-visible:ring-primary border-none font-bold shadow-none">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[1.5rem] p-2 shadow-xl border-none bg-card max-h-60 overflow-y-auto">
                          {categoriesList.map(cat => (
                            <SelectItem key={cat} value={cat} className="rounded-lg h-10 pl-8 pr-4">{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Photo Slots</Label>
                      <Input
                        type="number"
                        value={productForm.requiredPhotoSlots !== undefined && productForm.requiredPhotoSlots !== null ? productForm.requiredPhotoSlots.toString() : ''}
                        onChange={e => {
                          const val = e.target.value;
                          setProductForm({
                            ...productForm,
                            requiredPhotoSlots: val === '' ? null : parseInt(val)
                          });
                        }}
                        className="rounded-xl h-12 bg-secondary/50 focus-visible:ring-primary border-none font-bold font-sans"
                        placeholder="Automatic detection"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Product Display Images (Up to 5)</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {/* Existing Uploaded Images */}
                      {productForm.images?.map((imgUrl, i) => (
                        <a 
                          key={i}
                          href={imgUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative aspect-square rounded-xl overflow-hidden border border-border group bg-secondary/10 block cursor-zoom-in"
                          title="Click to view full image"
                        >
                          <img src={imgUrl} className="w-full h-full object-cover" />
                          {i === 0 && (
                             <Badge className="absolute bottom-2 left-2 text-[8px] px-1.5 h-4 border-none bg-primary text-primary-foreground pointer-events-none">Cover</Badge>
                          )}
                          <button 
                            onClick={(e) => {
                               e.preventDefault();
                               e.stopPropagation();
                               const newImages = productForm.images!.filter((_, index) => index !== i);
                               setProductForm({...productForm, images: newImages, image: newImages[0] || ''});
                            }}
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                             <X className="w-4 h-4" />
                          </button>
                        </a>
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Delivery Charge</Label>
                      <Select value={productForm.deliveryCharge || 'regular'} onValueChange={v => setProductForm({...productForm, deliveryCharge: v as any})}>
                        <SelectTrigger className="rounded-xl h-12 bg-secondary/50 focus-visible:ring-primary border-none font-bold shadow-none">
                          <SelectValue placeholder="Select Delivery Type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[1.5rem] p-2 shadow-xl border-none bg-card">
                          <SelectItem value="regular" className="rounded-lg h-10 pl-8 pr-4">Regular Charges (Based on Weight)</SelectItem>
                          <SelectItem value="complimentary" className="rounded-lg h-10 pl-8 pr-4">Complimentary (Free)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Weight (Kg)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={productForm.weight !== undefined && productForm.weight !== null ? productForm.weight.toString() : '1'}
                        onChange={e => {
                          const val = e.target.value;
                          setProductForm({
                            ...productForm,
                            weight: val === '' ? 1 : parseFloat(val)
                          });
                        }}
                        className="rounded-xl h-12 bg-secondary/50 focus-visible:ring-primary border-none font-bold font-sans"
                        placeholder="1.0"
                        disabled={productForm.deliveryCharge === 'complimentary'}
                      />
                    </div>
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

                  <div className="grid gap-4 pt-2">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="active"
                        checked={productForm.active !== false}
                        onCheckedChange={c => setProductForm({...productForm, active: !!c})}
                        className="rounded-md w-5 h-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label htmlFor="active" className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Active in Shop
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="featured"
                        checked={productForm.featured ?? false}
                        onCheckedChange={c => setProductForm({...productForm, featured: !!c})}
                        className="rounded-md w-5 h-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label htmlFor="featured" className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Feature on Home Page Carousel
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="needsMainImage"
                        checked={productForm.needsMainImage ?? false}
                        onCheckedChange={c => setProductForm({...productForm, needsMainImage: !!c})}
                        className="rounded-md w-5 h-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label htmlFor="needsMainImage" className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Requires Dedicated Main Photo Slot (e.g. for Mosaics/Collages)
                      </label>
                    </div>
                  </div>
                </div>
                <DialogFooter className="mt-6 md:mt-8 flex-col-reverse sm:flex-row sm:justify-between w-full gap-3">
                  {editingProduct ? (
                    <Button variant="destructive" onClick={() => handleDeleteProduct(editingProduct.id)} className="w-full sm:w-auto rounded-full font-bold px-8 h-12">Delete</Button>
                  ) : <div />}
                  <Button onClick={handleSaveProduct} className="w-full sm:w-auto rounded-full font-bold px-8 h-12 shadow-lg shadow-primary/20">Save Product</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="border-none shadow-2xl rounded-3xl md:rounded-[3rem] overflow-hidden bg-card/50 backdrop-blur-sm">
              <CardHeader className="p-5 md:p-10 border-b">
                <CardTitle className="font-headline text-3xl md:text-4xl text-foreground">Live Transactions</CardTitle>
                <CardDescription className="text-sm md:text-lg">Real-time order tracking and fulfillment</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-0">
                {loading ? (
                  <div className="py-32 text-center text-muted-foreground flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    Synchronizing with cloud...
                  </div>
                ) : (
                  <>
                  <div className="md:hidden space-y-3">
                    {filteredOrders.length === 0 ? (
                      <div className="text-center py-16 text-muted-foreground">No transactions found.</div>
                    ) : (
                      filteredOrders.map((order) => (
                        <div key={order.id} className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-mono text-[11px] font-bold text-primary">#{order.orderId || order.id.slice(0, 6)}</p>
                              <h3 className="mt-1 truncate text-base font-bold text-foreground">{order.customerName}</h3>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{order.phone}</p>
                            </div>
                            <Badge variant="secondary" className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold border-none ${getStatusColor(order.status)}`}>
                              {order.status?.toUpperCase() || 'PENDING'}
                            </Badge>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-secondary/35 p-3">
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Revenue</p>
                              <p className="mt-1 font-sans text-base font-bold text-foreground">{formatPrice(order.total)}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Created</p>
                              <p className="mt-1 text-xs font-bold text-foreground">{formatDate(order.createdAt)}</p>
                            </div>
                          </div>

                          <div className="mt-3 text-xs font-medium text-muted-foreground space-y-2">
                            {order.items?.map((i, idx) => (
                              <div key={idx} className="space-y-1">
                                <span className="font-bold text-foreground">{i.name} (x{i.quantity})</span>
                                {i.customPhotos && i.customPhotos.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {i.customPhotos.map((photo, pIdx) => (
                                      <a key={pIdx} href={photo.imageUrl} target="_blank" rel="noopener noreferrer" className="relative block w-8 h-8 rounded-md overflow-hidden border border-border/80 hover:border-primary transition-colors bg-secondary/15" title="Click to view full image">
                                        <img src={photo.imageUrl} alt="custom" className="w-full h-full object-cover" />
                                      </a>
                                    ))}
                                  </div>
                                )}
                                {i.customText && (
                                  <p className="text-[10px] text-muted-foreground font-semibold bg-accent/40 px-2 py-0.5 rounded inline-block mt-0.5">
                                    Text: &ldquo;{i.customText}&rdquo;
                                  </p>
                                )}
                              </div>
                            )) || 'No items'}
                          </div>

                          {order.returnRequest && (
                            <Button onClick={() => setViewingOrderForReturn(order)} variant="outline" className="mt-4 h-11 w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive hover:text-white font-bold">
                              <AlertCircle className="mr-2 h-4 w-4" /> View Issue Report
                            </Button>
                          )}

                          <div className="mt-4 grid grid-cols-[1fr_auto] gap-3">
                            <div className="flex flex-col gap-1 w-full">
                              <Select defaultValue={order.status} onValueChange={(v) => handleStatusChange(order.id, v as OrderStatus)}>
                                <SelectTrigger className="h-11 rounded-xl border-2 font-bold shadow-soft w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-[1.5rem] p-2 shadow-2xl">
                                  <SelectItem value="pending" className="rounded-xl h-10 pl-8 pr-4">Pending</SelectItem>
                                  <SelectItem value="processing" className="rounded-xl h-10 pl-8 pr-4">Processing</SelectItem>
                                  <SelectItem value="shipped" className="rounded-xl h-10 pl-8 pr-4">Shipped</SelectItem>
                                  <SelectItem value="delivered" className="rounded-xl h-10 pl-8 pr-4">Delivered</SelectItem>
                                  <SelectItem value="cancelled" className="rounded-xl h-10 pl-8 pr-4 text-destructive">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                              {order.status === 'shipped' && (
                                <button
                                  onClick={() => handleStatusChange(order.id, 'shipped')}
                                  className="text-[10px] text-primary hover:underline font-bold uppercase tracking-widest text-center mt-1 w-full"
                                >
                                  Edit Shipping Details
                                </button>
                              )}
                            </div>
                            <Button onClick={() => setViewingOrderDetails(order)} variant="outline" size="icon" className="h-11 w-11 rounded-xl">
                              <Eye className="h-4 w-4 text-primary" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="hidden md:block overflow-x-auto">
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
                                {order.returnRequest && (
                                  <Badge variant="destructive" className="mt-2 h-6 px-2 text-[8px] animate-pulse">ISSUE REPORTED</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="text-xs max-w-[250px] font-medium text-muted-foreground space-y-2">
                                  {order.items?.map((i, idx) => (
                                    <div key={idx} className="space-y-1">
                                      <span className="font-bold text-foreground">{i.name} (x{i.quantity})</span>
                                      {i.customPhotos && i.customPhotos.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                          {i.customPhotos.map((photo, pIdx) => (
                                            <a key={pIdx} href={photo.imageUrl} target="_blank" rel="noopener noreferrer" className="relative block w-8 h-8 rounded-md overflow-hidden border border-border/80 hover:border-primary transition-colors bg-secondary/15" title="Click to view/print full image">
                                              <img src={photo.imageUrl} alt="custom" className="w-full h-full object-cover" />
                                            </a>
                                          ))}
                                        </div>
                                      )}
                                      {i.customText && (
                                        <p className="text-[10px] text-muted-foreground font-semibold bg-accent/40 px-2 py-0.5 rounded inline-block mt-0.5">
                                          Text: &ldquo;{i.customText}&rdquo;
                                        </p>
                                      )}
                                    </div>
                                  )) || 'No items'}
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
                                  {order.returnRequest && (
                                    <Button onClick={() => setViewingOrderForReturn(order)} variant="outline" size="icon" className="rounded-full border-destructive/30 text-destructive hover:bg-destructive hover:text-white">
                                      <AlertCircle className="w-5 h-5" />
                                    </Button>
                                  )}
                                  <Button onClick={() => setViewingOrderDetails(order)} variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                                    <Eye className="w-5 h-5 text-primary" />
                                  </Button>
                                   <div className="flex flex-col gap-1 items-end">
                                    <Select defaultValue={order.status} onValueChange={(v) => handleStatusChange(order.id, v as OrderStatus)}>
                                      <SelectTrigger className="w-[160px] rounded-full border-2 h-12 font-bold shadow-soft">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="rounded-[1.5rem] p-2 shadow-2xl">
                                        <SelectItem value="pending" className="rounded-xl h-10 pl-8 pr-4">Pending</SelectItem>
                                        <SelectItem value="processing" className="rounded-xl h-10 pl-8 pr-4">Processing</SelectItem>
                                        <SelectItem value="shipped" className="rounded-xl h-10 pl-8 pr-4">Shipped</SelectItem>
                                        <SelectItem value="delivered" className="rounded-xl h-10 pl-8 pr-4">Delivered</SelectItem>
                                        <SelectItem value="cancelled" className="rounded-xl h-10 pl-8 pr-4 text-destructive">Cancelled</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    {order.status === 'shipped' && (
                                      <button
                                        onClick={() => handleStatusChange(order.id, 'shipped')}
                                        className="text-[10px] text-primary hover:underline font-bold uppercase tracking-widest mr-2 mt-1"
                                      >
                                        Edit Details
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stuck_payments">
            <Card className="border-none shadow-2xl rounded-3xl md:rounded-[3rem] overflow-hidden bg-card/50 backdrop-blur-sm">
              <CardHeader className="p-5 md:p-10 border-b flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                  <CardTitle className="font-headline text-3xl md:text-4xl text-foreground">Stuck Payments Recovery</CardTitle>
                  <CardDescription className="text-sm md:text-lg mt-2">
                    Orders where payment was initiated but verification did not complete. If the customer was debited, click <strong>Verify & Approve</strong>.
                  </CardDescription>
                </div>
                <Button onClick={fetchRazorpayOrders} disabled={loadingRazorpayOrders} className="h-12 md:h-14 px-3 md:px-8 rounded-full text-xs md:text-sm font-bold">
                  {loadingRazorpayOrders ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CloudDownload className="w-5 h-5 mr-2" />}
                  Refresh
                </Button>
              </CardHeader>
              <CardContent className="p-4 md:p-10">
                {loadingRazorpayOrders ? (
                  <div className="py-32 text-center text-muted-foreground flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    Fetching transaction history...
                  </div>
                ) : razorpayOrders.filter(o => o.status !== 'paid').length === 0 ? (
                  <div className="py-24 text-center text-muted-foreground">
                    <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-80" />
                    <p className="text-lg font-bold text-foreground">All clear!</p>
                    <p className="text-sm">There are currently no unverified or stuck customer payments.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-secondary/40">
                        <TableRow>
                          <TableHead className="font-bold uppercase tracking-wider text-[10px] pl-10">Razorpay Order ID</TableHead>
                          <TableHead className="font-bold uppercase tracking-wider text-[10px]">Customer / Contact</TableHead>
                          <TableHead className="font-bold uppercase tracking-wider text-[10px]">Items</TableHead>
                          <TableHead className="font-bold uppercase tracking-wider text-[10px]">Total Amount</TableHead>
                          <TableHead className="font-bold uppercase tracking-wider text-[10px]">Date</TableHead>
                          <TableHead className="font-bold uppercase tracking-wider text-[10px] pr-10 text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {razorpayOrders.filter(o => o.status !== 'paid').map((rzp) => (
                          <TableRow key={rzp.id} className="hover:bg-secondary/20 transition-all border-b border-border/40">
                            <TableCell className="font-mono font-bold text-xs pl-10 text-primary">{rzp.razorpayOrderId}</TableCell>
                            <TableCell>
                              <div className="font-bold text-sm">{rzp.shipping?.name || 'Guest'}</div>
                              <div className="text-xs text-muted-foreground">{rzp.shipping?.phone || 'No phone'}</div>
                              <div className="text-[10px] text-muted-foreground">{rzp.customerEmail || 'No email'}</div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[200px] truncate text-xs font-medium">
                                {rzp.items?.map((it: any) => `${it.name} (${it.quantity})`).join(', ') || 'No items'}
                              </div>
                            </TableCell>
                            <TableCell className="font-sans font-bold text-sm">{formatPrice(rzp.serverCalculatedTotal || 0)}</TableCell>
                            <TableCell className="text-xs">{new Date(rzp.createdAt).toLocaleString()}</TableCell>
                            <TableCell className="pr-10 text-right">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedRzpOrder(rzp);
                                  setIsVerifyModalOpen(true);
                                }}
                                className="rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4"
                              >
                                Verify & Approve
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

          <TabsContent value="settings">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                  <Card className="rounded-3xl md:rounded-[4rem] border-none shadow-premium overflow-hidden bg-card md:col-span-2">
                    <div className="p-5 md:p-16 space-y-5 md:space-y-8">
                      <div className="w-14 h-14 md:w-20 md:h-20 bg-amber-500/10 text-amber-600 rounded-2xl md:rounded-[2rem] flex items-center justify-center shadow-inner">
                        <Settings className="w-7 h-7 md:w-10 md:h-10" />
                      </div>
                      <div className="space-y-2 md:space-y-4">
                        <h3 className="text-2xl md:text-4xl font-body font-bold">Global Shop Settings</h3>
                        <p className="text-sm md:text-xl text-muted-foreground leading-relaxed">
                          Configure shop-wide settings. Change the cost of the Premium Gift Wrap option displayed in the customer cart.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-end gap-4 max-w-md">
                        <div className="flex-1 space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Premium Gift Wrap Price (₹)</Label>
                          <Input
                            type="number"
                            value={adminGiftWrapPrice}
                            onChange={(e) => setAdminGiftWrapPrice(parseInt(e.target.value) || 0)}
                            className="rounded-xl h-12 bg-secondary/50 focus-visible:ring-primary border-none font-bold font-sans"
                            placeholder="50"
                          />
                        </div>
                        <Button 
                          onClick={handleSaveSettings} 
                          disabled={savingSettings}
                          className="h-12 px-8 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 shadow-lg text-white"
                        >
                          {savingSettings ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Save Settings
                        </Button>
                      </div>
                    </div>
                  </Card>

                  <Card className="rounded-3xl md:rounded-[4rem] border-none shadow-premium overflow-hidden bg-card">
                    <div className="p-5 md:p-16 space-y-5 md:space-y-8">
                      <div className="w-14 h-14 md:w-20 md:h-20 bg-blue-500/10 text-blue-600 rounded-2xl md:rounded-[2rem] flex items-center justify-center shadow-inner">
                        <CloudDownload className="w-7 h-7 md:w-10 md:h-10" />
                      </div>
                      <div className="space-y-2 md:space-y-4">
                        <h3 className="text-2xl md:text-4xl font-body font-bold">Image Migration Hub</h3>
                        <p className="text-sm md:text-xl text-muted-foreground leading-relaxed">
                          Scan your entire collection and automatically download images from external sources (PostImage) into your private <strong>Firebase Storage</strong>.
                        </p>
                      </div>
                      <Button onClick={handleRunMigration} className="w-full h-12 md:h-20 rounded-2xl md:rounded-full font-black text-sm md:text-xl bg-blue-600 hover:bg-blue-700 shadow-2xl shadow-blue-600/30 transition-all active:scale-95">
                        Start Asset Migration
                      </Button>
                      <p className="text-center text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50">Recommended every 30 days</p>
                    </div>
                  </Card>

                  <Card className="rounded-3xl md:rounded-[4rem] border-none shadow-premium overflow-hidden bg-card">
                    <div className="p-5 md:p-16 space-y-5 md:space-y-8">
                      <div className="w-14 h-14 md:w-20 md:h-20 bg-purple-500/10 text-purple-600 rounded-2xl md:rounded-[2rem] flex items-center justify-center shadow-inner">
                        <Globe className="w-7 h-7 md:w-10 md:h-10" />
                      </div>
                      <div className="space-y-2 md:space-y-4">
                        <h3 className="text-2xl md:text-4xl font-body font-bold">Master Data Sync</h3>
                        <p className="text-sm md:text-xl text-muted-foreground leading-relaxed">
                          Synchronize your local <code>data.ts</code> library with the live <strong>Firestore Database</strong>. Safely adds new products without overwriting.
                        </p>
                      </div>
                      <Button onClick={handleSyncData} className="w-full h-12 md:h-20 rounded-2xl md:rounded-full font-black text-sm md:text-xl bg-purple-600 hover:bg-purple-700 shadow-2xl shadow-purple-600/30 transition-all active:scale-95">
                        Push Local Library
                      </Button>
                      <p className="text-center text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50">Safely syncs current catalog</p>
                    </div>
                  </Card>
               </div>
            </TabsContent>
          </Tabs>

        {/* Return Request View Dialog */}
        <Dialog open={!!viewingOrderForReturn} onOpenChange={(open) => !open && setViewingOrderForReturn(null)}>
          <DialogContent className="max-w-3xl rounded-[3rem] p-10 border-none shadow-premium bg-card overflow-y-auto max-h-[90vh]">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-4xl font-headline font-bold text-destructive">Maintenance Report</DialogTitle>
              <DialogDescription className="text-lg">
                Customer: <span className="font-bold text-foreground">{viewingOrderForReturn?.customerName}</span> | 
                Order ID: <span className="font-bold text-primary">#{viewingOrderForReturn?.orderId}</span>
              </DialogDescription>
            </DialogHeader>

            {viewingOrderForReturn?.returnRequest && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-secondary/30 p-6 rounded-3xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Issue Type</p>
                    <p className="font-bold text-xl uppercase text-destructive">{viewingOrderForReturn.returnRequest.reason.replace('_', ' ')}</p>
                  </div>
                  <div className="bg-secondary/30 p-6 rounded-3xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Reported On</p>
                    <p className="font-bold text-xl">{toDate(viewingOrderForReturn.returnRequest.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="bg-secondary/30 p-8 rounded-[2rem]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Customer&apos;s Account</p>
                  <p className="text-lg leading-relaxed">{viewingOrderForReturn.returnRequest.description}</p>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Photo Evidence</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {viewingOrderForReturn.returnRequest.images.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-border shadow-soft group cursor-zoom-in">
                        <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-110" onClick={() => window.open(url, '_blank')} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-dashed flex justify-between items-center">
                   <div className="flex gap-4">
                      {/* You could add Approve/Reject buttons here to update the status */}
                   </div>
                   <Button variant="outline" className="h-14 px-8 rounded-full font-bold border-2" asChild>
                      <a href={`https://wa.me/${viewingOrderForReturn.phone}?text=${encodeURIComponent(`Hi ${viewingOrderForReturn.customerName}, I saw your report about order #${viewingOrderForReturn.orderId}. I'm here to help!`)}`} target="_blank">
                        <MessageSquare className="w-5 h-5 mr-3" /> Resolve via WhatsApp
                      </a>
                   </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Shipping details dialog */}
        <Dialog open={isShippingModalOpen} onOpenChange={setIsShippingModalOpen}>
          <DialogContent className="max-w-md rounded-2xl md:rounded-[2rem] p-5 md:p-8 border-none shadow-2xl bg-card">
            <DialogHeader className="mb-4">
              <DialogTitle className="font-headline text-2xl font-bold">Shipping Details</DialogTitle>
              <DialogDescription>Provide courier details for this order to notify the customer.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Courier / Carrier</Label>
                <Select value={shippingCourierName} onValueChange={(val) => {
                  setShippingCourierName(val);
                  const url = getAutoTrackingUrl(val, shippingTrackingNumber);
                  if (url) setShippingTrackingUrl(url);
                }}>
                  <SelectTrigger className="rounded-xl h-12 bg-secondary/50 focus:ring-primary border-none font-bold">
                    <SelectValue placeholder="Select Courier" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[1.5rem] p-2 shadow-xl border-none bg-card">
                    <SelectItem value="DTDC" className="rounded-lg h-10 pl-8 pr-4">DTDC</SelectItem>
                    <SelectItem value="Delhivery" className="rounded-lg h-10 pl-8 pr-4">Delhivery</SelectItem>
                    <SelectItem value="Blue Dart" className="rounded-lg h-10 pl-8 pr-4">Blue Dart</SelectItem>
                    <SelectItem value="India Post" className="rounded-lg h-10 pl-8 pr-4">India Post (Speed Post)</SelectItem>
                    <SelectItem value="Professional Couriers" className="rounded-lg h-10 pl-8 pr-4">Professional Couriers</SelectItem>
                    <SelectItem value="ST Courier" className="rounded-lg h-10 pl-8 pr-4">ST Courier</SelectItem>
                    <SelectItem value="Franch Express" className="rounded-lg h-10 pl-8 pr-4">Franch Express</SelectItem>
                    <SelectItem value="Other" className="rounded-lg h-10 pl-8 pr-4">Other / Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {shippingCourierName === 'Other' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Custom Courier Name</Label>
                  <Input
                    value={customCourierName}
                    onChange={(e) => setCustomCourierName(e.target.value)}
                    placeholder="Enter carrier name"
                    className="rounded-xl h-12 bg-secondary/50 focus-visible:ring-primary border-none font-bold"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tracking Number / AWB</Label>
                <Input
                  value={shippingTrackingNumber}
                  onChange={(e) => {
                    const trackingVal = e.target.value;
                    setShippingTrackingNumber(trackingVal);
                    const courier = shippingCourierName === 'Other' ? customCourierName : shippingCourierName;
                    const url = getAutoTrackingUrl(courier, trackingVal);
                    if (url) setShippingTrackingUrl(url);
                  }}
                  placeholder="Enter tracking number"
                  className="rounded-xl h-12 bg-secondary/50 focus-visible:ring-primary border-none font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tracking Link (Optional)</Label>
                <Input
                  value={shippingTrackingUrl}
                  onChange={(e) => setShippingTrackingUrl(e.target.value)}
                  placeholder="https://..."
                  className="rounded-xl h-12 bg-secondary/50 focus-visible:ring-primary border-none font-sans text-xs"
                />
              </div>
            </div>
            <DialogFooter className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => setIsShippingModalOpen(false)} className="rounded-full font-bold px-6 h-12 flex-1">Cancel</Button>
              <Button onClick={handleSaveShippingDetails} className="rounded-full font-bold px-6 h-12 flex-1 shadow-lg shadow-primary/20">Save & Ship</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stuck Payment Recovery Verification Dialog */}
        <Dialog open={isVerifyModalOpen} onOpenChange={(open) => !open && setIsVerifyModalOpen(false)}>
          <DialogContent className="max-w-md rounded-[3rem] p-10 border-none shadow-premium bg-card">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-3xl font-headline font-bold text-foreground">Verify Stuck Payment</DialogTitle>
              <DialogDescription className="text-sm">
                Manually approve the payment for Razorpay Order <strong>{selectedRzpOrder?.razorpayOrderId}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="bg-secondary/40 p-5 rounded-2xl space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recipient:</span>
                  <span className="font-bold">{selectedRzpOrder?.shipping?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact:</span>
                  <span className="font-bold">{selectedRzpOrder?.shipping?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-bold text-primary">{formatPrice(selectedRzpOrder?.serverCalculatedTotal || 0)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentId" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Razorpay Payment ID (Optional)</Label>
                <Input
                  id="paymentId"
                  placeholder="e.g. pay_Pxyz123456"
                  value={manualPaymentId}
                  onChange={(e) => setManualPaymentId(e.target.value)}
                  className="rounded-xl bg-secondary/50 focus-visible:ring-primary border-none"
                />
                <p className="text-[10px] text-muted-foreground">
                  Provide the payment ID from your Razorpay Dashboard if you want to link it, or leave it blank to auto-generate a manual receipt ID.
                </p>
              </div>
            </div>

            <DialogFooter className="mt-8 flex gap-3">
              <Button variant="outline" onClick={() => setIsVerifyModalOpen(false)} className="rounded-full font-bold h-12 flex-1">
                Cancel
              </Button>
              <Button onClick={handleForceCreateOrder} disabled={verifyingOrder} className="rounded-full font-bold h-12 bg-amber-600 hover:bg-amber-700 text-white flex-1 shadow-lg shadow-amber-600/20">
                {verifyingOrder ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
                Approve & Place Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Category Dialog */}
        <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
          <DialogContent className="max-w-md rounded-[3rem] p-10 border-none shadow-premium bg-card">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-3xl font-headline font-bold text-foreground">Add New Category</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Create a custom category to group your products. It will instantly appear in the category dropdown when editing or creating products.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddCategory} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="categoryName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category Name</Label>
                <Input
                  id="categoryName"
                  placeholder="e.g. Wooden Frames"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="rounded-xl h-12 bg-secondary/50 focus-visible:ring-primary border-none font-bold"
                  required
                />
              </div>

              <DialogFooter className="mt-6 flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddCategoryOpen(false)} 
                  className="rounded-full font-bold px-6 h-12 flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSavingCategory || !newCategoryName.trim()} 
                  className="rounded-full font-bold px-6 h-12 flex-1 shadow-lg shadow-primary/20"
                >
                  {isSavingCategory ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  Create Category
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Order Details Drawer Dialog */}
        <Dialog open={!!viewingOrderDetails} onOpenChange={(open) => !open && setViewingOrderDetails(null)}>
          <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto rounded-[3rem] p-8 md:p-10 border-none shadow-2xl bg-card">
            <DialogHeader className="mb-6 border-b pb-4 flex flex-row items-center justify-between">
              <div>
                <DialogTitle className="text-3xl font-headline font-bold text-foreground">
                  Order Details
                </DialogTitle>
                <DialogDescription className="font-mono text-sm font-bold text-primary mt-1">
                  #{viewingOrderDetails?.orderId || viewingOrderDetails?.id}
                </DialogDescription>
              </div>
              <Badge variant="secondary" className={`rounded-full px-4 py-1.5 font-bold border-none text-xs ${viewingOrderDetails ? getStatusColor(viewingOrderDetails.status) : ''}`}>
                {viewingOrderDetails?.status?.toUpperCase()}
              </Badge>
            </DialogHeader>

            {viewingOrderDetails && (
              <div className="space-y-6">
                {/* Fulfillment Steps Timeline */}
                <div className="bg-secondary/30 p-6 rounded-3xl space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fulfillment Status</h3>
                  <div className="flex items-center justify-between text-xs font-bold gap-2">
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${['pending', 'processing', 'shipped', 'delivered'].includes(viewingOrderDetails.status) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>✓</span>
                      <span className="text-center">Pending</span>
                    </div>
                    <div className="h-0.5 bg-muted flex-1 -mt-5" />
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${['processing', 'shipped', 'delivered'].includes(viewingOrderDetails.status) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {['processing', 'shipped', 'delivered'].includes(viewingOrderDetails.status) ? '✓' : '2'}
                      </span>
                      <span className="text-center">Processing</span>
                    </div>
                    <div className="h-0.5 bg-muted flex-1 -mt-5" />
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${['shipped', 'delivered'].includes(viewingOrderDetails.status) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {['shipped', 'delivered'].includes(viewingOrderDetails.status) ? '✓' : '3'}
                      </span>
                      <span className="text-center">Shipped</span>
                    </div>
                    <div className="h-0.5 bg-muted flex-1 -mt-5" />
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${viewingOrderDetails.status === 'delivered' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {viewingOrderDetails.status === 'delivered' ? '✓' : '4'}
                      </span>
                      <span className="text-center">Delivered</span>
                    </div>
                  </div>
                </div>

                {/* Customer Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-secondary/25 p-5 rounded-2xl space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Recipient Info</span>
                    <p className="font-bold text-foreground text-sm">{viewingOrderDetails.customerName}</p>
                    <p className="text-xs text-muted-foreground">{viewingOrderDetails.phone}</p>
                    <p className="text-xs text-muted-foreground">{viewingOrderDetails.customerEmail}</p>
                  </div>
                  <div className="bg-secondary/25 p-5 rounded-2xl space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Shipping Address</span>
                    <p className="text-xs text-foreground font-medium leading-relaxed">
                      {viewingOrderDetails.address}<br />
                      {viewingOrderDetails.city}, {viewingOrderDetails.state} - {viewingOrderDetails.pincode}
                    </p>
                  </div>
                </div>

                {/* Items list & Custom Photos */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Order Items</h3>
                    <Button 
                      onClick={() => downloadAllPhotos(viewingOrderDetails)}
                      size="sm" 
                      variant="outline" 
                      className="rounded-full h-8 font-bold text-[10px] border-primary/20 text-primary hover:bg-primary/5"
                    >
                      <CloudDownload className="w-3.5 h-3.5 mr-1" /> Download All Photos
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {viewingOrderDetails.items?.map((item: any, idx: number) => (
                      <div key={idx} className="bg-secondary/20 p-4 rounded-2xl flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <p className="font-bold text-foreground text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground font-bold uppercase mt-1">{item.category}</p>
                          </div>
                          <span className="font-mono text-sm font-bold text-primary">x{item.quantity}</span>
                        </div>

                        {item.customPhotos && item.customPhotos.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Uploaded Photo Slots</span>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                              {item.customPhotos.map((photo: any, pIdx: number) => (
                                <div key={pIdx} className="group relative aspect-square rounded-xl overflow-hidden border bg-background flex items-center justify-center">
                                  <img src={photo.imageUrl} alt={`Slot ${pIdx + 1}`} className="w-full h-full object-cover" />
                                  <a 
                                    href={photo.imageUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold transition-opacity"
                                  >
                                    View Full
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {item.customText && (
                          <div className="space-y-1 mt-2 bg-accent/25 p-3 rounded-xl border border-border/40">
                            <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Customization Text</span>
                            <p className="text-sm font-semibold text-foreground">&ldquo;{item.customText}&rdquo;</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {viewingOrderDetails.feedback && (
                  <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-3xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-amber-600 uppercase font-black tracking-widest">Customer Feedback</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i < viewingOrderDetails.feedback!.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30 fill-none'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm font-medium italic text-foreground">&ldquo;{viewingOrderDetails.feedback.comment}&rdquo;</p>
                  </div>
                )}

                {/* Pricing Details */}
                <div className="border-t pt-4 space-y-2 text-sm font-bold">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span>{formatPrice(viewingOrderDetails.subtotal || 0)}</span>
                  </div>
                  {(viewingOrderDetails.discount || 0) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({viewingOrderDetails.couponCode || 'Promo'}):</span>
                      <span>-{formatPrice(viewingOrderDetails.discount || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping Fee:</span>
                    <span>{formatPrice(viewingOrderDetails.shippingFee || 0)}</span>
                  </div>
                  <div className="flex justify-between text-foreground text-lg border-t pt-2">
                    <span>Grand Total:</span>
                    <span className="text-primary">{formatPrice(viewingOrderDetails.total || 0)}</span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="mt-8 gap-3">
              <Button variant="outline" onClick={() => setViewingOrderDetails(null)} className="rounded-full font-bold h-12 flex-1">
                Close
              </Button>
              {viewingOrderDetails && (
                <Button asChild className="rounded-full font-bold h-12 flex-1 shadow-lg">
                  <Link href={`/order/${viewingOrderDetails.id}/invoice`}>
                    <Globe className="w-4 h-4 mr-2" /> View Invoice
                  </Link>
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
    <Card className="rounded-3xl md:rounded-[3rem] border-none shadow-soft bg-card p-5 md:p-10 transition-all hover:scale-[1.03] hover:shadow-2xl">
      <div className="flex items-center gap-4 md:gap-8">
        <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] flex items-center justify-center shadow-2xl ${colors[color]}`}>
          <Icon className="w-7 h-7 md:w-10 md:h-10" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-[0.2em] md:tracking-[0.3em]">{label}</p>
          <h2 className="text-3xl md:text-5xl font-headline font-bold mt-1 md:mt-2 text-foreground truncate">{value}</h2>
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
