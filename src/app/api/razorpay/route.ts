import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/firebase/admin';
import { isRateLimited, verifyCsrf, verifyAppCheck } from '@/utils/security';
import { logger } from '@/utils/logger';
import { PRODUCTS } from '@/lib/data';
import { getItemDeliveryCharge } from '@/utils/customization';
import {
  calculateAutomaticDiscount,
  resolvePromotionalDiscounts,
  validateCouponEligibility,
  calculateRazorpayBufferedTotal,
  DEFAULT_AUTOMATIC_OFFERS,
} from '@/utils/discount';
import { PromotionalOffer } from '@/types/promotions';

export const runtime = 'nodejs';

type CheckoutItemInput = {
  productId: string;
  quantity: number;
  selectedSize?: string | undefined;
  customPhotos?: {
    imageUrl: string;
    fileName: string;
    contentType: string;
    fileSize: number;
    uploadedAt: string;
  }[] | undefined;
  customText?: string | undefined;
};

type ShippingInput = {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

type ProductData = {
  name?: string;
  price?: number;
  image?: string;
  category?: string;
  dimensions?: string;
  active?: boolean;
  sizes?: { name: string; price: number }[];
  deliveryCharge?: 'complimentary' | 'regular' | number;
  weight?: number;
};

const CURRENCY = 'INR';
const SHIPPING_FEE = 0;
const MAX_QUANTITY_PER_LINE = 25;
const MAX_LINE_ITEMS = 50;

function getRazorpayClient() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay keys are not configured.');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function parseShipping(value: unknown): ShippingInput {
  const shipping = value as Partial<ShippingInput>;
  const parsed = {
    name: cleanString(shipping?.name, 100),
    phone: cleanString(shipping?.phone, 20),
    address: cleanString(shipping?.address, 300),
    city: cleanString(shipping?.city, 100),
    state: cleanString(shipping?.state, 100),
    pincode: cleanString(shipping?.pincode, 20),
  };

  if (!parsed.name || !parsed.phone || !parsed.address || !parsed.city || !parsed.state || !parsed.pincode) {
    throw new Error('Shipping details are incomplete.');
  }

  return parsed;
}

function parseItems(value: unknown): CheckoutItemInput[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_LINE_ITEMS) {
    throw new Error('Cart is empty or invalid.');
  }

  return value.map((item) => {
    const candidate = item as Partial<CheckoutItemInput>;
    const productId = cleanString(candidate.productId, 150);
    const quantity = Number(candidate.quantity);

    if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_LINE) {
      throw new Error('Cart contains an invalid item.');
    }

    const selectedSize = cleanString(candidate.selectedSize, 100) || undefined;
    const customPhotos = Array.isArray(candidate.customPhotos)
      ? candidate.customPhotos
          .map((photo: any) => {
            if (!photo || typeof photo !== 'object') return null;
            return {
              imageUrl: cleanString(photo.imageUrl, 2000),
              fileName: cleanString(photo.fileName, 500),
              contentType: cleanString(photo.contentType, 100),
              fileSize: Number(photo.fileSize) || 0,
              uploadedAt: cleanString(photo.uploadedAt, 100),
            };
          })
          .filter((photo): photo is NonNullable<typeof photo> => !!photo && !!photo.imageUrl)
          .slice(0, 50)
      : undefined;
    const customText = cleanString(candidate.customText, 500) || undefined;

    return { productId, quantity, selectedSize, customPhotos, customText };
  });
}

async function getCreatedBy(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;

  if (!token) {
    return { uid: 'guest', email: undefined };
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token, true);
    return { uid: decoded.uid, email: decoded.email };
  } catch (error) {
    logger.warn('Token verification failed or session revoked', { error });
    throw new Error('Invalid authentication token.');
  }
}

function getUnitPrice(product: ProductData, selectedSize?: string) {
  let basePrice = product.price;
  if (selectedSize) {
    const size = product.sizes?.find((candidate) => candidate.name === selectedSize);
    if (!size || typeof size.price !== 'number' || size.price < 0) {
      throw new Error(`Selected size is not available for ${product.name || 'product'}.`);
    }
    basePrice = size.price;
  }

  if (typeof basePrice !== 'number' || basePrice < 0) {
    throw new Error(`Product price is invalid for ${product.name || 'product'}.`);
  }

  return Math.round(basePrice); // Price already includes Razorpay gateway fee (baked into DB price)
}

