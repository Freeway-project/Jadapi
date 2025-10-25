import { DeliveryOrderDoc } from "../models/DeliveryOrder";
import { UserDoc } from "../models/user.model";

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  orderId: string;

  // Customer details
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    businessName?: string;
    gstNumber?: string;
  };

  // Delivery details
  delivery: {
    pickup: {
      address: string;
      contactName?: string;
      contactPhone?: string;
    };
    dropoff: {
      address: string;
      contactName?: string;
      contactPhone?: string;
    };
    packageSize: string;
    distance: number;
    estimatedDuration: number;
  };

  // Pricing breakdown
  pricing: {
    baseFare: number;
    distanceFare: number;
    subtotal: number;
    tax: number;
    taxRate: number;
    couponDiscount?: number;
    couponCode?: string;
    total: number;
    currency: string;
  };

  // Payment details
  payment: {
    method: string;
    status: string;
    paidAt: string;
    transactionId?: string;
  };

  // Order status
  status: string;
  createdAt: string;
}

export class InvoiceService {
  /**
   * Generate invoice number from order ID and date
   */
  static generateInvoiceNumber(orderId: string, date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    // Extract last 6 chars of orderId for invoice number
    const orderRef = orderId.slice(-6).toUpperCase();
    return `INV-${year}${month}-${orderRef}`;
  }

  /**
   * Generate invoice data from order and user
   */
  static generateInvoice(order: DeliveryOrderDoc, user: UserDoc, paymentId?: string): InvoiceData {
    const invoiceDate = new Date();
    const invoiceNumber = this.generateInvoiceNumber(order.orderId, invoiceDate);

    // Calculate tax rate (reverse calculation from tax amount)
    const taxRate = order.pricing.subtotal > 0
      ? (order.pricing.tax / order.pricing.subtotal) * 100
      : 0;

    return {
      invoiceNumber,
      invoiceDate: invoiceDate.toISOString(),
      orderId: order.orderId,

      customer: {
        name: user.profile?.name || 'Customer',
        email: user.auth?.email || undefined,
        phone: user.auth?.phone || undefined,
        address: user.profile?.address || undefined,
        businessName: user.businessProfile?.businessName || undefined,
        gstNumber: user.businessProfile?.gstNumber || undefined,
      },

      delivery: {
        pickup: {
          address: order.pickup.address,
          contactName: order.pickup.contactName,
          contactPhone: order.pickup.contactPhone,
        },
        dropoff: {
          address: order.dropoff.address,
          contactName: order.dropoff.contactName,
          contactPhone: order.dropoff.contactPhone,
        },
        packageSize: order.package.size,
        distance: order.distance.km,
        estimatedDuration: order.distance.durationMinutes,
      },

      pricing: {
        baseFare: order.pricing.baseFare,
        distanceFare: order.pricing.distanceFare,
        subtotal: order.pricing.subtotal,
        tax: order.pricing.tax,
        taxRate: Math.round(taxRate * 100) / 100, // Round to 2 decimals
        couponDiscount: order.pricing.couponDiscount,
        couponCode: order.coupon?.code,
        total: order.pricing.total,
        currency: order.pricing.currency,
      },

      payment: {
        method: 'Card',
        status: order.paymentStatus,
        paidAt: order.timeline.createdAt.toISOString(),
        transactionId: paymentId,
      },

      status: order.status,
      createdAt: order.createdAt.toISOString(),
    };
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount: number, currency: string = 'CAD'): string {
    return `${currency} $${(amount / 100).toFixed(2)}`;
  }

