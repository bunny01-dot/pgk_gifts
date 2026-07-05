# WhatsApp Automation Integration Guide

This guide describes how to configure and activate the automated WhatsApp notifications for **PGK Gifts**. The boilerplate code is already implemented in the backend services (`src/services/whatsapp.service.ts`) and triggers automatically upon order verification.

---

## 1. Setup Meta Developer Account
Meta's official Cloud API is the most cost-effective and secure way to send automated WhatsApp messages.

1. Go to the [Meta for Developers Portal](https://developers.facebook.com/).
2. Log in with your Facebook credentials and click **My Apps** > **Create App**.
3. Select **Other** > **Business** as the app type.
4. Provide an app name (e.g., `PGK Gifts Notifications`) and link it to your Facebook Business Manager Account.
5. In the app dashboard, scroll down to **Add products to your app** and click **Set up** under **WhatsApp**.

---

## 2. Generate Credentials
Meta provides test numbers initially. To switch to production:

1. **Add a Phone Number**:
   * Navigate to the WhatsApp **Setup** tab in your Meta Developer portal.
   * Add your business phone number (this number cannot be currently active on standard WhatsApp; it must be registered with the Business API).
2. **Retrieve Phone Number ID**:
   * Copy the **Phone Number ID** shown under the API setup page.
3. **Generate Permanent Access Token**:
   * By default, Meta issues a 24-hour temporary token. 
   * To create a permanent token, go to your **Facebook Business Manager** > **Users** > **System Users**.
   * Add a System User, generate a new token, and select the `whatsapp_business_messaging` and `whatsapp_business_management` permissions.
   * Copy the generated token.

---

## 3. Configuration (.env)
Add the generated credentials to your environment configuration (`.env` or `.env.local`):

```bash
# Meta WhatsApp Cloud API credentials
WHATSAPP_ACCESS_TOKEN=your_permanent_system_user_token
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
WHATSAPP_ADMIN_RECIPIENT=919876543210  # Include country code (91 for India) without '+'
```

---

## 4. Message Templates Setup
Meta requires business-initiated messages to be pre-approved as **Templates** to prevent spam.

1. In the Meta Developer Portal, go to **WhatsApp** > **Message Templates**.
2. Click **Create Template** and choose **Utility** as the category.
3. Define the template body:
   * **Admin Alert Template**:
     > 🔔 *New Order Received!*
     > 
     > *Order ID:* #{{1}}
     > *Customer:* {{2}}
     > *Phone:* {{3}}
     > *Total Amount:* Rs. {{4}}
     > *Shipping City:* {{5}}
     > 
     > View details in Admin Dashboard: https://pgk-gifts.web.app/admin
   * **Customer Confirmation Template**:
     > 🎉 *Order Confirmed!*
     > 
     > Hi {{1}},
     > 
     > We have received your order *#{{2}}*! We are preparing it with care.
     > 
     > 🚚 *Track your shipment live here:* https://pgk-gifts.web.app/track?id={{3}}
     > 
     > Thank you for shopping with PGK Gifts! ❤️
4. Submit both templates for review. Approval typically takes under 5 minutes.

---

## 5. Pricing (India Region)
* **User-initiated conversations**: First **1,000 conversations/month are free**.
* **Business-initiated (Utility)**: ~**Rs. 0.12 to Rs. 0.35** per 24-hour conversation window.
* **No monthly overhead**: You only pay Meta for the messages you actually send.