async function buildServerCalculatedOrder(items: CheckoutItemInput[], state: string) {
  const adminDb = getAdminDb();

  // Load global settings
  let giftWrapPrice = 50;
  let deliverySettings: any = null;
  try {
    const settingsSnap = await adminDb.collection('settings').doc('global').get();
    if (settingsSnap.exists) {
      const data = settingsSnap.data();
      if (typeof data?.giftWrapPrice === 'number') {
        giftWrapPrice = data.giftWrapPrice;
      }
      deliverySettings = {
        lampDeliveryCharge: data?.lampDeliveryCharge,
        mdfDeliveryCharge: data?.mdfDeliveryCharge,
        largeFrameDeliveryCharge: data?.largeFrameDeliveryCharge,
        tnDeliveryMultiplier: data?.tnDeliveryMultiplier,
        otherDeliveryMultiplier: data?.otherDeliveryMultiplier,
      };
    }
  } catch (err) {
    logger.error('Error fetching global settings for checkout verification', err);
  }

  const lineItems = [];
  let subtotal = 0;
  let shippingFee = 0;

  for (const item of items) {
    let product: ProductData | undefined;

    if (item.productId === 'upsell_wrap') {
      product = {
        name: 'Premium Gift Wrap',
        price: giftWrapPrice,
        image: '/assets/premium_gift_wrap.png',
        category: 'Customized Gifts',
        active: true,
        deliveryCharge: 'complimentary'
      };
    } else {
      let productSnap = await adminDb.collection('products').doc(item.productId).get();

      if (productSnap.exists) {
        product = productSnap.data() as ProductData;
      } else {
        // Fallback: Check if item.productId is a static product slug
        const staticProduct = PRODUCTS.find((p) => p.id === item.productId);
        if (staticProduct) {
          // Query by name to see if it is seeded under a different auto-generated Firestore ID
          const querySnap = await adminDb
            .collection('products')
            .where('name', '==', staticProduct.name)
            .limit(1)
            .get();

          if (!querySnap.empty) {
            product = querySnap.docs[0]?.data() as ProductData;
          } else {
            product = staticProduct as any as ProductData;
          }
        }
      }
    }

    if (!product) {
      throw new Error('One or more products are no longer available.');
    }

    if (product.active === false) {
      throw new Error(`${product.name || 'A product'} is not available for purchase.`);
    }

    const itemDeliveryCharge = getItemDeliveryCharge({
      name: product.name || '',
      category: product.category || '',
      dimensions: product.dimensions || '',
      deliveryCharge: product.deliveryCharge,
      weight: product.weight
    }, state, deliverySettings || undefined);
    shippingFee += itemDeliveryCharge * item.quantity;

    const unitPrice = getUnitPrice(product, item.selectedSize);
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    lineItems.push({
      id: `${item.productId}:${item.selectedSize || 'default'}:${lineItems.length}`,
      productId: item.productId,
      name: product.name || 'Product',
      price: unitPrice,
      quantity: item.quantity,
      image: product.image || '',
      category: product.category,
      selectedSize: item.selectedSize,
      customPhotos: item.customPhotos || [],
      customText: item.customText || undefined,
    });
  }

  const total = subtotal + shippingFee;
  if (!Number.isFinite(total) || total <= 0) {
    throw new Error('Order total is invalid.');
  }

  return {
    items: lineItems,
    subtotal,
    shippingFee,
    total,
    amountPaise: Math.round(total * 100),
  };
}