  /**
   * Get template variables for invoice email
   * Formats invoice data for email template rendering
   */
  static getInvoiceTemplateVariables(invoice: InvoiceData): Record<string, any> {
    const formatCurrency = (amount: number) => this.formatCurrency(amount, invoice.pricing.currency);
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formatDateTime = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      // Invoice meta
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: formatDate(invoice.invoiceDate),
      orderId: invoice.orderId,

      // Customer info
      customerName: invoice.customer.name,
      customerBusinessName: invoice.customer.businessName || '',
      customerEmail: invoice.customer.email || '',
      customerPhone: invoice.customer.phone || '',
      customerAddress: invoice.customer.address || '',
      customerGstNumber: invoice.customer.gstNumber || '',

      // Delivery info
      pickupAddress: invoice.delivery.pickup.address,
      pickupContactName: invoice.delivery.pickup.contactName || '',
      pickupContactPhone: invoice.delivery.pickup.contactPhone || '',
      dropoffAddress: invoice.delivery.dropoff.address,
      dropoffContactName: invoice.delivery.dropoff.contactName || '',
      dropoffContactPhone: invoice.delivery.dropoff.contactPhone || '',
      packageSize: invoice.delivery.packageSize,
      distance: invoice.delivery.distance.toFixed(2),

      // Pricing
      baseFare: formatCurrency(invoice.pricing.baseFare),
      distanceFare: formatCurrency(invoice.pricing.distanceFare),
      subtotal: formatCurrency(invoice.pricing.subtotal),
      tax: formatCurrency(invoice.pricing.tax),
      taxRate: invoice.pricing.taxRate.toFixed(2),
      hasDiscount: invoice.pricing.couponDiscount && invoice.pricing.couponDiscount > 0 ? 'Yes' : '',
      discount: invoice.pricing.couponDiscount ? formatCurrency(invoice.pricing.couponDiscount) : '',
      couponCode: invoice.pricing.couponCode || '',
      total: formatCurrency(invoice.pricing.total),

      // Payment
      paymentMethod: invoice.payment.method,
      paymentStatus: invoice.payment.status.toUpperCase(),
      paymentDate: formatDateTime(invoice.payment.paidAt),
      transactionId: invoice.payment.transactionId || '',
    };
  }

  /**
   * Generate HTML invoice email from invoice data
   */
  static generateInvoiceEmail(invoice: InvoiceData): string {
    const fs = require('fs');
    const path = require('path');

    const templatePath = path.join(__dirname, '../templates/emails/invoice-payment.html');
    let template = fs.readFileSync(templatePath, 'utf-8');

    const variables = this.getInvoiceTemplateVariables(invoice);

    // Simple template replacement (no Mustache/Handlebars support)
    // Replace all {{variable}} patterns and handle conditionals manually
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      template = template.replace(regex, String(value));
    }

    // Remove Mustache-style conditionals since TemplateService doesn't support them
    // Remove {{#variable}}...{{/variable}} blocks where variable is empty
    template = this.removeEmptyConditionals(template, variables);

    return template;
  }

  /**
   * Generate plain text invoice email from invoice data
   */
  static generateInvoiceTextEmail(invoice: InvoiceData): string {
    const fs = require('fs');
    const path = require('path');

    const templatePath = path.join(__dirname, '../templates/emails/invoice-payment.txt');
    let template = fs.readFileSync(templatePath, 'utf-8');

    const variables = this.getInvoiceTemplateVariables(invoice);

    // Simple template replacement
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      template = template.replace(regex, String(value));
    }

    // Remove Mustache-style conditionals
    template = this.removeEmptyConditionals(template, variables);

    return template;
  }

  /**
   * Remove empty conditional blocks from template
   * Handles {{#variable}}...{{/variable}} syntax
   */
  private static removeEmptyConditionals(template: string, variables: Record<string, any>): string {
    let result = template;

    // Find all conditional blocks
    const conditionalRegex = /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;

    result = result.replace(conditionalRegex, (_match, varName, content) => {
      const value = variables[varName];
      // Keep content if variable has a truthy value
      if (value && value !== '' && value !== 'false' && value !== '0') {
        return content;
      }
      // Remove content if variable is falsy
      return '';
    });

    return result;
  }
}
