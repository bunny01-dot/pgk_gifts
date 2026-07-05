import { logger } from '@/utils/logger';

export class WhatsappService {
  private accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  private phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  private adminNumber = process.env.WHATSAPP_ADMIN_RECIPIENT; // e.g. "919876543210"

  /**
   * Sends an automated alert to the Store Owner when a new order is completed.
   */
  async sendAdminOrderNotification(order: any) {
    if (!this.accessToken || !this.phoneNumberId || !this.adminNumber) {
      logger.info('WhatsApp admin notifications not fully configured. Skipping message.');
      return;
    }

    const cleanAdminNum = this.formatPhoneNumber(this.adminNumber);
    const messageText = `🔔 *New Order Received!*\n\n*Order ID:* #${order.orderId}\n*Customer:* ${order.customerName}\n*Phone:* ${order.phone}\n*Total Amount:* Rs. ${order.total}\n*Shipping City:* ${order.city || 'N/A'}, ${order.state || 'N/A'}\n\nView details in Admin Dashboard: https://pgk-gifts.web.app/admin`;

    await this.sendTextMessage(cleanAdminNum, messageText);
  }

  /**
   * Sends an automated receipt/confirmation message to the customer.
   */
  async sendCustomerOrderConfirmation(order: any) {
    if (!this.accessToken || !this.phoneNumberId || !order.phone) {
      return;
    }

    const cleanCustomerNum = this.formatPhoneNumber(order.phone);
    const trackingUrl = `https://pgk-gifts.web.app/track?id=${order.id || ''}`;
    const messageText = `🎉 *Order Confirmed!*\n\nHi ${order.customerName},\n\nWe have received your order *#${order.orderId}*! We are preparing it with care.\n\n🚚 *Track your shipment live here:* ${trackingUrl}\n\nThank you for shopping with PGK Gifts! ❤️`;

    await this.sendTextMessage(cleanCustomerNum, messageText);
  }

  private formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      // Default to India country code if 10 digits
      cleaned = `91${cleaned}`;
    }
    return cleaned;
  }

  private async sendTextMessage(to: string, text: string) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to,
            type: 'text',
            text: {
              preview_url: true,
              body: text,
            },
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        logger.error('WhatsApp API error response', data);
      } else {
        logger.info('WhatsApp message sent successfully', { to, messageId: data.messages?.[0]?.id });
      }
    } catch (err) {
      logger.error('Error sending WhatsApp message', err);
    }
  }
}
