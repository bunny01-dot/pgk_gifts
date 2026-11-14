'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Tag,
  Percent,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Ban,
  Copy,
  RefreshCw,
  Sparkles,
  Phone,
  Calendar,
  Gift,
  TrendingUp,
  ShieldCheck,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  ExternalLink,
  IndianRupee,
  PackageOpen,
  DollarSign,
  Save,
  CheckCheck,
  MessageSquare,
  Award,
  Users,
  Lock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { PromotionsService } from '@/services/promotions.service';
import { ProductsService } from '@/services/products.service';
import { PromotionalOffer, AdminCouponView, PromotionsStats, LoyaltyQualifier } from '@/types/promotions';
import { Product } from '@/types/product';
import { formatPrice } from '@/utils/currency';
import {
  generateUniqueCouponCode,
  LOYALTY_COUPON_DEFAULT_VALUE,
  LOYALTY_COUPON_MIN_PURCHASE,
  LOYALTY_COUPON_EXPIRY_DAYS,
} from '@/utils/discount';
import Link from 'next/link';

export function MarketingOffersSection() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<'promotions' | 'loyalty' | 'pricing'>('promotions');

  // Loyalty 3+ Orders Qualifiers state
  const [loyaltyQualifiers, setLoyaltyQualifiers] = useState<LoyaltyQualifier[]>([]);
  const [loadingLoyalty, setLoadingLoyalty] = useState(false);
  const [loyaltyStats, setLoyaltyStats] = useState({
    totalQualifiersCount: 0,
    eligibleCount: 0,
    issuedCount: 0,
    redeemedCount: 0,
  });
  const [loyaltySearch, setLoyaltySearch] = useState('');
  const [loyaltyStatusFilter, setLoyaltyStatusFilter] = useState<'all' | 'eligible' | 'issued' | 'redeemed'>('all');
  const [generatingLoyaltyForPhone, setGeneratingLoyaltyForPhone] = useState<string | null>(null);

  // Manual Loyalty Code Generator state
  const [manualLoyaltyPhone, setManualLoyaltyPhone] = useState('');
  const [manualLoyaltyName, setManualLoyaltyName] = useState('');
  const [manualLoyaltyDiscount, setManualLoyaltyDiscount] = useState<number>(50);
  const [manualLoyaltyMinPurchase, setManualLoyaltyMinPurchase] = useState<number>(300);
  const [manualLoyaltyExpiryDays, setManualLoyaltyExpiryDays] = useState<number>(30);
  const [manualLoyaltyCustomCode, setManualLoyaltyCustomCode] = useState('');
  const [manualGenerating, setManualGenerating] = useState(false);
  const [lastGeneratedLoyalty, setLastGeneratedLoyalty] = useState<{
    code: string;
    phone: string;
    whatsappUrl: string;
  } | null>(null);

  // Promotions & Offers state
  const [offers, setOffers] = useState<PromotionalOffer[]>([]);
  const [coupons, setCoupons] = useState<AdminCouponView[]>([]);
  const [stats, setStats] = useState<PromotionsStats>({
    activeOffersCount: 0,
    totalCouponsIssued: 0,
    totalCouponsRedeemed: 0,
    totalCouponsActive: 0,
    totalSavingsGranted: 0,
  });
  const [isAutoDiscountEnabled, setIsAutoDiscountEnabled] = useState(true);

  // Filters & Search for coupons
  const [couponSearch, setCouponSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'redeemed' | 'expired' | 'cancelled'>('all');

  // Coupon Creation Modal
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [creatingCoupon, setCreatingCoupon] = useState(false);
  const [couponKind, setCouponKind] = useState<'loyalty' | 'store'>('loyalty');
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newDiscountType, setNewDiscountType] = useState<'flat' | 'percentage'>('flat');
  const [newDiscountAmount, setNewDiscountAmount] = useState<number>(LOYALTY_COUPON_DEFAULT_VALUE);
  const [newMinPurchase, setNewMinPurchase] = useState<number>(LOYALTY_COUPON_MIN_PURCHASE);
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newExpiryDays, setNewExpiryDays] = useState<number>(LOYALTY_COUPON_EXPIRY_DAYS);
  const [newUsageLimit, setNewUsageLimit] = useState<string>('');
  const [newNotes, setNewNotes] = useState('');

  // Coupon Edit Modal
  const [isEditCouponModalOpen, setIsEditCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<AdminCouponView | null>(null);
  const [updatingCoupon, setUpdatingCoupon] = useState(false);
  const [editDiscountAmount, setEditDiscountAmount] = useState<number>(50);
  const [editDiscountType, setEditDiscountType] = useState<'flat' | 'percentage'>('flat');
  const [editMinPurchase, setEditMinPurchase] = useState<number>(300);
  const [editCustomerPhone, setEditCustomerPhone] = useState<string>('');
  const [editStatus, setEditStatus] = useState<'active' | 'cancelled' | 'redeemed' | 'expired'>('active');
  const [editExpiryDate, setEditExpiryDate] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  // Offer Edit Modal (automatic discounts)
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Partial<PromotionalOffer> | null>(null);
  const [savingOffer, setSavingOffer] = useState(false);

  // Products & Price Management state
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceEditingMap, setPriceEditingMap] = useState<Record<string, number>>({});
  const [savingPriceId, setSavingPriceId] = useState<string | null>(null);
  const [savedPriceId, setSavedPriceId] = useState<string | null>(null);

  // Global store delivery/gift fees
  const [giftWrapFee, setGiftWrapFee] = useState<number>(50);
  const [lampDeliveryFee, setLampDeliveryFee] = useState<number>(80);
  const [mdfDeliveryFee, setMdfDeliveryFee] = useState<number>(60);
  const [largeFrameDeliveryFee, setLargeFrameDeliveryFee] = useState<number>(120);
  const [savingStoreFees, setSavingStoreFees] = useState(false);

  const promotionsService = useMemo(() => {
    return new PromotionsService(firestore, async () => (user ? user.getIdToken() : null));
  }, [firestore, user]);

  const productsService = useMemo(() => {
    return firestore ? new ProductsService(firestore) : null;
  }, [firestore]);

  const loadData = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setRefreshing(true);
      const data = await promotionsService.getAdminPromotions();
      setOffers(data.offers);
      setCoupons(data.coupons);
      setStats(data.stats);
      setIsAutoDiscountEnabled(data.isAutomaticDiscountEnabled);
      if (showRefreshToast) {
        toast({ title: 'Refreshed', description: 'Promotions, rewards and coupons updated.' });
      }
    } catch (err: any) {
      console.error('Failed to load promotions admin data:', err);
      toast({
        variant: 'destructive',
        title: 'Error loading promotions',
        description: err.message || 'Could not fetch promotional data.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadProductsAndSettings = async () => {
    if (!productsService || !firestore) return;
    setLoadingProducts(true);
    try {
      const allProds = await productsService.getAllProducts(undefined, false);
      setProducts(allProds);
      const initialMap: Record<string, number> = {};
      allProds.forEach((p) => {
        initialMap[p.id] = p.price;
      });
      setPriceEditingMap(initialMap);

      // Also load global settings fees
      const { doc, getDoc } = await import('firebase/firestore');
      const settingsSnap = await getDoc(doc(firestore, 'settings', 'global'));
      if (settingsSnap.exists()) {
        const sData = settingsSnap.data();
        if (typeof sData.giftWrapPrice === 'number') setGiftWrapFee(sData.giftWrapPrice);
        if (typeof sData.lampDeliveryCharge === 'number') setLampDeliveryFee(sData.lampDeliveryCharge);
        if (typeof sData.mdfDeliveryCharge === 'number') setMdfDeliveryFee(sData.mdfDeliveryCharge);
        if (typeof sData.largeFrameDeliveryCharge === 'number') setLargeFrameDeliveryFee(sData.largeFrameDeliveryCharge);
      }
    } catch (e: any) {
      console.error('Error fetching products for price modifier:', e);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadLoyaltyData = async (silent = false) => {
    try {
      if (!silent) setLoadingLoyalty(true);
      const data = await promotionsService.getLoyaltyQualifiers();
      setLoyaltyQualifiers(data.qualifiers || []);
      setLoyaltyStats({
        totalQualifiersCount: data.totalQualifiersCount || 0,
        eligibleCount: data.eligibleCount || 0,
        issuedCount: data.issuedCount || 0,
        redeemedCount: data.redeemedCount || 0,
      });
    } catch (err: any) {
      console.error('Failed to load loyalty qualifiers:', err);
      if (!silent) {
        toast({
          variant: 'destructive',
          title: 'Error loading VIP qualifiers',
          description: err.message || 'Could not fetch loyalty qualifiers.',
        });
      }
    } finally {
      setLoadingLoyalty(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
      loadProductsAndSettings();
      loadLoyaltyData(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Handle Automatic Discount Global Toggle
  const handleToggleAutomatic = async (enabled: boolean) => {
    try {
      setIsAutoDiscountEnabled(enabled);
      await promotionsService.toggleAutomaticDiscounts(enabled);
      toast({
        title: enabled ? 'Automatic Discounts Enabled' : 'Automatic Discounts Disabled',
        description: enabled
          ? 'Eligible carts will now automatically receive discounts.'
          : 'Automatic cart discounts have been turned off.',
      });
    } catch (err: any) {
      setIsAutoDiscountEnabled(!enabled); // revert
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: err.message,
      });
    }
  };

  // Open Coupon Creation Modal
  const handleOpenCreateCoupon = () => {
    setCouponKind('loyalty');
    setNewCouponCode(generateUniqueCouponCode('PGK'));
    setNewDiscountType('flat');
    setNewDiscountAmount(LOYALTY_COUPON_DEFAULT_VALUE);
    setNewMinPurchase(LOYALTY_COUPON_MIN_PURCHASE);
    setNewCustomerPhone('');
    setNewExpiryDays(LOYALTY_COUPON_EXPIRY_DAYS);
    setNewUsageLimit('');
    setNewNotes('');
    setIsCouponModalOpen(true);
  };

  // Open Coupon Edit Modal
  const handleOpenEditCoupon = (coupon: AdminCouponView) => {
    setEditingCoupon(coupon);
    setEditDiscountAmount(coupon.discountAmount);
    setEditDiscountType(coupon.discountType || 'flat');
    setEditMinPurchase(coupon.minimumPurchase || 0);
    setEditCustomerPhone(coupon.customerPhone || '');
    setEditStatus(coupon.status);
    setEditNotes(coupon.notes || '');

    if (coupon.expiresAt) {
      const expDate = new Date(coupon.expiresAt);
      if (!isNaN(expDate.getTime())) {
        setEditExpiryDate(expDate.toISOString().split('T')[0] || '');
      } else {
        setEditExpiryDate('');
      }
    } else {
      setEditExpiryDate('');
    }

    setIsEditCouponModalOpen(true);
  };

  // Submit Coupon Creation
  const handleCreateCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = newCouponCode.trim().toUpperCase();
    if (!code) {
      toast({ variant: 'destructive', title: 'Error', description: 'Coupon code cannot be empty.' });
      return;
    }

    setCreatingCoupon(true);
    try {
      await promotionsService.createLoyaltyCoupon({
        couponCode: code,
        discountAmount: Number(newDiscountAmount),
        minimumPurchase: Number(newMinPurchase),
        discountType: newDiscountType,
        customerPhone: newCustomerPhone.trim() || null,
        expiresInDays: Number(newExpiryDays) || 30,
        notes: newNotes.trim() || undefined,
        isGeneric: couponKind === 'store',
        usageLimit: newUsageLimit ? Number(newUsageLimit) : null,
      });

      toast({
        title: 'Coupon Created Successfully!',
        description: `Code ${code} for ${newDiscountType === 'percentage' ? `${newDiscountAmount}%` : `₹${newDiscountAmount}`} OFF is now active.`,
      });
      setIsCouponModalOpen(false);
      loadData();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to create coupon',
        description: err.message || 'An error occurred while creating coupon.',
      });
    } finally {
      setCreatingCoupon(false);
    }
  };

  // Submit Coupon Edit / Update
  const handleUpdateCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;

    setUpdatingCoupon(true);
    try {
      await promotionsService.updateCoupon({
        couponCode: editingCoupon.couponCode,
        source: editingCoupon.source,
        discountAmount: Number(editDiscountAmount),
        discountType: editDiscountType,
        minimumPurchase: Number(editMinPurchase),
        customerPhone: editCustomerPhone.trim() || null,
        status: editStatus,
        notes: editNotes.trim() || null,
        expiresAt: editExpiryDate ? new Date(`${editExpiryDate}T23:59:59Z`).toISOString() : null,
      });

      toast({
        title: 'Coupon Updated Successfully',
        description: `Code ${editingCoupon.couponCode} has been updated.`,
      });
      setIsEditCouponModalOpen(false);
      setEditingCoupon(null);
      loadData();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to update coupon',
        description: err.message || 'An error occurred while saving coupon changes.',
      });
    } finally {
      setUpdatingCoupon(false);
    }
  };

  // Delete a Coupon
  const handleDeleteCoupon = async (coupon: AdminCouponView) => {
    if (!confirm(`Are you sure you want to permanently delete coupon ${coupon.couponCode}? This action cannot be undone.`)) {
      return;
    }

    try {
      await promotionsService.deleteCoupon(coupon.couponCode, coupon.source);
      toast({ title: 'Coupon Deleted', description: `Code ${coupon.couponCode} was permanently removed.` });
      setIsEditCouponModalOpen(false);
      setEditingCoupon(null);
      loadData();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error deleting coupon', description: err.message });
    }
  };

  // Cancel an Active Coupon
  const handleCancelCoupon = async (code: string, source: 'customer_coupons' | 'coupons') => {
    if (!confirm(`Are you sure you want to cancel coupon code ${code}? Customers will no longer be able to redeem it.`)) {
      return;
    }

    try {
      await promotionsService.cancelCoupon(code, source);
      toast({ title: 'Coupon Cancelled', description: `Code ${code} has been deactivated.` });
      loadData();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  // Save/Update an Automatic Offer Tier
  const handleSaveOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer || !editingOffer.title || editingOffer.minimumAmount === undefined || editingOffer.discountAmount === undefined) {
      return;
    }

    setSavingOffer(true);
    try {
      await promotionsService.savePromotionalOffer(editingOffer);
      toast({
        title: 'Offer Tier Saved',
        description: `Offer "${editingOffer.title}" has been updated.`,
      });
      setIsOfferModalOpen(false);
      setEditingOffer(null);
      loadData();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setSavingOffer(false);
    }
  };

  // Modify individual product price
  const handleUpdateProductPrice = async (productId: string, productName: string) => {
    const newPrice = priceEditingMap[productId];
    if (newPrice === undefined || isNaN(newPrice) || newPrice < 0) {
      toast({ variant: 'destructive', title: 'Invalid Price', description: 'Please enter a valid price amount.' });
      return;
    }

    setSavingPriceId(productId);
    try {
      await promotionsService.updateProductPrice(productId, newPrice);
      setSavedPriceId(productId);
      setTimeout(() => setSavedPriceId(null), 2500);

      // Update local product list
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, price: Math.round(newPrice) } : p))
      );

      toast({
        title: 'Price Updated!',
        description: `${productName} price set to ${formatPrice(newPrice)}.`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Price update failed',
        description: err.message || 'Could not update product price.',
      });
    } finally {
      setSavingPriceId(null);
    }
  };

  // Save Global Store Fees
  const handleSaveStoreFees = async () => {
    if (!firestore) return;
    setSavingStoreFees(true);
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(
        doc(firestore, 'settings', 'global'),
        {
          giftWrapPrice: Number(giftWrapFee),
          lampDeliveryCharge: Number(lampDeliveryFee),
          mdfDeliveryCharge: Number(mdfDeliveryFee),
          largeFrameDeliveryCharge: Number(largeFrameDeliveryFee),
        },
        { merge: true }
      );
      toast({
        title: 'Store Fees Saved',
        description: 'Gift wrap and standard delivery charges updated.',
      });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed to save fees', description: err.message });
    } finally {
      setSavingStoreFees(false);
    }
  };

  // Copy coupon code to clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Copied to Clipboard!', description: code });
  };

  // Generate loyalty VIP reward for a specific qualifier
  const handleGenerateLoyalty = async (qualifier: LoyaltyQualifier) => {
    try {
      setGeneratingLoyaltyForPhone(qualifier.phone);
      const res = await promotionsService.generateLoyaltyReward({
        customerPhone: qualifier.phone,
        customerName: qualifier.name,
        discountAmount: 50,
        minimumPurchase: 300,
        expiryDays: 30,
      });

      toast({
        title: 'VIP Reward Generated!',
        description: `Code ${res.coupon?.couponCode} issued for ${qualifier.name} (+91 ${qualifier.phone}).`,
      });

      // Update lists
      await Promise.all([loadLoyaltyData(true), loadData(false)]);

      // Open WhatsApp chat with pre-filled message
      if (res.whatsappUrl) {
        window.open(res.whatsappUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to generate VIP Reward',
        description: err.message || 'Something went wrong.',
      });
    } finally {
      setGeneratingLoyaltyForPhone(null);
    }
  };

  // Generate loyalty VIP reward manually for custom input
  const handleManualGenerateLoyalty = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPh = manualLoyaltyPhone.replace(/\D/g, '').slice(-10);
    if (!cleanPh || cleanPh.length < 10) {
      toast({
        variant: 'destructive',
        title: 'Invalid Phone Number',
        description: 'Please enter a valid 10-digit customer mobile number.',
      });
      return;
    }

    try {
      setManualGenerating(true);
      const res = await promotionsService.generateLoyaltyReward({
        customerPhone: cleanPh,
        customerName: manualLoyaltyName.trim() || undefined,
        discountAmount: Number(manualLoyaltyDiscount) || 50,
        minimumPurchase: Number(manualLoyaltyMinPurchase) || 300,
        expiryDays: Number(manualLoyaltyExpiryDays) || 30,
        customCode: manualLoyaltyCustomCode.trim() || undefined,
      });

      setLastGeneratedLoyalty({
        code: res.coupon?.couponCode || '',
        phone: cleanPh,
        whatsappUrl: res.whatsappUrl,
      });

      toast({
        title: 'VIP Reward Issued!',
        description: `Code ${res.coupon?.couponCode} created and locked to phone +91 ${cleanPh}.`,
      });

      // Reset form fields
      setManualLoyaltyPhone('');
      setManualLoyaltyName('');
      setManualLoyaltyCustomCode('');

      // Refresh both loyalty and coupon lists
      await Promise.all([loadLoyaltyData(true), loadData(false)]);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to create VIP coupon',
        description: err.message || 'Error creating phone-locked reward.',
      });
    } finally {
      setManualGenerating(false);
    }
  };

  // Filtered loyalty qualifiers
  const filteredLoyaltyQualifiers = useMemo(() => {
    return loyaltyQualifiers.filter((item) => {
      // Status filter
      if (loyaltyStatusFilter !== 'all') {
        if (loyaltyStatusFilter === 'eligible' && item.rewardStatus !== 'eligible') return false;
        if (loyaltyStatusFilter === 'issued' && item.rewardStatus !== 'issued') return false;
        if (loyaltyStatusFilter === 'redeemed' && item.rewardStatus !== 'redeemed') return false;
      }
      // Search filter
      if (loyaltySearch.trim()) {
        const query = loyaltySearch.toLowerCase().trim();
        const phoneMatches = item.phone.includes(query);
        const nameMatches = item.name.toLowerCase().includes(query);
        const codeMatches = item.issuedCouponCode?.toLowerCase().includes(query) ?? false;
        if (!phoneMatches && !nameMatches && !codeMatches) return false;
      }
      return true;
    });
  }, [loyaltyQualifiers, loyaltyStatusFilter, loyaltySearch]);

  // Filtered coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      // Status filter
      if (statusFilter !== 'all') {
        const isExp = coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now();
        const effective = coupon.status === 'active' && isExp ? 'expired' : coupon.status;
        if (effective !== statusFilter) return false;
      }
      // Search filter
      if (couponSearch.trim()) {
        const query = couponSearch.toLowerCase().trim();
        const codeMatches = coupon.couponCode.toLowerCase().includes(query);
        const phoneMatches = coupon.customerPhone?.toLowerCase().includes(query) ?? false;
        const notesMatches = coupon.notes?.toLowerCase().includes(query) ?? false;
        if (!codeMatches && !phoneMatches && !notesMatches) return false;
      }
      return true;
    });
  }, [coupons, statusFilter, couponSearch]);

  // Product categories list for filter
  const productCategories = useMemo(() => {
    const setCats = new Set<string>();
    products.forEach((p) => {
      if (p.category) setCats.add(p.category);
    });
    return Array.from(setCats).sort();
  }, [products]);

  // Filtered products for price modifier
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase().trim();
        const nameMatch = p.name.toLowerCase().includes(q);
        const catMatch = p.category?.toLowerCase().includes(q) ?? false;
        const idMatch = p.id.toLowerCase().includes(q);
        if (!nameMatch && !catMatch && !idMatch) return false;
      }
      return true;
    });
  }, [products, selectedCategory, productSearch]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground">Loading marketing & rewards management...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-headline font-bold flex items-center gap-2">
            <Tag className="w-7 h-7 text-primary" /> Marketing, Offers & Pricing
          </h2>
          <p className="text-muted-foreground text-xs md:text-sm">
            Manage automatic shopping discounts, loyalty coupons, promo codes, and modify product prices across the catalog.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadData(true);
              loadProductsAndSettings();
            }}
            disabled={refreshing}
            className="rounded-full h-9 text-xs font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </Button>

          <Button
            onClick={handleOpenCreateCoupon}
            className="rounded-full h-9 px-5 text-xs font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add / Issue Coupon
          </Button>
        </div>
      </div>

      {/* Main Mode Tabs: [Discounts & Coupons] | [3+ Orders VIP Loyalty] | [Product Prices & Pricing] */}
      <Tabs value={activeMainTab} onValueChange={(val: any) => setActiveMainTab(val)} className="w-full">
        <TabsList className="h-11 rounded-2xl p-1 bg-secondary/50 border border-border/50 grid grid-cols-3 max-w-2xl mb-6">
          <TabsTrigger value="promotions" className="rounded-xl text-xs md:text-sm font-bold h-9 flex items-center justify-center gap-1.5">
            <Gift className="w-4 h-4 text-emerald-600" /> Discounts & Coupons
          </TabsTrigger>
          <TabsTrigger value="loyalty" className="rounded-xl text-xs md:text-sm font-bold h-9 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" /> 3+ Orders VIP
            {loyaltyStats.eligibleCount > 0 && (
              <Badge variant="secondary" className="ml-1 bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] px-1.5 py-0 h-4 font-extrabold">
                {loyaltyStats.eligibleCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pricing" className="rounded-xl text-xs md:text-sm font-bold h-9 flex items-center justify-center gap-1.5">
            <IndianRupee className="w-4 h-4 text-primary" /> Price Management
          </TabsTrigger>
        </TabsList>

        {/* ===================== TAB 1: PROMOTIONS & COUPONS ===================== */}
        <TabsContent value="promotions" className="space-y-8 mt-0">
          {/* KPI Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="rounded-2xl border border-border/50 bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Customer Savings</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-headline font-bold text-foreground">
                {formatPrice(stats.totalSavingsGranted)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Total discounts awarded across orders</p>
            </Card>

            <Card className="rounded-2xl border border-border/50 bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Automatic Discounts</span>
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl md:text-3xl font-headline font-bold text-foreground">
                  {stats.activeOffersCount}
                </p>
                <Badge
                  variant="outline"
                  className={`text-[10px] uppercase font-bold ${
                    isAutoDiscountEnabled ? 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' : 'border-muted text-muted-foreground'
                  }`}
                >
                  {isAutoDiscountEnabled ? 'Active' : 'Disabled'}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Tiered cart discount rules</p>
            </Card>

            <Card className="rounded-2xl border border-border/50 bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Coupons Active</span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Gift className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-headline font-bold text-foreground">
                {stats.totalCouponsActive}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">{stats.totalCouponsIssued} total issued</p>
            </Card>

            <Card className="rounded-2xl border border-border/50 bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Coupons Redeemed</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-headline font-bold text-foreground">
                {stats.totalCouponsRedeemed}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {stats.totalCouponsIssued > 0
                  ? `${Math.round((stats.totalCouponsRedeemed / stats.totalCouponsIssued) * 100)}% redemption rate`
                  : 'Customer rewards'}
              </p>
            </Card>
          </div>

          {/* SECTION 1: Automatic Shopping Cart Discounts */}
          <Card className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-secondary/15 p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" /> Automatic Shopping Cart Discounts
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm mt-1">
                    Discounts automatically applied when product subtotal reaches minimum thresholds (highest tier applies).
                  </CardDescription>
                </div>

                <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-xl border border-border/60 shadow-xs">
                  <Label htmlFor="auto-discount-switch" className="text-xs font-bold cursor-pointer">
                    {isAutoDiscountEnabled ? 'Discounts Active' : 'Discounts Disabled'}
                  </Label>
                  <Switch
                    id="auto-discount-switch"
                    checked={isAutoDiscountEnabled}
                    onCheckedChange={handleToggleAutomatic}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offers.map((offer) => (
                  <div
                    key={offer.offerId}
                    className={`p-4 rounded-xl border transition-all ${
                      offer.active !== false && isAutoDiscountEnabled
                        ? 'border-primary/30 bg-primary/5 shadow-xs'
                        : 'border-border/50 bg-secondary/20 opacity-70'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div>
                        <Badge
                          variant={offer.active !== false ? 'default' : 'secondary'}
                          className="text-[10px] uppercase font-bold mb-1"
                        >
                          {offer.active !== false ? 'Enabled' : 'Paused'}
                        </Badge>
                        <h4 className="font-bold text-base text-foreground">{offer.title}</h4>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingOffer({ ...offer });
                          setIsOfferModalOpen(true);
                        }}
                        className="h-8 w-8 p-0 rounded-full hover:bg-secondary"
                        title="Edit threshold"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </div>

                    <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/40 pt-3">
                      <div className="flex justify-between">
                        <span>Minimum Cart Value:</span>
                        <span className="font-bold text-foreground">₹{offer.minimumAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Customer Discount:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{offer.discountAmount} OFF</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Quick Add Custom Tier */}
                <div
                  onClick={() => {
                    setEditingOffer({
                      offerId: `offer_${Date.now()}`,
                      title: '₹150 OFF on orders ₹1,000+',
                      minimumAmount: 1000,
                      discountAmount: 150,
                      active: true,
                    });
                    setIsOfferModalOpen(true);
                  }}
                  className="p-4 rounded-xl border border-dashed border-border/80 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-secondary/30 transition-colors min-h-[120px]"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-foreground">Add New Discount Tier</p>
                  <p className="text-[10px] text-muted-foreground">Configure custom cart threshold & savings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2: Customer Loyalty & Promotional Coupons */}
          <Card className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-secondary/15 p-5 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" /> Loyalty & Promotional Coupons
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm mt-1">
                    Manage store coupons (e.g. PGK15) and unique customer loyalty rewards. Strictly rough flat amounts (₹50, ₹100) are applied to protect margins.
                  </CardDescription>
                </div>

                <Button
                  onClick={handleOpenCreateCoupon}
                  className="rounded-full h-9 px-5 text-xs font-bold shrink-0 shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Issue New Coupon
                </Button>
              </div>

              {/* Search & Status Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Search by coupon code (e.g. PGK15) or phone number..."
                    value={couponSearch}
                    onChange={(e) => setCouponSearch(e.target.value)}
                    className="pl-9 h-9 text-xs rounded-xl bg-card border-border/70"
                  />
                </div>

                <Tabs value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)} className="shrink-0">
                  <TabsList className="h-9 rounded-xl p-1 bg-secondary/40">
                    <TabsTrigger value="all" className="rounded-lg text-xs font-bold h-7 px-3">All</TabsTrigger>
                    <TabsTrigger value="active" className="rounded-lg text-xs font-bold h-7 px-3 text-emerald-600">Active</TabsTrigger>
                    <TabsTrigger value="redeemed" className="rounded-lg text-xs font-bold h-7 px-3 text-blue-600">Redeemed</TabsTrigger>
                    <TabsTrigger value="expired" className="rounded-lg text-xs font-bold h-7 px-3 text-muted-foreground">Expired</TabsTrigger>
                    <TabsTrigger value="cancelled" className="rounded-lg text-xs font-bold h-7 px-3 text-destructive">Cancelled</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-bold">Coupon Code</TableHead>
                      <TableHead className="text-xs font-bold">Reward</TableHead>
                      <TableHead className="text-xs font-bold">Min Purchase</TableHead>
                      <TableHead className="text-xs font-bold">Scope / Type</TableHead>
                      <TableHead className="text-xs font-bold">Target Customer</TableHead>
                      <TableHead className="text-xs font-bold">Status</TableHead>
                      <TableHead className="text-xs font-bold">Expires</TableHead>
                      <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCoupons.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center text-xs text-muted-foreground">
                          No coupons match your filter. Click &ldquo;Issue New Coupon&rdquo; to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCoupons.map((coupon) => {
                        const isExpired = coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now();
                        const effectiveStatus = coupon.status === 'active' && isExpired ? 'expired' : coupon.status;

                        return (
                          <TableRow key={coupon.couponCode} className="hover:bg-secondary/20">
                            <TableCell className="font-mono font-bold text-xs">
                              <div className="flex items-center gap-1.5">
                                <span className="text-foreground font-extrabold text-sm">{coupon.couponCode}</span>
                                <button
                                  onClick={() => handleCopyCode(coupon.couponCode)}
                                  className="text-muted-foreground hover:text-primary p-1 transition-colors"
                                  title="Copy code"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </TableCell>

                            <TableCell className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                              ₹{coupon.discountAmount} OFF
                            </TableCell>

                            <TableCell className="text-xs text-muted-foreground font-semibold">
                              {coupon.minimumPurchase > 0 ? `₹${coupon.minimumPurchase}` : 'No minimum'}
                            </TableCell>

                            <TableCell className="text-xs">
                              {coupon.source === 'customer_coupons' ? (
                                <Badge variant="outline" className="text-[10px] font-bold border-purple-200 text-purple-700 bg-purple-50 dark:bg-purple-950/20">
                                  Loyalty Reward
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] font-bold border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-950/20">
                                  Store Promo
                                </Badge>
                              )}
                            </TableCell>

                            <TableCell className="text-xs text-muted-foreground">
                              {coupon.customerPhone ? (
                                <span className="flex items-center gap-1 font-mono text-foreground font-medium">
                                  <Phone className="w-3 h-3 text-primary/70" /> {coupon.customerPhone}
                                </span>
                              ) : (
                                <span className="text-muted-foreground/70 italic text-[11px]">All Customers (Public)</span>
                              )}
                            </TableCell>

                            <TableCell>
                              {effectiveStatus === 'active' && (
                                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-none font-bold text-[10px] px-2 py-0.5">
                                  Active
                                </Badge>
                              )}
                              {effectiveStatus === 'redeemed' && (
                                <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-none font-bold text-[10px] px-2 py-0.5">
                                  Redeemed
                                </Badge>
                              )}
                              {effectiveStatus === 'expired' && (
                                <Badge variant="outline" className="text-muted-foreground border-border text-[10px] px-2 py-0.5">
                                  Expired
                                </Badge>
                              )}
                              {effectiveStatus === 'cancelled' && (
                                <Badge className="bg-destructive/15 text-destructive border-none font-bold text-[10px] px-2 py-0.5">
                                  Cancelled
                                </Badge>
                              )}
                            </TableCell>

                            <TableCell className="text-xs text-muted-foreground">
                              {coupon.expiresAt
                                ? new Date(coupon.expiresAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'No Expiry'}
                            </TableCell>

                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenEditCoupon(coupon)}
                                  className="h-7 text-[11px] font-bold px-2.5 rounded-lg border-border/80 hover:bg-secondary flex items-center gap-1"
                                >
                                  <Edit2 className="w-3 h-3 text-primary" /> Modify
                                </Button>

                                {effectiveStatus === 'active' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCancelCoupon(coupon.couponCode, coupon.source)}
                                    className="h-7 text-[11px] text-destructive hover:bg-destructive/10 font-bold px-2 rounded-lg"
                                    title="Deactivate coupon"
                                  >
                                    <Ban className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== TAB 2: 3+ ORDERS VIP LOYALTY REWARDS ===================== */}
        <TabsContent value="loyalty" className="space-y-8 mt-0">
          {/* Security & Overview Banner */}
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-background to-secondary/30 p-6 md:p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5" /> 3+ Orders VIP Loyalty Reward System
                </div>
                <h2 className="text-2xl md:text-3xl font-headline font-bold text-foreground">
                  Rewarding Customer Loyalty with Zero Fraud Risk
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  Automatically tracks returning customers with 3 or more completed purchases. Generate exclusive Flat ₹50 OFF reward codes (min order ₹300) that are strictly phone-locked. Prevents sharing on coupon sites or among friends while delighting your best buyers.
                </p>
              </div>

              {/* 3 Protection Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5 shrink-0">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/60 text-xs shadow-xs">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-foreground text-[11px]">Strict Phone Lock</p>
                    <p className="text-[10px] text-muted-foreground">Only usable with owner&apos;s phone</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/60 text-xs shadow-xs">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="font-bold text-foreground text-[11px]">Single-Use & 30-Day Expiry</p>
                    <p className="text-[10px] text-muted-foreground">Auto-redeemed upon payment</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/60 text-xs shadow-xs">
                  <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-foreground text-[11px]">1-Click WhatsApp Dispatch</p>
                    <p className="text-[10px] text-muted-foreground">Pre-filled reward link</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loyalty KPI Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="rounded-2xl border border-border/50 bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total 3+ Order VIPs</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-headline font-bold text-foreground">
                {loyaltyStats.totalQualifiersCount}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Customers with 3 or more completed orders</p>
            </Card>

            <Card className="rounded-2xl border border-border/50 bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Awaiting Reward</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl md:text-3xl font-headline font-bold text-foreground">
                  {loyaltyStats.eligibleCount}
                </p>
                {loyaltyStats.eligibleCount > 0 && (
                  <Badge className="bg-amber-500 text-white text-[10px] uppercase font-bold">
                    Action Needed
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Eligible buyers without coupon</p>
            </Card>

            <Card className="rounded-2xl border border-border/50 bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rewards Issued</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Gift className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-headline font-bold text-foreground">
                {loyaltyStats.issuedCount}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Active phone-locked loyalty codes</p>
            </Card>

            <Card className="rounded-2xl border border-border/50 bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">VIP Redemptions</span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-headline font-bold text-foreground">
                {loyaltyStats.redeemedCount}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Coupons used on repeat orders</p>
            </Card>
          </div>

          {/* Qualifiers Table Card */}
          <Card className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-secondary/15 p-5 md:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-500" /> Customer Loyalty Qualifiers
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm mt-1">
                    Customers grouped by 10-digit mobile number with completed order counts and assigned phone-locked rewards.
                  </CardDescription>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadLoyaltyData(false)}
                  disabled={loadingLoyalty}
                  className="rounded-full h-9 text-xs font-bold shrink-0 self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loadingLoyalty ? 'animate-spin' : ''}`} /> Refresh Qualifiers
                </Button>
              </div>

              {/* Search & Status Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Search by customer name, phone number, or coupon code..."
                    value={loyaltySearch}
                    onChange={(e) => setLoyaltySearch(e.target.value)}
                    className="pl-9 h-9 text-xs rounded-xl bg-card border-border/70"
                  />
                </div>

                <Tabs value={loyaltyStatusFilter} onValueChange={(val: any) => setLoyaltyStatusFilter(val)} className="shrink-0">
                  <TabsList className="h-9 rounded-xl p-1 bg-secondary/40">
                    <TabsTrigger value="all" className="rounded-lg text-xs font-bold h-7 px-3">
                      All ({loyaltyQualifiers.length})
                    </TabsTrigger>
                    <TabsTrigger value="eligible" className="rounded-lg text-xs font-bold h-7 px-3 text-amber-600">
                      Eligible ({loyaltyStats.eligibleCount})
                    </TabsTrigger>
                    <TabsTrigger value="issued" className="rounded-lg text-xs font-bold h-7 px-3 text-emerald-600">
                      Active ({loyaltyStats.issuedCount})
                    </TabsTrigger>
                    <TabsTrigger value="redeemed" className="rounded-lg text-xs font-bold h-7 px-3 text-blue-600">
                      Redeemed ({loyaltyStats.redeemedCount})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-bold">Customer Details</TableHead>
                      <TableHead className="text-xs font-bold">Completed Orders</TableHead>
                      <TableHead className="text-xs font-bold">Lifetime Spend</TableHead>
                      <TableHead className="text-xs font-bold">Reward Status</TableHead>
                      <TableHead className="text-xs font-bold">Assigned VIP Code</TableHead>
                      <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLoyaltyQualifiers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                          {loadingLoyalty ? (
                            <div className="flex items-center justify-center gap-2">
                              <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Loading qualifiers...
                            </div>
                          ) : (
                            'No customer qualifiers found matching your filter.'
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLoyaltyQualifiers.map((qualifier) => {
                        const isGeneratingThis = generatingLoyaltyForPhone === qualifier.phone;
                        return (
                          <TableRow key={qualifier.phone} className="hover:bg-secondary/20">
                            {/* Customer Details */}
                            <TableCell className="text-xs">
                              <div>
                                <p className="font-bold text-foreground text-sm">{qualifier.name || 'PGK Customer'}</p>
                                <p className="font-mono text-muted-foreground text-xs flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3 text-muted-foreground" /> +91 {qualifier.phone}
                                </p>
                                {qualifier.email && (
                                  <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                                    {qualifier.email}
                                  </p>
                                )}
                              </div>
                            </TableCell>

                            {/* Completed Orders */}
                            <TableCell className="text-xs">
                              <div className="flex flex-col gap-1 items-start">
                                <Badge
                                  variant="secondary"
                                  className={`text-xs font-extrabold ${
                                    qualifier.completedOrderCount >= 3
                                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                      : 'bg-secondary text-muted-foreground'
                                  }`}
                                >
                                  {qualifier.completedOrderCount} Orders
                                </Badge>
                                {qualifier.lastOrderDate && (
                                  <span className="text-[10px] text-muted-foreground">
                                    Last: {new Date(qualifier.lastOrderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                  </span>
                                )}
                              </div>
                            </TableCell>

                            {/* Lifetime Spend */}
                            <TableCell className="text-xs font-bold text-foreground">
                              {formatPrice(qualifier.lifetimeSpend)}
                            </TableCell>

                            {/* Reward Status */}
                            <TableCell className="text-xs">
                              {qualifier.rewardStatus === 'eligible' && (
                                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                                  Eligible (3+ Orders)
                                </Badge>
                              )}
                              {qualifier.rewardStatus === 'issued' && (
                                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                                  Active Reward
                                </Badge>
                              )}
                              {qualifier.rewardStatus === 'redeemed' && (
                                <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-[11px] font-bold">
                                  Redeemed
                                </Badge>
                              )}
                              {qualifier.rewardStatus === 'expired' && (
                                <Badge variant="secondary" className="text-muted-foreground text-[11px]">
                                  Expired
                                </Badge>
                              )}
                            </TableCell>

                            {/* Assigned VIP Code */}
                            <TableCell className="text-xs">
                              {qualifier.issuedCouponCode ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-foreground bg-secondary/60 px-2 py-1 rounded-md text-xs border border-border/70">
                                    {qualifier.issuedCouponCode}
                                  </span>
                                  <button
                                    onClick={() => handleCopyCode(qualifier.issuedCouponCode!)}
                                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                                    title="Copy Code"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">None generated</span>
                              )}
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="text-xs text-right">
                              <div className="flex items-center justify-end gap-2">
                                {qualifier.rewardStatus === 'eligible' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleGenerateLoyalty(qualifier)}
                                    disabled={isGeneratingThis}
                                    className="rounded-full h-8 px-3 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs gap-1.5"
                                  >
                                    <Sparkles className={`w-3.5 h-3.5 ${isGeneratingThis ? 'animate-spin' : ''}`} />
                                    {isGeneratingThis ? 'Generating...' : 'Issue VIP Code'}
                                  </Button>
                                )}

                                {qualifier.rewardStatus === 'issued' && (
                                  <>
                                    {qualifier.whatsappUrl && (
                                      <a
                                        href={qualifier.whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-xs transition-colors"
                                        title="Send reward via WhatsApp"
                                      >
                                        <MessageSquare className="w-3.5 h-3.5" /> Send WhatsApp
                                      </a>
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleCopyCode(qualifier.issuedCouponCode!)}
                                      className="rounded-full h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                                      title="Copy code"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </Button>
                                  </>
                                )}

                                {qualifier.rewardStatus === 'redeemed' && (
                                  <div className="flex items-center gap-1 text-[11px] text-blue-600 font-bold">
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    {qualifier.redeemedOrderId ? `Order #${qualifier.redeemedOrderId}` : 'Redeemed'}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Manual VIP Generator Card */}
          <Card className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-secondary/15 p-5 md:p-6">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" /> Manual Phone-Locked VIP Code Generator
              </CardTitle>
              <CardDescription className="text-xs md:text-sm mt-1">
                Directly issue a private ₹50 OFF VIP reward to any customer phone number (useful for ad-hoc customer service, Instagram DMs, or manual inquiries).
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 md:p-6 space-y-6">
              <form onSubmit={handleManualGenerateLoyalty} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold flex items-center gap-1">
                    Customer Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                      +91
                    </span>
                    <Input
                      type="tel"
                      placeholder="9876543210"
                      value={manualLoyaltyPhone}
                      onChange={(e) => setManualLoyaltyPhone(e.target.value)}
                      maxLength={10}
                      required
                      className="pl-12 h-10 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Coupon will strictly unlock ONLY for this phone.</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Customer Name (Optional)</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={manualLoyaltyName}
                    onChange={(e) => setManualLoyaltyName(e.target.value)}
                    className="h-10 rounded-xl text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">Used to personalize the WhatsApp message.</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Custom Code (Optional)</Label>
                  <Input
                    type="text"
                    placeholder="Leave blank for auto PGK-XXXX-XXXX"
                    value={manualLoyaltyCustomCode}
                    onChange={(e) => setManualLoyaltyCustomCode(e.target.value.toUpperCase())}
                    className="h-10 rounded-xl text-xs font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">Must be unique across all active coupons.</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Discount Amount (₹)</Label>
                  <Input
                    type="number"
                    value={manualLoyaltyDiscount}
                    onChange={(e) => setManualLoyaltyDiscount(Number(e.target.value))}
                    min={1}
                    className="h-10 rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Minimum Purchase Requirement (₹)</Label>
                  <Input
                    type="number"
                    value={manualLoyaltyMinPurchase}
                    onChange={(e) => setManualLoyaltyMinPurchase(Number(e.target.value))}
                    min={0}
                    className="h-10 rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Expiry Period (Days)</Label>
                  <Input
                    type="number"
                    value={manualLoyaltyExpiryDays}
                    onChange={(e) => setManualLoyaltyExpiryDays(Number(e.target.value))}
                    min={1}
                    className="h-10 rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="md:col-span-3 flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={manualGenerating}
                    className="rounded-full h-10 px-6 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md gap-2"
                  >
                    <Sparkles className={`w-4 h-4 ${manualGenerating ? 'animate-spin' : ''}`} />
                    {manualGenerating ? 'Generating VIP Code...' : 'Generate & Lock to Phone'}
                  </Button>
                </div>
              </form>

              {/* Instant WhatsApp Dispatch Result Banner */}
              {lastGeneratedLoyalty && (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" /> Reward Generated Successfully
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="font-mono font-black text-lg text-foreground bg-card px-3 py-1 rounded-xl border border-emerald-500/30">
                        {lastGeneratedLoyalty.code}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCode(lastGeneratedLoyalty.code)}
                        className="rounded-lg h-8 px-2"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Locked to phone +91 {lastGeneratedLoyalty.phone}. Valid for 30 days.
                    </p>
                  </div>

                  <a
                    href={lastGeneratedLoyalty.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-md transition-all self-stretch sm:self-auto justify-center"
                  >
                    <MessageSquare className="w-4 h-4" /> Send Code via WhatsApp
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== TAB 3: PRICE MANAGEMENT ===================== */}
        <TabsContent value="pricing" className="space-y-8 mt-0">
          {/* Quick Store Service & Delivery Charges */}
          <Card className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-secondary/15 p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" /> Global Store Fees & Shipping Rates
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm mt-1">
                    Update base prices for premium gift wrapping and standard delivery shipping tariffs.
                  </CardDescription>
                </div>

                <Button
                  onClick={handleSaveStoreFees}
                  disabled={savingStoreFees}
                  className="rounded-full h-9 px-5 text-xs font-bold shadow-md self-start sm:self-auto"
                >
                  <Save className="w-4 h-4 mr-1.5" /> {savingStoreFees ? 'Saving...' : 'Save Global Fees'}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-5 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5 p-4 rounded-xl border border-border/60 bg-secondary/10">
                  <Label htmlFor="fee-gift-wrap" className="text-xs font-bold text-foreground">
                    Gift Wrap Charge (₹)
                  </Label>
                  <Input
                    id="fee-gift-wrap"
                    type="number"
                    min="0"
                    value={giftWrapFee}
                    onChange={(e) => setGiftWrapFee(Number(e.target.value))}
                    className="h-10 rounded-xl font-bold text-base"
                  />
                  <p className="text-[10px] text-muted-foreground">Premium packaging option at checkout</p>
                </div>

                <div className="space-y-1.5 p-4 rounded-xl border border-border/60 bg-secondary/10">
                  <Label htmlFor="fee-lamp-delivery" className="text-xs font-bold text-foreground">
                    Lamp Delivery (₹)
                  </Label>
                  <Input
                    id="fee-lamp-delivery"
                    type="number"
                    min="0"
                    value={lampDeliveryFee}
                    onChange={(e) => setLampDeliveryFee(Number(e.target.value))}
                    className="h-10 rounded-xl font-bold text-base"
                  />
                  <p className="text-[10px] text-muted-foreground">Standard delivery for 3D/Acrylic Lamps</p>
                </div>

                <div className="space-y-1.5 p-4 rounded-xl border border-border/60 bg-secondary/10">
                  <Label htmlFor="fee-mdf-delivery" className="text-xs font-bold text-foreground">
                    MDF Frame Delivery (₹)
                  </Label>
                  <Input
                    id="fee-mdf-delivery"
                    type="number"
                    min="0"
                    value={mdfDeliveryFee}
                    onChange={(e) => setMdfDeliveryFee(Number(e.target.value))}
                    className="h-10 rounded-xl font-bold text-base"
                  />
                  <p className="text-[10px] text-muted-foreground">Shipping rate for MDF Wall Frames</p>
                </div>

                <div className="space-y-1.5 p-4 rounded-xl border border-border/60 bg-secondary/10">
                  <Label htmlFor="fee-large-frame-delivery" className="text-xs font-bold text-foreground">
                    Large Frame Delivery (₹)
                  </Label>
                  <Input
                    id="fee-large-frame-delivery"
                    type="number"
                    min="0"
                    value={largeFrameDeliveryFee}
                    onChange={(e) => setLargeFrameDeliveryFee(Number(e.target.value))}
                    className="h-10 rounded-xl font-bold text-base"
                  />
                  <p className="text-[10px] text-muted-foreground">Shipping rate for 12x18+ oversized frames</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Catalog Price Modifier */}
          <Card className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-secondary/15 p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-primary" /> Product Catalog Price Modifier
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm mt-1">
                    Quickly review and modify retail prices for individual catalog items with instant synchronization.
                  </CardDescription>
                </div>

                <div className="text-xs font-bold text-muted-foreground bg-secondary/40 px-3 py-1.5 rounded-xl border border-border/50">
                  Showing {filteredProducts.length} of {products.length} Products
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Search product by title, category, or ID..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-9 h-9 text-xs rounded-xl bg-card border-border/70"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                    className="h-8 text-xs font-bold rounded-lg shrink-0"
                  >
                    All Categories
                  </Button>
                  {productCategories.map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                      className="h-8 text-xs font-bold rounded-lg shrink-0"
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loadingProducts ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-7 h-7 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">Loading catalog items...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs font-bold w-16">Item</TableHead>
                        <TableHead className="text-xs font-bold">Product Title</TableHead>
                        <TableHead className="text-xs font-bold">Category</TableHead>
                        <TableHead className="text-xs font-bold">Current Price</TableHead>
                        <TableHead className="text-xs font-bold w-48">New Price (₹)</TableHead>
                        <TableHead className="text-xs font-bold text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                            No products match your search or category filter.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProducts.map((p) => {
                          const currentVal = priceEditingMap[p.id] ?? p.price;
                          const hasChanged = currentVal !== p.price;
                          const isSaving = savingPriceId === p.id;
                          const isSaved = savedPriceId === p.id;

                          return (
                            <TableRow key={p.id} className="hover:bg-secondary/20">
                              <TableCell>
                                <div className="w-12 h-12 rounded-xl bg-secondary/50 border border-border/40 overflow-hidden flex items-center justify-center shrink-0">
                                  {p.image ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <PackageOpen className="w-5 h-5 text-muted-foreground/50" />
                                  )}
                                </div>
                              </TableCell>

                              <TableCell>
                                <div className="min-w-[180px]">
                                  <p className="font-bold text-xs text-foreground line-clamp-1">{p.name}</p>
                                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">ID: {p.id}</p>
                                </div>
                              </TableCell>

                              <TableCell>
                                <Badge variant="secondary" className="text-[10px] font-bold">
                                  {p.category}
                                </Badge>
                              </TableCell>

                              <TableCell>
                                <span className="font-bold text-sm text-foreground">{formatPrice(p.price)}</span>
                              </TableCell>

                              <TableCell>
                                <div className="flex items-center gap-1.5 max-w-[160px]">
                                  <span className="text-xs font-bold text-muted-foreground">₹</span>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={currentVal}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setPriceEditingMap((prev) => ({ ...prev, [p.id]: val }));
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleUpdateProductPrice(p.id, p.name);
                                      }
                                    }}
                                    className={`h-8 text-xs font-bold rounded-lg ${
                                      hasChanged ? 'border-primary ring-1 ring-primary/30 bg-primary/5' : ''
                                    }`}
                                  />
                                </div>
                              </TableCell>

                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateProductPrice(p.id, p.name)}
                                  disabled={isSaving || !hasChanged}
                                  variant={hasChanged ? 'default' : 'outline'}
                                  className={`h-8 text-xs font-bold px-3 rounded-lg transition-all ${
                                    isSaved ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''
                                  }`}
                                >
                                  {isSaving ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : isSaved ? (
                                    <>
                                      <CheckCheck className="w-3.5 h-3.5 mr-1" /> Saved
                                    </>
                                  ) : (
                                    <>
                                      <Save className="w-3.5 h-3.5 mr-1" /> Update
                                    </>
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ===================== MODAL 1: ADD / ISSUE NEW COUPON ===================== */}
      <Dialog open={isCouponModalOpen} onOpenChange={setIsCouponModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" /> Add & Issue Coupon
            </DialogTitle>
            <DialogDescription className="text-xs">
              Create a customer loyalty coupon or a store-wide promotional coupon code (e.g. PGK15).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCouponSubmit} className="space-y-4 pt-2">
            {/* Coupon Type Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/40 rounded-xl">
              <button
                type="button"
                onClick={() => setCouponKind('loyalty')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  couponKind === 'loyalty'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Loyalty Reward (1-Time)
              </button>
              <button
                type="button"
                onClick={() => setCouponKind('store')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  couponKind === 'store'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Store Promo (e.g. PGK15)
              </button>
            </div>

            {/* Code Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="coupon-code" className="text-xs font-bold">
                  Coupon Code
                </Label>
                <button
                  type="button"
                  onClick={() => setNewCouponCode(generateUniqueCouponCode('PGK'))}
                  className="text-[11px] text-primary hover:underline font-semibold"
                >
                  Generate Random
                </button>
              </div>
              <Input
                id="coupon-code"
                required
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                placeholder={couponKind === 'store' ? 'e.g. PGK15' : 'e.g. PGK-REW-9X2K'}
                className="font-mono font-bold uppercase tracking-wider h-10 rounded-xl"
              />
            </div>

            {/* Rough Flat Amount Presets (₹50, ₹100) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="coupon-discount" className="text-xs font-bold">
                  Discount Amount (₹ Flat)
                </Label>
                <span className="text-[10px] text-muted-foreground font-semibold">Rough amounts (₹50, ₹100)</span>
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant={newDiscountAmount === 50 ? 'default' : 'outline'}
                  onClick={() => {
                    setNewDiscountAmount(50);
                    setNewMinPurchase(300);
                  }}
                  className="h-8 text-xs font-bold rounded-lg px-3"
                >
                  ₹50 OFF (Min ₹300)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={newDiscountAmount === 100 ? 'default' : 'outline'}
                  onClick={() => {
                    setNewDiscountAmount(100);
                    setNewMinPurchase(700);
                  }}
                  className="h-8 text-xs font-bold rounded-lg px-3"
                >
                  ₹100 OFF (Min ₹700)
                </Button>
              </div>
              <Input
                id="coupon-discount"
                type="number"
                min="1"
                required
                value={newDiscountAmount}
                onChange={(e) => setNewDiscountAmount(Number(e.target.value))}
                className="h-10 rounded-xl font-bold text-base"
                placeholder="50 or 100"
              />
            </div>

            {/* Minimum Purchase Requirement */}
            <div className="space-y-1.5">
              <Label htmlFor="coupon-min-purchase" className="text-xs font-bold">
                Minimum Cart Purchase (₹)
              </Label>
              <Input
                id="coupon-min-purchase"
                type="number"
                min="0"
                required
                value={newMinPurchase}
                onChange={(e) => setNewMinPurchase(Number(e.target.value))}
                className="h-10 rounded-xl font-bold"
                placeholder="e.g. 300"
              />
              <p className="text-[10px] text-muted-foreground">Order subtotal must reach this value to apply discount.</p>
            </div>

            {/* Target Phone or Public */}
            <div className="space-y-1.5">
              <Label htmlFor="coupon-phone" className="text-xs font-bold">
                Lock to Customer Phone <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Input
                id="coupon-phone"
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
                placeholder="e.g. 9876543210 (leave empty for public / any customer)"
                className="h-10 rounded-xl font-mono text-xs"
              />
            </div>

            {/* Expiry Days & Usage Limit */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="coupon-expiry" className="text-xs font-bold">
                  Valid For (Days)
                </Label>
                <Input
                  id="coupon-expiry"
                  type="number"
                  min="1"
                  max="365"
                  required
                  value={newExpiryDays}
                  onChange={(e) => setNewExpiryDays(Number(e.target.value))}
                  className="h-10 rounded-xl"
                />
              </div>

              {couponKind === 'store' ? (
                <div className="space-y-1.5">
                  <Label htmlFor="coupon-usage-limit" className="text-xs font-bold">
                    Usage Limit <span className="text-muted-foreground font-normal">(Optional)</span>
                  </Label>
                  <Input
                    id="coupon-usage-limit"
                    type="number"
                    min="1"
                    value={newUsageLimit}
                    onChange={(e) => setNewUsageLimit(e.target.value)}
                    placeholder="Unlimited"
                    className="h-10 rounded-xl"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground">Usage Rule</Label>
                  <div className="h-10 rounded-xl border border-dashed border-border/60 flex items-center px-3 text-[11px] font-bold text-emerald-600">
                    Single-use verified
                  </div>
                </div>
              )}
            </div>

            {/* Reference Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="coupon-notes" className="text-xs font-bold">
                Internal Description / Notes <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Input
                id="coupon-notes"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="e.g. Special Holiday Promo / VIP customer reward"
                className="h-10 rounded-xl text-xs"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCouponModalOpen(false)}
                className="rounded-full text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creatingCoupon}
                className="rounded-full text-xs font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {creatingCoupon ? 'Creating...' : 'Create & Issue Coupon'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ===================== MODAL 2: EDIT EXISTING COUPON ===================== */}
      <Dialog open={isEditCouponModalOpen} onOpenChange={setIsEditCouponModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" /> Modify Coupon Details
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update discount amount, minimum order threshold, customer assignment, expiry or status for code{' '}
              <strong className="text-foreground">{editingCoupon?.couponCode}</strong>.
            </DialogDescription>
          </DialogHeader>

          {editingCoupon && (
            <form onSubmit={handleUpdateCouponSubmit} className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/60">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Coupon Code</span>
                  <p className="font-mono font-bold text-base text-foreground">{editingCoupon.couponCode}</p>
                </div>
                <Badge variant="outline" className="text-xs font-bold uppercase">
                  {editingCoupon.source === 'customer_coupons' ? 'Loyalty Coupon' : 'Store Promo'}
                </Badge>
              </div>

              {/* Rough Flat Amount Presets (₹50, ₹100) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-discount-amount" className="text-xs font-bold">
                    Discount Amount (₹ Flat)
                  </Label>
                  <span className="text-[10px] text-muted-foreground font-semibold">Rough amounts (₹50, ₹100)</span>
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant={editDiscountAmount === 50 ? 'default' : 'outline'}
                    onClick={() => {
                      setEditDiscountAmount(50);
                      setEditMinPurchase(300);
                    }}
                    className="h-8 text-xs font-bold rounded-lg px-3"
                  >
                    ₹50 OFF (Min ₹300)
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={editDiscountAmount === 100 ? 'default' : 'outline'}
                    onClick={() => {
                      setEditDiscountAmount(100);
                      setEditMinPurchase(700);
                    }}
                    className="h-8 text-xs font-bold rounded-lg px-3"
                  >
                    ₹100 OFF (Min ₹700)
                  </Button>
                </div>
                <Input
                  id="edit-discount-amount"
                  type="number"
                  min="1"
                  required
                  value={editDiscountAmount}
                  onChange={(e) => setEditDiscountAmount(Number(e.target.value))}
                  className="h-10 rounded-xl font-bold text-base"
                />
              </div>

              {/* Minimum Purchase */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-min-purchase" className="text-xs font-bold">
                  Minimum Purchase Requirement (₹)
                </Label>
                <Input
                  id="edit-min-purchase"
                  type="number"
                  min="0"
                  required
                  value={editMinPurchase}
                  onChange={(e) => setEditMinPurchase(Number(e.target.value))}
                  className="h-10 rounded-xl font-bold"
                />
              </div>

              {/* Customer Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-customer-phone" className="text-xs font-bold">
                  Assigned Customer Phone <span className="text-muted-foreground font-normal">(Leave blank for public)</span>
                </Label>
                <Input
                  id="edit-customer-phone"
                  value={editCustomerPhone}
                  onChange={(e) => setEditCustomerPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="h-10 rounded-xl font-mono text-xs"
                />
              </div>

              {/* Status & Expiry Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-status" className="text-xs font-bold">
                    Status
                  </Label>
                  <select
                    id="edit-status"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs font-bold"
                  >
                    <option value="active">Active</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="redeemed">Redeemed</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-expiry-date" className="text-xs font-bold">
                    Expiry Date
                  </Label>
                  <Input
                    id="edit-expiry-date"
                    type="date"
                    value={editExpiryDate}
                    onChange={(e) => setEditExpiryDate(e.target.value)}
                    className="h-10 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-notes" className="text-xs font-bold">
                  Internal Reference Notes
                </Label>
                <Input
                  id="edit-notes"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Changed min spend to ₹300"
                  className="h-10 rounded-xl text-xs"
                />
              </div>

              <DialogFooter className="pt-3 flex flex-col sm:flex-row justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleDeleteCoupon(editingCoupon)}
                  className="text-destructive hover:bg-destructive/10 rounded-full text-xs font-bold self-start sm:self-auto"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Permanently
                </Button>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditCouponModalOpen(false)}
                    className="rounded-full text-xs font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updatingCoupon}
                    className="rounded-full text-xs font-bold shadow-md bg-primary text-primary-foreground"
                  >
                    {updatingCoupon ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ===================== MODAL 3: EDIT AUTOMATIC OFFER TIER ===================== */}
      <Dialog open={isOfferModalOpen} onOpenChange={setIsOfferModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Edit Automatic Discount Tier
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure minimum cart value and automatic discount amount for this tier.
            </DialogDescription>
          </DialogHeader>

          {editingOffer && (
            <form onSubmit={handleSaveOfferSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="offer-title" className="text-xs font-bold">
                  Offer Title
                </Label>
                <Input
                  id="offer-title"
                  required
                  value={editingOffer.title || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                  placeholder="e.g. ₹50 OFF on orders ₹500+"
                  className="h-10 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="offer-min" className="text-xs font-bold">
                    Minimum Cart Value (₹)
                  </Label>
                  <Input
                    id="offer-min"
                    type="number"
                    min="1"
                    required
                    value={editingOffer.minimumAmount ?? ''}
                    onChange={(e) => setEditingOffer({ ...editingOffer, minimumAmount: Number(e.target.value) })}
                    className="h-10 rounded-xl font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="offer-disc" className="text-xs font-bold">
                    Discount Value (₹)
                  </Label>
                  <Input
                    id="offer-disc"
                    type="number"
                    min="1"
                    required
                    value={editingOffer.discountAmount ?? ''}
                    onChange={(e) => setEditingOffer({ ...editingOffer, discountAmount: Number(e.target.value) })}
                    className="h-10 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border bg-secondary/20">
                <Label htmlFor="offer-active-switch" className="text-xs font-bold cursor-pointer">
                  Enable this Discount Tier
                </Label>
                <Switch
                  id="offer-active-switch"
                  checked={editingOffer.active !== false}
                  onCheckedChange={(checked) => setEditingOffer({ ...editingOffer, active: checked })}
                />
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="rounded-full text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingOffer}
                  className="rounded-full text-xs font-bold shadow-md"
                >
                  {savingOffer ? 'Saving...' : 'Save Offer'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
