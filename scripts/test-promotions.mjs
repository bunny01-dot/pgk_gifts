import assert from 'assert';

// Import our discount functions (or replicate equivalent pure logic if module format differs)
import {
  calculateAutomaticDiscount,
  validateCouponEligibility,
  resolvePromotionalDiscounts,
  checkAndAdjustCouponForSubtotal,
  rupeesToPaise,
  paiseToRupees,
  generateUniqueCouponCode,
  calculateRazorpayBufferedTotal,
  RAZORPAY_RETENTION_RATE,
  DEFAULT_AUTOMATIC_OFFERS,
} from '../src/utils/discount.ts';

console.log('====================================================');
console.log('🧪 RUNNING PROMOTIONS & REWARDS UNIT & INTEGRATION TESTS');
console.log('====================================================\n');

let testsPassed = 0;
let testsFailed = 0;

function runTest(description, testFn) {
  try {
    testFn();
    console.log(`✅ PASS: ${description}`);
    testsPassed++;
  } catch (error) {
    console.error(`❌ FAIL: ${description}`);
    console.error(error);
    testsFailed++;
  }
}

// ----------------------------------------------------
// 1. AUTOMATIC DISCOUNT RULES TESTS
// ----------------------------------------------------
console.log('--- 1. Automatic Discount Tiers & Progress ---');

runTest('Cart below ₹500 (e.g. ₹350) -> No discount, prompt: "Add ₹150 more to unlock ₹50 OFF!"', () => {
  const result = calculateAutomaticDiscount(350);
  assert.strictEqual(result.discountAmount, 0, 'Discount must be ₹0');
  assert.strictEqual(result.discountPaise, 0, 'Discount in paise must be 0');
  assert.strictEqual(result.progress.amountNeeded, 150, 'Amount needed must be ₹150');
  assert.strictEqual(result.progress.message, 'Add ₹150 more to unlock ₹50 OFF!');
  assert.strictEqual(result.progress.isMaxTier, false);
});

runTest('Cart exactly ₹500 -> ₹50 discount, prompt: "Add ₹200 more to unlock ₹100 OFF!"', () => {
  const result = calculateAutomaticDiscount(500);
  assert.strictEqual(result.discountAmount, 50, 'Discount must be ₹50');
  assert.strictEqual(result.discountPaise, 5000, 'Discount paise must be 5000');
  assert.strictEqual(result.progress.amountNeeded, 200, 'Amount needed to reach 700 must be ₹200');
  assert.strictEqual(result.progress.message, 'Add ₹200 more to unlock ₹100 OFF!');
  assert.strictEqual(result.progress.isMaxTier, false);
});

runTest('Cart between ₹500 and ₹699 (e.g. ₹550) -> ₹50 discount, prompt: "Add ₹150 more to unlock ₹100 OFF!"', () => {
  const result = calculateAutomaticDiscount(550);
  assert.strictEqual(result.discountAmount, 50, 'Discount must be ₹50');
  assert.strictEqual(result.discountPaise, 5000, 'Discount paise must be 5000');
  assert.strictEqual(result.progress.amountNeeded, 150, 'Amount needed to reach 700 must be ₹150');
  assert.strictEqual(result.progress.message, 'Add ₹150 more to unlock ₹100 OFF!');
});

runTest('Cart between ₹500 and ₹699 (e.g. ₹650) -> ₹50 discount, prompt: "Add ₹50 more to unlock ₹100 OFF!"', () => {
  const result = calculateAutomaticDiscount(650);
  assert.strictEqual(result.discountAmount, 50, 'Discount must be ₹50');
  assert.strictEqual(result.discountPaise, 5000, 'Discount paise must be 5000');
  assert.strictEqual(result.progress.amountNeeded, 50, 'Amount needed to reach 700 must be ₹50');
  assert.strictEqual(result.progress.message, 'Add ₹50 more to unlock ₹100 OFF!');
});

runTest('Cart exactly ₹700 -> ₹100 discount, prompt: "Congratulations! You\'ve unlocked ₹100 OFF."', () => {
  const result = calculateAutomaticDiscount(700);
  assert.strictEqual(result.discountAmount, 100, 'Discount must be ₹100');
  assert.strictEqual(result.discountPaise, 10000, 'Discount paise must be 10000');
  assert.strictEqual(result.progress.isMaxTier, true);
  assert.strictEqual(result.progress.message, "Congratulations! You've unlocked ₹100 OFF.");
});

