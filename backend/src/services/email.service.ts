import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

export class EmailService {
  private static OWNER_EMAIL = 'Sisodiaatelier09@gmail.com';

  private static getSmtpCredentials() {
    const user = (
      process.env.SMTP_USER ||
      process.env.GMAIL_USER ||
      process.env.EMAIL_USER ||
      this.OWNER_EMAIL
    ).trim();

    const rawPass = (
      process.env.SMTP_PASS ||
      process.env.GMAIL_PASS ||
      process.env.EMAIL_PASS ||
      process.env.APP_PASSWORD
    );

    const pass = rawPass ? rawPass.replace(/\s+/g, '').trim() : undefined;

    return { user, pass };
  }

  static getTransporter() {
    const { user, pass } = this.getSmtpCredentials();

    if (!pass) {
      throw new Error(
        'SMTP configuration missing: SMTP_PASS / GMAIL_PASS is not defined in backend/.env'
      );
    }

    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user,
        pass,
      },
    });
  }

  static async verifyTransporter(): Promise<{ success: boolean; message: string }> {
    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      return {
        success: true,
        message: 'SMTP connection established and verified with smtp.gmail.com:465 (secure: true).',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `SMTP verification failed: ${err.message}`,
      };
    }
  }

  static async sendMail(options: {
    to: string;
    subject: string;
    html: string;
    replyTo?: string;
  }): Promise<boolean> {
    const { user, pass } = this.getSmtpCredentials();

    if (!pass) {
      const errDetail =
        'SMTP dispatch failed: SMTP_PASS is missing in backend/.env. Real Gmail App Password required.';
      logger.error(errDetail);
      throw new Error(errDetail);
    }

    try {
      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: `"SISODIA ATELIER ✧" <${user}>`,
        to: options.to,
        replyTo: options.replyTo,
        subject: options.subject,
        html: options.html,
      });
      logger.info(`Email successfully dispatched to ${options.to} [${options.subject}]`);
      return true;
    } catch (err: any) {
      const errorMsg = `SMTP dispatch failed to ${options.to}: ${err.message || 'Gmail SMTP rejection'}`;
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Send Inquiries (Contact, Bulk Trade, Custom Order, or Meeting Request) to Owner
   */
  static async sendInquiryNotification(inquiry: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string | null;
    country?: string | null;
    type?: string;
    subject?: string | null;
    message: string;
    preferredDateTime?: string | null;
  }): Promise<boolean> {
    const isMeeting = inquiry.type === 'MEETING_REQUEST' || !!inquiry.preferredDateTime;
    const emailSubject = isMeeting
      ? `[Consultation Scheduled] Meeting Request with ${inquiry.customerName} (${inquiry.preferredDateTime || 'TBD'})`
      : `[New ${inquiry.type || 'TRADE'} Inquiry] from ${inquiry.customerName} (${inquiry.country || 'Global'})`;

    const html = `
      <div style="background-color: #0d0c0a; color: #f4ece1; font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #171512; border: 1px solid #383127; border-radius: 4px; padding: 36px;">
          <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #2e2820; padding-bottom: 20px;">
            <h1 style="font-family: 'Georgia', serif; font-size: 24px; color: #dfb268; letter-spacing: 2px; margin: 0; text-transform: uppercase;">SISODIA ATELIER ✧</h1>
            <p style="color: #9c8e7b; font-size: 11px; letter-spacing: 1.5px; margin-top: 6px; text-transform: uppercase;">
              ${isMeeting ? 'Private Consultation & Meeting Desk' : 'Atelier Inquiries & Trade Communications'}
            </p>
          </div>

          <h2 style="font-family: 'Georgia', serif; font-size: 18px; color: #dfb268; margin-top: 0;">
            ${isMeeting ? 'New Consultation Request Scheduled' : 'New Inbound Customer Inquiry'}
          </h2>

          <div style="background-color: #211d17; border-left: 3px solid #dfb268; padding: 16px; margin: 20px 0; border-radius: 0 4px 4px 0;">
            <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Patron Name:</strong> ${inquiry.customerName}</p>
            <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Email:</strong> <a href="mailto:${inquiry.customerEmail}" style="color: #dfb268;">${inquiry.customerEmail}</a></p>
            <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Phone / WhatsApp:</strong> ${inquiry.customerPhone || 'Not provided'}</p>
            <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Destination Country:</strong> ${inquiry.country || 'International'}</p>
            <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Inquiry Category:</strong> <span style="background: #383127; padding: 2px 6px; border-radius: 2px; color: #dfb268;">${inquiry.type || 'CONTACT'}</span></p>
            ${isMeeting && inquiry.preferredDateTime ? `<p style="margin: 8px 0 0 0; font-size: 13px; color: #22c55e;"><strong>📅 Requested Meeting Slot:</strong> ${inquiry.preferredDateTime}</p>` : ''}
          </div>

          ${inquiry.subject ? `<p style="font-size: 14px; color: #dfb268; margin-bottom: 6px;"><strong>Subject:</strong> ${inquiry.subject}</p>` : ''}

          <div style="background-color: #12100d; border: 1px solid #2e2820; padding: 16px; border-radius: 4px; margin-top: 16px;">
            <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; color: #9c8e7b; letter-spacing: 1px;">Message / Commission Brief:</p>
            <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #e5ded2; white-space: pre-wrap;">${inquiry.message}</p>
          </div>

          <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #2e2820; font-size: 11px; color: #6d6254;">
            <p style="margin: 0;">SISODIA ATELIER ✧ • Woodcraft Export Cluster • Nagina, Bijnor 246762, India</p>
            <p style="margin: 4px 0 0 0;">Email: Sisodiaatelier09@gmail.com • WhatsApp: +91 88680 31460</p>
          </div>
        </div>
      </div>
    `;

    return this.sendMail({
      to: this.OWNER_EMAIL,
      replyTo: inquiry.customerEmail,
      subject: emailSubject,
      html,
    });
  }

  /**
   * Send Order Confirmation to Customer & Order Alert to Owner
   */
  static async sendOrderNotifications(order: {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string | null;
    firmName?: string | null;
    gstOrTaxId?: string | null;
    shippingAddress: string;
    city: string;
    postalCode: string;
    countryName: string;
    currencyCode: string;
    currencySymbol: string;
    totalForeign: number | string;
    totalINR: number | string;
    paymentGateway: string;
    trackingNumber?: string | null;
    items: Array<{ title: string; quantity: number; unitPrice: number | string }>;
  }): Promise<boolean> {
    const itemsHtml = (order.items || [])
      .map(
        (i) =>
          `<tr>
            <td style="padding: 10px; border-bottom: 1px solid #2e2820; font-family: 'Georgia', serif;">${i.title}</td>
            <td style="padding: 10px; border-bottom: 1px solid #2e2820; text-align: center;">${i.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #2e2820; text-align: right;">${order.currencySymbol} ${Number(i.unitPrice).toLocaleString()}</td>
          </tr>`
      )
      .join('');

    // 1. Customer Email
    const customerHtml = `
      <div style="background-color: #0d0c0a; color: #f4ece1; font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #171512; border: 1px solid #383127; border-radius: 4px; padding: 36px;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid #2e2820; padding-bottom: 20px;">
            <h1 style="font-family: 'Georgia', serif; font-size: 26px; color: #dfb268; letter-spacing: 2px; margin: 0; text-transform: uppercase;">SISODIA ATELIER ✧</h1>
            <p style="color: #9c8e7b; font-size: 11px; letter-spacing: 1.5px; margin-top: 6px; text-transform: uppercase;">Three Centuries of Living Timber • Nagina, India</p>
          </div>

          <h2 style="font-family: 'Georgia', serif; font-size: 20px; color: #f4ece1; margin-top: 0;">Salutations, ${order.customerName}</h2>
          <p style="color: #b5a796; line-height: 1.6; font-size: 14px;">
            Your royal heirloom consignment has been formally accepted by our master woodwrights under Waybill <strong style="color: #dfb268;">#${order.orderNumber}</strong>. Kiln moisture verification and ISPM-15 cedar vault crating have commenced.
          </p>

          <div style="background-color: #211d17; border-left: 3px solid #dfb268; padding: 14px 18px; margin: 24px 0; border-radius: 0 4px 4px 0;">
            <p style="margin: 0; font-size: 13px; color: #dfb268; font-weight: 600;">🛡️ 100% Delivered Duty Paid (DDP) Global Guarantee</p>
            <p style="margin: 6px 0 0 0; font-size: 12px; color: #a49786; line-height: 1.5;">
              All import duties, foreign tariffs, and customs clearances to ${order.countryName} are 100% pre-paid by SISODIA ATELIER ✧. You will never encounter unexpected carrier bills at your estate.
            </p>
          </div>

          <h3 style="font-family: 'Georgia', serif; font-size: 14px; color: #dfb268; letter-spacing: 1px; text-transform: uppercase; margin-top: 28px;">Heirloom Consignment Summary</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; color: #d6cab8;">
            <thead>
              <tr style="border-bottom: 1px solid #3d352b; color: #8f8270; text-transform: uppercase; font-size: 11px;">
                <th style="padding: 8px 10px; text-align: left;">Masterpiece</th>
                <th style="padding: 8px 10px; text-align: center;">Qty</th>
                <th style="padding: 8px 10px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 14px 10px; font-weight: bold; color: #f4ece1; text-align: right;">Total Investment:</td>
                <td style="padding: 14px 10px; font-weight: bold; color: #dfb268; text-align: right; font-size: 16px;">
                  ${order.currencySymbol} ${Number(order.totalForeign).toLocaleString()} (${order.currencyCode})
                </td>
              </tr>
            </tfoot>
          </table>

          <div style="margin-top: 24px; padding: 16px; background-color: #211d17; border-radius: 4px; font-size: 12px; color: #a49786; line-height: 1.6;">
            <p style="margin: 0;"><strong>Delivery Address:</strong> ${order.shippingAddress}, ${order.city} - ${order.postalCode}, ${order.countryName}</p>
            ${order.firmName ? `<p style="margin: 4px 0 0 0;"><strong>Estate / Firm:</strong> ${order.firmName} (Tax ID: ${order.gstOrTaxId || 'N/A'})</p>` : ''}
            <p style="margin: 4px 0 0 0;"><strong>Tracking Number:</strong> ${order.trackingNumber || 'SA-NAGINA-LATHE-5501'}</p>
            <p style="margin: 4px 0 0 0;"><strong>Payment Method:</strong> ${order.paymentGateway} (100% Pre-Paid Escrow)</p>
          </div>

          <div style="text-align: center; margin-top: 36px; padding-top: 20px; border-top: 1px solid #2e2820; font-size: 11px; color: #6d6254;">
            <p style="margin: 0;">SISODIA ATELIER ✧ • Woodcraft Export Cluster • Nagina, Bijnor 246762, India</p>
            <p style="margin: 4px 0 0 0;">Direct WhatsApp Concierge: <a href="https://wa.me/918868031460" style="color: #dfb268; text-decoration: none;">+91 88680 31460</a> • Email: Sisodiaatelier09@gmail.com</p>
          </div>
        </div>
      </div>
    `;

    // 2. Owner Alert Email
    const ownerHtml = `
      <div style="background-color: #0d0c0a; color: #f4ece1; font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #171512; border: 1px solid #383127; border-radius: 4px; padding: 36px;">
          <h1 style="font-family: 'Georgia', serif; font-size: 22px; color: #dfb268; margin-top: 0;">✧ NEW CONSIGNMENT ALLOCATED</h1>
          <p style="font-size: 13px; color: #e5ded2;">A new order has been received and logged in Neon PostgreSQL:</p>

          <div style="background-color: #211d17; border-left: 3px solid #22c55e; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 6px 0;"><strong>Order ID:</strong> ${order.orderNumber}</p>
            <p style="margin: 0 0 6px 0;"><strong>Patron:</strong> ${order.customerName} (<a href="mailto:${order.customerEmail}" style="color: #dfb268;">${order.customerEmail}</a>)</p>
            <p style="margin: 0 0 6px 0;"><strong>Phone:</strong> ${order.customerPhone || 'N/A'}</p>
            <p style="margin: 0 0 6px 0;"><strong>Destination:</strong> ${order.city}, ${order.countryName}</p>
            ${order.firmName ? `<p style="margin: 0 0 6px 0;"><strong>Firm / Tax ID:</strong> ${order.firmName} (${order.gstOrTaxId})</p>` : ''}
            <p style="margin: 0 0 6px 0;"><strong>Amount Foreign:</strong> ${order.currencyCode} ${order.totalForeign}</p>
            <p style="margin: 0;"><strong>Amount INR:</strong> ₹${Number(order.totalINR).toLocaleString('en-IN')}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; color: #d6cab8;">
            <thead>
              <tr style="border-bottom: 1px solid #3d352b; color: #8f8270; text-transform: uppercase; font-size: 11px;">
                <th style="padding: 8px 10px; text-align: left;">Item</th>
                <th style="padding: 8px 10px; text-align: center;">Qty</th>
                <th style="padding: 8px 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 24px; text-align: center;">
            <p style="font-size: 12px; color: #dfb268;">Check Owner Dashboard at /owner to assign courier waybill and update stage.</p>
          </div>
        </div>
      </div>
    `;

    // Send to both
    const sentCustomer = await this.sendMail({
      to: order.customerEmail,
      subject: `[Confirmed] SISODIA ATELIER ✧ Consignment #${order.orderNumber}`,
      html: customerHtml,
    });

    const sentOwner = await this.sendMail({
      to: this.OWNER_EMAIL,
      replyTo: order.customerEmail,
      subject: `[NEW ORDER] Consignment #${order.orderNumber} - ${order.customerName} (${order.currencyCode} ${order.totalForeign} / ₹${Number(order.totalINR).toLocaleString('en-IN')})`,
      html: ownerHtml,
    });

    return sentCustomer && sentOwner;
  }

  static async sendOrderConfirmation(data: any): Promise<boolean> {
    const totalAmount = data.totalAmount || 0;
    const shipping = data.shippingAddress || {};
    return this.sendOrderNotifications({
      orderNumber: data.orderNumber || `SIS-ORD-${Date.now()}`,
      customerName: data.customerName || 'Valued Patron',
      customerEmail: data.customerEmail || 'patron@sisodiaatelier.com',
      shippingAddress: typeof shipping === 'string' ? shipping : (shipping.addressLine1 || shipping.line1 || 'Patron Residence'),
      city: typeof shipping === 'object' ? (shipping.city || 'Global Port') : 'Global Port',
      postalCode: typeof shipping === 'object' ? (shipping.postalCode || '000000') : '000000',
      countryName: typeof shipping === 'object' ? (shipping.countryName || shipping.countryCode || 'International') : 'International',
      currencyCode: data.currency || 'USD',
      currencySymbol: data.currency === 'INR' ? '₹' : '$',
      totalForeign: totalAmount,
      totalINR: data.currency === 'INR' ? totalAmount : Math.round(totalAmount * 84),
      paymentGateway: data.paymentProvider || 'STRIPE',
      items: data.items || [],
    });
  }

  /**
   * Dispatch Order Cancellation Alert to Atelier Principal / Owner
   */
  static async sendOrderCancellationAlert(order: {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    cancelReason?: string;
  }): Promise<boolean> {
    const html = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #FAF7F2; border: 1px solid #E7E0D3; color: #1C1917;">
        <h2 style="color: #8B2500; font-size: 20px; text-transform: uppercase; letter-spacing: 2px;">Order Cancellation Notification</h2>
        <p>A patron has cancelled their consignment prior to dispatch:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-family: sans-serif; font-size: 13px;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #E7E0D3; font-weight: bold;">Order Number:</td><td style="padding: 8px; border-bottom: 1px solid #E7E0D3;">${order.orderNumber}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #E7E0D3; font-weight: bold;">Patron Name:</td><td style="padding: 8px; border-bottom: 1px solid #E7E0D3;">${order.customerName}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #E7E0D3; font-weight: bold;">Patron Email:</td><td style="padding: 8px; border-bottom: 1px solid #E7E0D3;">${order.customerEmail}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #E7E0D3; font-weight: bold;">Reason:</td><td style="padding: 8px; border-bottom: 1px solid #E7E0D3;">${order.cancelReason || 'Requested by patron before dispatch'}</td></tr>
        </table>
        <p style="font-size: 11px; color: #78716C; margin-top: 24px;">SISODIA ATELIER ✧ Nagina Woodcraft Dispatch Desk</p>
      </div>
    `;

    return this.sendMail({
      to: this.OWNER_EMAIL,
      subject: `[CANCELLATION ALERT] Order ${order.orderNumber} - ${order.customerName}`,
      html,
    });
  }

  /**
   * Dispatch 6-digit OTP verification code to Customer Email
   */
  static async sendCustomerOtpEmail(data: {
    to: string;
    code: string;
    name?: string;
  }): Promise<boolean> {
    const patronName = data.name || 'Valued Patron';
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Your SISODIA ATELIER ✧ Access Code</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1C1917;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border: 1px solid #E7E0D3; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #1E392A; padding: 32px 40px; text-align: center;">
                    <h1 style="margin: 0; font-family: Georgia, serif; font-size: 26px; letter-spacing: 4px; color: #FAF7F2; text-transform: uppercase;">SISODIA ATELIER ✧</h1>
                    <p style="margin: 6px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #D5C8B4; text-transform: uppercase;">Ultra-Luxury Heirloom Solid Wood & Wooden Tiles</p>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 40px 30px 40px;">
                    <h2 style="margin: 0 0 16px 0; font-family: Georgia, serif; font-size: 20px; color: #1C1917; font-weight: normal;">
                      Welcome, ${patronName}
                    </h2>
                    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #44403C;">
                      Please use the single-use 6-digit verification code below to securely authenticate your patron account with SISODIA ATELIER ✧.
                    </p>

                    <div style="background-color: #FAF7F2; border: 1px solid #D5C8B4; padding: 24px; text-align: center; border-radius: 4px; margin: 28px 0;">
                      <p style="margin: 0 0 8px 0; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: #8B5E3C; font-weight: 600;">Patron Verification Code</p>
                      <div style="font-family: monospace, Courier, sans-serif; font-size: 38px; font-weight: 700; letter-spacing: 10px; color: #1E392A;">${data.code}</div>
                      <p style="margin: 12px 0 0 0; font-size: 12px; color: #78716C;">Valid for 10 minutes • For your protection, never share this code</p>
                    </div>

                    <p style="margin: 0 0 24px 0; font-size: 13px; line-height: 1.6; color: #57534E;">
                      Once verified, you will have instant access to your heirloom commission dossiers, active DDP consignment telemetry, and white-glove doorstep delivery status.
                    </p>

                    <div style="border-top: 1px solid #E7E0D3; padding-top: 24px; margin-top: 24px;">
                      <p style="margin: 0; font-size: 13px; color: #1C1917; line-height: 1.6;">
                        With respectful regards,<br />
                        <strong>Yash Sisodia & Master Carvers</strong><br />
                        <span style="color: #78716C; font-size: 12px;">Nagina Woodcraft Atelier, Uttar Pradesh, India</span>
                      </p>
                    </div>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #FAF7F2; border-top: 1px solid #E7E0D3; padding: 20px 40px; text-align: center; font-size: 11px; color: #78716C; line-height: 1.5;">
                    SISODIA ATELIER ✧ • Business Email: Sisodiaatelier09@gmail.com • Direct Concierge: +91 8868031460<br />
                    100% Monolithic Single-Trunk Heartwood • 7.2% Certified Kiln Moisture • DDP Global Export
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    `;

    return this.sendMail({
      to: data.to,
      subject: `Your SISODIA ATELIER ✧ Access Code: ${data.code}`,
      html,
    });
  }

  /**
   * Send notification to Owner when a new international client registers
   */
  static async sendNewCustomerRegistrationAlert(customer: {
    name: string;
    email: string;
    countryCode: string;
    countryName: string;
    phone?: string | null;
    authProvider: string;
  }): Promise<boolean> {
    const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: sans-serif; color: #1C1917; background-color: #FAF7F2; padding: 20px;">
        <div style="max-width: 580px; background: white; border: 1px solid #E7E0D3; padding: 24px; border-radius: 4px;">
          <h2 style="color: #1E392A; margin-top: 0;">✧ [NEW CLIENT REGISTRATION] — SISODIA ATELIER</h2>
          <p style="font-size: 14px; color: #44403C;">
            A new verified international patron has registered on the official SISODIA ATELIER ✧ platform.
          </p>
          <table width="100%" cellpadding="8" cellspacing="0" style="font-size: 13px; border-collapse: collapse; margin-top: 16px;">
            <tr style="border-bottom: 1px solid #E7E0D3;">
              <td style="font-weight: bold; width: 140px; color: #78716C;">Full Name:</td>
              <td><strong>${customer.name}</strong></td>
            </tr>
            <tr style="border-bottom: 1px solid #E7E0D3;">
              <td style="font-weight: bold; color: #78716C;">Client Email:</td>
              <td><a href="mailto:${customer.email}">${customer.email}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #E7E0D3;">
              <td style="font-weight: bold; color: #78716C;">Country:</td>
              <td><strong>${customer.countryName} (${customer.countryCode})</strong></td>
            </tr>
            <tr style="border-bottom: 1px solid #E7E0D3;">
              <td style="font-weight: bold; color: #78716C;">Phone / WhatsApp:</td>
              <td>${customer.phone || 'Not provided'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E7E0D3;">
              <td style="font-weight: bold; color: #78716C;">Auth Method:</td>
              <td><span style="display: inline-block; padding: 3px 8px; background: #EAEFEA; color: #1E392A; border-radius: 3px; font-weight: 600; font-size: 11px;">${customer.authProvider}</span></td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #78716C;">Registered At:</td>
              <td>${new Date().toUTCString()}</td>
            </tr>
          </table>
          <p style="font-size: 11px; color: #78716C; margin-top: 24px; text-align: center;">
            SISODIA ATELIER ✧ • Backoffice Notification System
          </p>
        </div>
      </body>
    </html>
    `;

    return this.sendMail({
      to: this.OWNER_EMAIL,
      replyTo: customer.email,
      subject: `[NEW CLIENT REGISTRATION] ${customer.name} (${customer.countryName}) via ${customer.authProvider} — SISODIA ATELIER ✧`,
      html,
    });
  }
}
