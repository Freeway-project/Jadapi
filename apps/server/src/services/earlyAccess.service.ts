import { EarlyAccessRequest } from "../models/EarlyAccessRequest";
import { EmailService } from "../services/email.service";
import { ENV } from "../config/env";

interface EarlyAccessRequestData {
  pickupAddress: string;
  dropoffAddress: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  estimatedFare?: {
    distance?: number;
    total?: number;
    currency?: string;
  };
  notes?: string;
}

export class EarlyAccessService {
  static async createRequest(data: EarlyAccessRequestData) {
    const request = await EarlyAccessRequest.create({
      ...data,
      estimatedFare: data.estimatedFare ? {
        distance: data.estimatedFare.distance,
        total: data.estimatedFare.total,
        currency: data.estimatedFare.currency || "CAD"
      } : undefined,
      status: "pending",
      source: "web-app"
    });

    // Send email notification to admin if configured
    if (ENV.ADMIN_NOTIFICATION_EMAIL) {
      try {
        await this.sendAdminNotification(request);
      } catch (emailError) {
        // Log error but don't fail the request
        console.error('Failed to send admin notification email:', emailError);
      }
    }

    return request;
  }

  private static async sendAdminNotification(request: any) {
    const fareInfo = request.estimatedFare
      ? `\n  Distance: ${request.estimatedFare.distance?.toFixed(2)} km\n  Estimated Fare: ${request.estimatedFare.currency || 'CAD'} $${request.estimatedFare.total?.toFixed(2)}`
      : '';

    await EmailService.sendEmail({
      to: ENV.ADMIN_NOTIFICATION_EMAIL,
      subject: `New Early Access Request - ${request.contactName}`,
      text: `New early access request received:

Name: ${request.contactName}
Phone: ${request.contactPhone}
Email: ${request.contactEmail || 'Not provided'}

Pickup: ${request.pickupAddress}
Dropoff: ${request.dropoffAddress}${fareInfo}

Notes: ${request.notes || 'None'}

Request ID: ${request._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Early Access Request</h2>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Contact Information</h3>
            <p><strong>Name:</strong> ${request.contactName}</p>
            <p><strong>Phone:</strong> ${request.contactPhone}</p>
            <p><strong>Email:</strong> ${request.contactEmail || 'Not provided'}</p>
          </div>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Route Details</h3>
            <p><strong>Pickup:</strong> ${request.pickupAddress}</p>
            <p><strong>Dropoff:</strong> ${request.dropoffAddress}</p>
            ${request.estimatedFare ? `
              <p><strong>Distance:</strong> ${request.estimatedFare.distance?.toFixed(2)} km</p>
              <p><strong>Estimated Fare:</strong> ${request.estimatedFare.currency || 'CAD'} $${request.estimatedFare.total?.toFixed(2)}</p>
            ` : ''}
          </div>

          ${request.notes ? `
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Additional Notes</h3>
              <p>${request.notes}</p>
            </div>
          ` : ''}

          <p style="color: #6b7280; font-size: 12px;">Request ID: ${request._id}</p>
        </div>
      `
    });
  }
}