export async function POST(request: Request) {
  try {
    // 1. CSRF Protection
    if (!verifyCsrf(request)) {
      return NextResponse.json({ error: 'CSRF verification failed.' }, { status: 403 });
    }

    // 2. API Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    if (isRateLimited(ip, 10, 60000)) { // 10 requests per minute
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    // 3. Firebase App Check Protection
    const isAppCheckValid = await verifyAppCheck(request);
    if (!isAppCheckValid) {
      return NextResponse.json({ error: 'Unauthorized application environment.' }, { status: 401 });
    }

    const body = await request.json();
    const adminDb = getAdminDb();
    const inputItems = parseItems(body.items);
    const shipping = parseShipping(body.shipping);
    const createdBy = await getCreatedBy(request);
    const couponCode = cleanString(body.couponCode, 50).toUpperCase();
    const calculated = await buildServerCalculatedOrder(inputItems, shipping.state);
    
    // --- 1. Fetch promotional offers and global discount settings from Firestore ---
    let isAutomaticDiscountEnabled = true;
    let promotionalOffers: PromotionalOffer[] = DEFAULT_AUTOMATIC_OFFERS;

    try {
      const settingsSnap = await adminDb.collection('settings').doc('global').get();
      if (settingsSnap.exists) {
        const sData = settingsSnap.data();
        if (typeof sData?.automaticDiscountsEnabled === 'boolean') {
          isAutomaticDiscountEnabled = sData.automaticDiscountsEnabled;
        }
      }

      const offersSnap = await adminDb.collection('promotional_offers').get();
      if (!offersSnap.empty) {
        promotionalOffers = offersSnap.docs
          .map((d) => ({ offerId: d.id, ...(d.data() as any) }))
          .filter((o) => o.active !== false);
      }
    } catch (err) {
      logger.warn('Failed to load promotional configuration, using defaults', err);
    }

    // --- 2. Discounts are strictly customer-selected: No automatic discounts applied ---
    const autoDiscountResult = {
      discountAmount: 0,
      discountPaise: 0,
      appliedOffer: null,
    };

    // --- 3. Validate Coupon (if provided) server-side ---
    let validatedCoupon: { code: string; discountAmount: number; type?: string; value?: number } | null = null;
    let couponSource: 'customer_coupons' | 'coupons' | null = null;

    if (couponCode) {
      // Check customer_coupons collection first
      const custCouponSnap = await adminDb.collection('customer_coupons').doc(couponCode).get();
      if (custCouponSnap.exists) {
        const custData = custCouponSnap.data();
        if (custData) {
          const eligibility = validateCouponEligibility(
            {
              couponCode,
              discountAmount: Number(custData.discountAmount || 50),
              minimumPurchase: Number(custData.minimumPurchase || 300),
              customerPhone: custData.customerPhone || null,
              status: custData.status || 'active',
              issuedAt: custData.issuedAt,
              expiresAt: custData.expiresAt,
            },
            calculated.subtotal,
            shipping.phone
          );

          if (eligibility.valid) {
            validatedCoupon = {
              code: couponCode,
              discountAmount: eligibility.discountAmount,
              type: 'flat',
              value: custData.discountAmount || 50,
            };
            couponSource = 'customer_coupons';
          } else if (calculated.subtotal >= 300) {
            // Subtotal dropped below coupon requirement: auto-downgrade to PGK15 (₹50 OFF)
            validatedCoupon = {
              code: 'PGK15',
              discountAmount: Math.min(50, calculated.subtotal),
              type: 'flat',
              value: 50,
            };
            couponSource = 'coupons';
          }
        }
      } else if (couponCode === 'BUNNY15' || couponCode === 'WELCOME10') {
        // Retired legacy codes
        validatedCoupon = null;
      } else if (couponCode === 'PGK15') {
        if (calculated.subtotal >= 300) {
          validatedCoupon = {
            code: 'PGK15',
            discountAmount: Math.min(50, calculated.subtotal),
            type: 'flat',
            value: 50,
          };
          couponSource = 'coupons';
        } else {
          validatedCoupon = null;
        }
      } else if (couponCode === 'PGK100') {
        if (calculated.subtotal >= 700) {
          validatedCoupon = {
            code: 'PGK100',
            discountAmount: Math.min(100, calculated.subtotal),
            type: 'flat',
            value: 100,
          };
          couponSource = 'coupons';
        } else if (calculated.subtotal >= 300) {
          // Changed order: auto-downgrade to lesser value coupon PGK15 (₹50 OFF)
          validatedCoupon = {
            code: 'PGK15',
            discountAmount: Math.min(50, calculated.subtotal),
            type: 'flat',
            value: 50,
          };
          couponSource = 'coupons';
        } else {
          validatedCoupon = null;
        }
      } else {
        // Fallback: Check legacy coupons collection
        const legacyCouponSnap = await adminDb.collection('coupons').doc(couponCode).get();
        if (legacyCouponSnap.exists) {
          const legacyData = legacyCouponSnap.data();
          if (legacyData) {
            const isCouponActive = legacyData.active === true;
            const isExpiryValid = !legacyData.expiresAt || new Date(legacyData.expiresAt).getTime() > Date.now();
            const isLimitValid = legacyData.usageLimit === undefined || legacyData.usageLimit === null || (legacyData.usageCount || 0) < legacyData.usageLimit;
            const isMinAmountValid = !legacyData.minOrderAmount || calculated.subtotal >= Number(legacyData.minOrderAmount);

            if (isCouponActive && isExpiryValid && isLimitValid) {
              if (isMinAmountValid) {
                const val = Number(legacyData.value || 0);
                const disc = legacyData.type === 'percentage'
                  ? Math.min(Math.round((calculated.subtotal * val) / 100), 100)
                  : val;
                validatedCoupon = {
                  code: couponCode,
                  discountAmount: Math.min(disc, calculated.subtotal),
                  type: 'flat',
                  value: disc,
                };
                couponSource = 'coupons';
              } else if (calculated.subtotal >= 300) {
                // Minimum purchase not met due to order change: auto-downgrade to PGK15 (₹50 OFF)
                validatedCoupon = {
                  code: 'PGK15',
                  discountAmount: Math.min(50, calculated.subtotal),
                  type: 'flat',
                  value: 50,
                };
                couponSource = 'coupons';
              }
            }
          }
        }
      }
    }

    // --- 4. Discounts are customer-selected only: Apply validated coupon or ₹0 ---
    const discountAmount = validatedCoupon ? validatedCoupon.discountAmount : 0;
    const discountType = validatedCoupon ? 'coupon' : 'none';
    const activeCouponCode = validatedCoupon ? validatedCoupon.code : null;

    const appliedCoupon = validatedCoupon && discountType === 'coupon'
      ? {
          code: validatedCoupon.code,
          type: (validatedCoupon.type || 'flat') as 'percentage' | 'flat',
          value: validatedCoupon.value || validatedCoupon.discountAmount,
          discount: discountAmount,
          source: couponSource,
        }
      : null;

    // Base order amount needed: (subtotal + shipping - discount)
    const baseTotal = Math.max(0, calculated.subtotal + calculated.shippingFee - discountAmount);
    // Option 3: Dynamic fee buffer ensures merchant receives 100% full net settlement after Razorpay's 2.36% fee & GST
    const { finalTotal, gatewayFee } = calculateRazorpayBufferedTotal(baseTotal);
    const amountPaise = Math.round(finalTotal * 100);

    const razorpay = getRazorpayClient();
    const receipt = `PGK-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`.slice(0, 40);

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: CURRENCY,
      receipt,
      notes: {
        createdBy: createdBy.uid,
        discountType,
        appliedCoupon: activeCouponCode || 'none',
      },
    });

    await adminDb.collection('razorpayOrders').doc(order.id).set(sanitizeObject({
      razorpayOrderId: order.id,
      receipt,
      currency: CURRENCY,
      amount: amountPaise,
      serverCalculatedTotal: finalTotal,
      finalAmount: finalTotal,
      subtotal: calculated.subtotal,
      shippingFee: calculated.shippingFee,
      shippingCharge: calculated.shippingFee,
      discount: discountAmount,
      discountAmount,
      discountType,
      gatewayFee,
      couponCode: activeCouponCode || null,
      appliedCoupon,
      items: calculated.items,
      shipping,
      createdBy: createdBy.uid,
      customerEmail: createdBy.email,
      status: 'created',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }));

    logger.info('Razorpay order created successfully with validated discount', {
      orderId: order.id,
      uid: createdBy.uid,
      subtotal: calculated.subtotal,
      discountAmount,
      discountType,
      finalTotal,
    });

    return NextResponse.json({
      id: order.id,
      amount: amountPaise,
      currency: CURRENCY,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    let message = 'Failed to create Razorpay order.';
    if (error instanceof Error) {
      message = error.message;
    } else if (error && typeof error === 'object') {
      message = error.message || error.description || JSON.stringify(error);
    } else if (typeof error === 'string') {
      message = error;
    }
    const status = message.includes('Invalid authentication') ? 401 : 400;
    logger.error('Error in razorpay order creation endpoint', error, { status });
    return NextResponse.json({ error: message }, { status });
  }
}

function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  if (obj instanceof FieldValue) return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  const sanitized: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      sanitized[key] = sanitizeObject(val);
    }
  }
  return sanitized;
}