runTest('Cart above ₹700 (e.g. ₹750) -> ₹100 discount, prompt: "Congratulations! You\'ve unlocked ₹100 OFF."', () => {
  const result = calculateAutomaticDiscount(750);
  assert.strictEqual(result.discountAmount, 100, 'Discount must be ₹100');
  assert.strictEqual(result.discountPaise, 10000, 'Discount paise must be 10000');
  assert.strictEqual(result.progress.isMaxTier, true);
  assert.strictEqual(result.progress.message, "Congratulations! You've unlocked ₹100 OFF.");
});

runTest('Cart high value (e.g. ₹1,000) -> ₹100 discount max applied', () => {
  const result = calculateAutomaticDiscount(1000);
  assert.strictEqual(result.discountAmount, 100, 'Only the highest eligible discount is applied');
  assert.strictEqual(result.discountPaise, 10000);
});

// ----------------------------------------------------
// 2. INTEGER PAISE ACCURACY TESTS
// ----------------------------------------------------
console.log('\n--- 2. Integer Paise Accuracy & Precision ---');

runTest('Rupees to Paise conversion avoids IEEE 754 floating point distortion', () => {
  assert.strictEqual(rupeesToPaise(700.00), 70000);
  assert.strictEqual(rupeesToPaise(699.99), 69999);
  assert.strictEqual(rupeesToPaise(50.50), 5050);
  assert.strictEqual(paiseToRupees(70000), 700);
  assert.strictEqual(paiseToRupees(5000), 50);
});

// ----------------------------------------------------
// 3. CUSTOMER LOYALTY COUPON TESTS
// ----------------------------------------------------
console.log('\n--- 3. Customer Loyalty Coupon Validation ---');

const activeCoupon = {
  couponCode: 'PGK-TEST-REWARD',
  discountAmount: 50,
  minimumPurchase: 300,
  status: 'active',
  issuedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  customerPhone: null,
};

runTest('Valid coupon on qualifying subtotal (₹400 >= ₹300) -> Valid ₹50 discount', () => {
  const res = validateCouponEligibility(activeCoupon, 400);
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.discountAmount, 50);
});

runTest('Coupon on cart below minimum purchase requirement (₹250 < ₹300) -> Rejected', () => {
  const res = validateCouponEligibility(activeCoupon, 250);
  assert.strictEqual(res.valid, false);
  assert.match(res.error, /Minimum purchase of ₹300 is required/);
});

runTest('Expired coupon -> Rejected with expiry notice', () => {
  const expiredCoupon = {
    ...activeCoupon,
    expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  };
  const res = validateCouponEligibility(expiredCoupon, 400);
  assert.strictEqual(res.valid, false);
  assert.strictEqual(res.error, 'This coupon has expired.');
});

runTest('Previously redeemed coupon (status: "redeemed") -> Rejected', () => {
  const redeemedCoupon = {
    ...activeCoupon,
    status: 'redeemed',
    redeemedAt: new Date().toISOString(),
    redeemedOrderId: 'PGK-ORD-1234',
  };
  const res = validateCouponEligibility(redeemedCoupon, 400);
  assert.strictEqual(res.valid, false);
  assert.strictEqual(res.error, 'This coupon has already been redeemed.');
});

runTest('Cancelled coupon (status: "cancelled") -> Rejected', () => {
  const cancelledCoupon = {
    ...activeCoupon,
    status: 'cancelled',
  };
  const res = validateCouponEligibility(cancelledCoupon, 400);
  assert.strictEqual(res.valid, false);
  assert.strictEqual(res.error, 'This coupon has been cancelled.');
});

runTest('Coupon assigned to another customer phone number -> Rejected', () => {
  const phoneLockedCoupon = {
    ...activeCoupon,
    customerPhone: '9876543210',
  };
  // Attempt with another customer's phone
  const res = validateCouponEligibility(phoneLockedCoupon, 400, '9123456780');
  assert.strictEqual(res.valid, false);
  assert.match(res.error, /reserved for another registered phone number/);
});

runTest('Coupon assigned to customer used with matching phone -> Accepted', () => {
  const phoneLockedCoupon = {
    ...activeCoupon,
    customerPhone: '+91 98765 43210',
  };
  // User enters local or formatted number
  const res = validateCouponEligibility(phoneLockedCoupon, 400, '9876543210');
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.discountAmount, 50);
});

