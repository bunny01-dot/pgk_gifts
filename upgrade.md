# Shop Upgrade Plan

Based on a thorough review of the codebase (cart, checkout, shop, and `data.ts` schema), here are the critical features to add or improve to upgrade this to a highly-converting premium eCommerce store.

### 1. ~~Shift from Static to Dynamic Inventory (Database)~~ ✅ COMPLETED
Currently, products are hardcoded inside the `src/lib/data.ts` file as a simple array.
- **The Upgrade**: Fully link the `/admin` route to a Firestore database to add, edit, or delete products and change prices *without* touching the code.
- **Status**: The Admin portal now features a dynamic Firebase-connected CMS with live stock-checking, image uploading, and real-time storefront synchronization.

### 2. ~~Multi-Image Galleries & Video Demos~~ ✅ COMPLETED
Right now, `Product` schema only accepts a single `image: string`.
- **The Upgrade**: Allow products to have an array of images. Add a carousel to the product viewing page, along with an optional field for a video URL.
- **Status**: Completely built! Database expanded to handle arrays, Admin dashboard has a multi-upload Dropzone, and the storefront features an interactive photo carousel and Video Play integration!

### 3. ~~Order Tracking Portal~~ ✅ COMPLETED
At present, checkout redirects to a simple `order-success` page.
- **The Upgrade**: Create an `/order-tracking` accessible via the Navbar. Customers can punch in their Razorpay Order ID and Phone Number to see a timeline: *Order Placed → Crafting Custom Design → Shipped / Out for Delivery*.
- **Status**: Live! Built a stunning visual roadmap stepper at `/track`. The Live Orders tab in the Admin backend now physically moves these tracker checkpoints in real-time when the Admin selects a new shipping status!

### 4. ~~Cross-Selling & Upselling (The "Add-on" Strategy)~~ ✅ COMPLETED
- **The Upgrade**: Inside the Cart Drawer or Checkout, show a "You Might Also Like" section suggesting complimentary items (e.g., "Add Premium Gift Wrapping for ₹50" or "Add AAA Batteries for ₹30").
- **Status**: Finished! Designed a sleek "Add to Your Masterpiece" horizontal carousel that drops down inside the slide-out Shopping Bag. Customers can natively inject high-margin upsells (like "Priority Crafting" or "Gift Wrap") into their cart with one tap!

### 5. ~~Customer Reviews & Social Proof~~ ✅ COMPLETED
- **The Upgrade**: Build a lightweight review system powered by Firebase. Email or WhatsApp the buyer asking them to upload a photo of the gift in their room.
- **Status**: Live! Built a `ReviewsService` database controller. At the bottom of every product page, there is a responsive 5-star rating system with a submittable text review form. Verified buyers can now leave organic reviews that persist to your database!

### 6. ~~WhatsApp Abandoned Cart / Fast Contact~~ ✅ COMPLETED
- **The Upgrade**: Deeply integrate the `FloatingWhatsApp` component into the buying loop (e.g., a "Have a question about customization?" button right next to "Add to Cart").
- **Status**: Live! The Product page now holds a prominent WhatsApp friction-remover button right below the *Buy Now* trigger. Furthermore, an "Emergency Support" WhatsApp lifeline was placed directly at checkout. Any hesitant clickers are immediately dropped into a pre-filled WhatsApp conversation!