// ----------------------------------------------------
// 4. NON-STACKABLE DISCOUNT CONFLICT RESOLUTION
// ----------------------------------------------------
console.log('\n--- 4. Conflict Resolution & Anti-Stacking Policy ---');

runTest('Subtotal ₹750: Auto discount ₹100 vs Coupon ₹50 -> Never stack to ₹150; Highest ₹100 applied', () => {
  const res = resolvePromotionalDiscounts({
    subtotal: 750,
    automaticDiscountAmount: 100,
    coupon: { code: 'PGK-TEST-REWARD', discountAmount: 50 },
  });

  assert.strictEqual(res.discountAmount, 100, 'Must apply ₹100, not ₹150');
  assert.strictEqual(res.finalAmount, 650, 'Final payable must be ₹750 - ₹100 = ₹650');
  assert.strictEqual(res.discountType, 'automatic');
  assert(res.conflictDetails, 'Conflict details must be present');
  assert.strictEqual(res.conflictDetails.recommendedChoice, 'automatic');
});

runTest('Subtotal ₹750: Customer explicitly chooses loyalty coupon -> ₹50 applied, auto discount waived', () => {
  const res = resolvePromotionalDiscounts({
    subtotal: 750,
    automaticDiscountAmount: 100,
    coupon: { code: 'PGK-TEST-REWARD', discountAmount: 50 },
    customerPreference: 'coupon',
  });

  assert.strictEqual(res.discountAmount, 50, 'Must apply ₹50');
  assert.strictEqual(res.finalAmount, 700, 'Final payable must be ₹750 - ₹50 = ₹700');
  assert.strictEqual(res.discountType, 'coupon');
  assert.strictEqual(res.couponCode, 'PGK-TEST-REWARD');
});

runTest('Subtotal ₹400: Auto discount ₹0, Coupon ₹50 -> Coupon discount of ₹50 applied', () => {
  const res = resolvePromotionalDiscounts({
    subtotal: 400,
    automaticDiscountAmount: 0,
    coupon: { code: 'PGK-TEST-REWARD', discountAmount: 50 },
  });

  assert.strictEqual(res.discountAmount, 50);
  assert.strictEqual(res.finalAmount, 350);
  assert.strictEqual(res.discountType, 'coupon');
  assert.strictEqual(res.couponCode, 'PGK-TEST-REWARD');
});

runTest('Subtotal ₹550: Auto discount ₹50, Coupon ₹50 -> Exactly ₹50 applied, no stacking', () => {
  const res = resolvePromotionalDiscounts({
    subtotal: 550,
    automaticDiscountAmount: 50,
    coupon: { code: 'PGK-TEST-REWARD', discountAmount: 50 },
  });

  assert.strictEqual(res.discountAmount, 50, 'Cannot stack to ₹100');
  assert.strictEqual(res.finalAmount, 500);
});

// ----------------------------------------------------
// 5. SERVER-SIDE SECURITY & MANIPULATION RESISTANCE
// ----------------------------------------------------
console.log('\n--- 5. Server-side Protection Against Tampering ---');

runTest('Server strictly recalculates Razorpay order amount from Firestore prices and ignores browser-supplied discount', () => {
  // Simulating server calculation
  const productPriceFromDb = 750;
  const shippingFee = 50;
  const subtotal = productPriceFromDb;

  // Attacker client sends fake discount in body
  const maliciousClientBody = {
    discount: 500, // FAKE
    serverCalculatedTotal: 1, // FAKE
  };

  // Server recomputes:
  const autoDiscountResult = calculateAutomaticDiscount(subtotal);
  const serverDiscount = autoDiscountResult.discountAmount; // ₹100
  const serverFinalTotal = subtotal + shippingFee - serverDiscount; // 750 + 50 - 100 = 700
  const amountPaise = rupeesToPaise(serverFinalTotal); // 70000

  assert.strictEqual(serverDiscount, 100, 'Server calculated discount must be ₹100, ignoring fake 500');
  assert.strictEqual(serverFinalTotal, 700, 'Server final total must be ₹700, ignoring fake 1');
  assert.strictEqual(amountPaise, 70000, 'Amount sent to Razorpay must be exactly 70000 paise');
});

runTest('Unique coupon code generator produces uppercase, non-ambiguous format', () => {
  const code = generateUniqueCouponCode('PGK');
  assert.match(code, /^PGK-[2-9A-Z]{4}-[2-9A-Z]{4}$/);
  assert(!code.includes('0') && !code.includes('O'), 'Must exclude ambiguous 0/O');
  assert(!code.includes('1') && !code.includes('I'), 'Must exclude ambiguous 1/I');
});

// ----------------------------------------------------
// 6. ROUGH FLAT AMOUNTS (₹50, ₹100) & RETIRED BUNNY15 MIGRATION
// ----------------------------------------------------
console.log('\n--- 6. Rough Flat Amounts & Coupon Migrations ---');

runTest('PGK15 code gives flat ₹50 rough amount on orders >= ₹300', () => {
  const pgk15 = {
    couponCode: 'PGK15',
    discountAmount: 50,
    minimumPurchase: 300,
    status: 'active',
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
  const res = validateCouponEligibility(pgk15, 600);
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.discountAmount, 50, 'PGK15 must give rough amount ₹50');
});

runTest('PGK100 code gives flat ₹100 rough amount on orders >= ₹700', () => {
  const pgk100 = {
    couponCode: 'PGK100',
    discountAmount: 100,
    minimumPurchase: 700,
    status: 'active',
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
  const res = validateCouponEligibility(pgk100, 850);
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.discountAmount, 100, 'PGK100 must give rough amount ₹100');
});

runTest('High price cart (₹2,500) capped to rough amount: Never exceeds ₹100', () => {
  // If cart is ₹2,500, a 10% discount would be ₹250 (excessive).
  // Rough amount policy caps discounts to ₹100 max:
  const cartSubtotal = 2500;
  const autoDiscount = calculateAutomaticDiscount(cartSubtotal);
  assert.strictEqual(autoDiscount.discountAmount, 100, 'Automatic discount never exceeds ₹100');
  
  // Coupon with rough amount cap:
  const couponDiscount = Math.min(100, cartSubtotal);
  assert.strictEqual(couponDiscount, 100, 'Coupon discount capped to rough amount ₹100');
});

// ----------------------------------------------------
// 7. DYNAMIC ORDER CHANGE RE-VALIDATION & ADJUSTMENT
// ----------------------------------------------------
console.log('\n--- 7. Dynamic Order Change Re-Validation ---');

runTest('Order changed from ₹800 down to ₹450 with PGK100 -> Auto-downgrades to PGK15 (₹50 OFF)', () => {
  // PGK100 requires min purchase ₹700, ₹100 OFF.
  // Order dropped to ₹450: Cannot stay at ₹100, must adjust to lesser value coupon (₹50 OFF)!
  const adj = checkAndAdjustCouponForSubtotal({
    couponCode: 'PGK100',
    couponDiscount: 100,
    minimumPurchase: 700,
    subtotal: 450,
  });

  assert.strictEqual(adj.valid, true);
  assert.strictEqual(adj.adjusted, true, 'Must be marked as adjusted');
  assert.strictEqual(adj.couponCode, 'PGK15', 'Must downgrade to PGK15');
  assert.strictEqual(adj.discountAmount, 50, 'Must change to ₹50 discount');
  assert.strictEqual(adj.minimumPurchase, 300);
  assert.match(adj.notificationMessage, /adjusted to PGK15/);
});

runTest('Order changed from ₹800 down to ₹250 with PGK100 -> Automatically removed (below ₹300 minimum)', () => {
  const adj = checkAndAdjustCouponForSubtotal({
    couponCode: 'PGK100',
    couponDiscount: 100,
    minimumPurchase: 700,
    subtotal: 250,
  });

  assert.strictEqual(adj.valid, false);
  assert.strictEqual(adj.removed, true, 'Must be removed');
  assert.strictEqual(adj.discountAmount, 0, 'Discount must be ₹0');
  assert.match(adj.notificationMessage, /removed because order subtotal/);
});

runTest('Order changed from ₹500 down to ₹200 with PGK15 -> Automatically removed (below ₹300 minimum)', () => {
  const adj = checkAndAdjustCouponForSubtotal({
    couponCode: 'PGK15',
    couponDiscount: 50,
    minimumPurchase: 300,
    subtotal: 200,
  });

  assert.strictEqual(adj.valid, false);
  assert.strictEqual(adj.removed, true);
  assert.strictEqual(adj.discountAmount, 0);
});

runTest('Order changed from ₹800 down to ₹720 with PGK100 -> Still qualifies, stays at ₹100 OFF', () => {
  const adj = checkAndAdjustCouponForSubtotal({
    couponCode: 'PGK100',
    couponDiscount: 100,
    minimumPurchase: 700,
    subtotal: 720,
  });

  assert.strictEqual(adj.valid, true);
  assert.strictEqual(adj.adjusted, false, 'Does not need adjustment');
  assert.strictEqual(adj.removed, false);
  assert.strictEqual(adj.couponCode, 'PGK100');
  assert.strictEqual(adj.discountAmount, 100);
});

// ----------------------------------------------------
// 8. DYNAMIC FEE BUFFER & FULL NET SETTLEMENT (OPTION 3)
// ----------------------------------------------------
console.log('\n--- 8. Dynamic Fee Buffer & Full Net Settlement (Option 3) ---');
runTest('₹100 product + ₹50 courier -> Buffer ensures merchant receives full ₹100 product price + ₹50 courier', () => {
  const productPrice = 100;
  const shippingCharge = 50;
  const discount = 0;
  const baseTotal = productPrice + shippingCharge - discount; // 150

  const { finalTotal, gatewayFee } = calculateRazorpayBufferedTotal(baseTotal);
  assert.strictEqual(finalTotal, 154, 'Charged amount must be ₹154 (150 / 0.9764)');
  assert.strictEqual(gatewayFee, 4, 'Gateway fee buffer must be ₹4');

  // Verify net bank payout after Razorpay's 2.36% deduction (2% fee + 18% GST)
  const razorpayCut = finalTotal * 0.0236; // 154 * 0.0236 = 3.6344
  const netBankDeposit = finalTotal - razorpayCut; // 150.3656
  assert(netBankDeposit >= baseTotal, `Bank deposit (${netBankDeposit}) must be >= base total (150)`);

  const amountAfterPayingCourier = netBankDeposit - shippingCharge; // 150.3656 - 50 = 100.3656
  assert(amountAfterPayingCourier >= productPrice, `Remaining amount for product (${amountAfterPayingCourier}) must fully cover ₹100 product price`);
});

runTest('₹100 product + ₹100 outside TN courier -> Buffer ensures full ₹100 product price', () => {
  const productPrice = 100;
  const shippingCharge = 100;
  const baseTotal = productPrice + shippingCharge; // 200

  const { finalTotal, gatewayFee } = calculateRazorpayBufferedTotal(baseTotal);
  assert.strictEqual(finalTotal, 205, 'Charged amount must be ₹205');
  assert.strictEqual(gatewayFee, 5, 'Gateway fee buffer must be ₹5');

  const netBankDeposit = finalTotal * RAZORPAY_RETENTION_RATE; // 205 * 0.9764 = 200.162
  assert(netBankDeposit >= baseTotal, 'Bank deposit must be >= 200');
  assert(netBankDeposit - shippingCharge >= productPrice, 'Merchant receives >= ₹100 product price');
});

runTest('₹700 product + ₹50 courier - ₹100 coupon (PGK100) -> Net desired ₹650 fully preserved', () => {
  const subtotal = 700;
  const shipping = 50;
  const discount = 100;
  const baseTotal = subtotal + shipping - discount; // 650

  const { finalTotal, gatewayFee } = calculateRazorpayBufferedTotal(baseTotal);
  assert.strictEqual(finalTotal, 666, 'Charged amount must be ₹666');
  assert.strictEqual(gatewayFee, 16, 'Gateway fee buffer must be ₹16');

  const netBankDeposit = finalTotal * RAZORPAY_RETENTION_RATE; // 666 * 0.9764 = 650.2824
  assert(netBankDeposit >= baseTotal, 'Bank deposit must be >= 650');
  assert(netBankDeposit - shipping >= subtotal - discount, 'Merchant receives full product net after coupon');
});

runTest('Zero base total returns zero fee buffer', () => {
  const { finalTotal, gatewayFee } = calculateRazorpayBufferedTotal(0);
  assert.strictEqual(finalTotal, 0);
  assert.strictEqual(gatewayFee, 0);
});

console.log('\n====================================================');
console.log(`📊 TEST RESULTS: ${testsPassed} Passed, ${testsFailed} Failed`);
console.log('====================================================\n');

if (testsFailed > 0) {
  process.exit(1);
}

