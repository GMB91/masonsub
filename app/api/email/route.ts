import { NextRequest, NextResponse } from "next/server";

interface EmailRequest {
  to: string | string[];
  subject: string;
  body: string;
  html?: string;
  from?: string;
  cc?: string[];
  bcc?: string[];
  templateId?: string;
  templateData?: Record<string, any>;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const emailData: EmailRequest = await req.json();

    // Validate required fields
    if (!emailData.to || !emailData.subject || (!emailData.body && !emailData.html)) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, and body/html" },
        { status: 400 }
      );
    }

    // Check testing mode
    if (process.env.NEXT_PUBLIC_TESTING_MODE === "true") {
      console.log("📧 [Testing Mode] Email would be sent:", {
        to: emailData.to,
        subject: emailData.subject,
        bodyPreview: emailData.body?.substring(0, 100),
      });

      return NextResponse.json({
        success: true,
        messageId: `test-${Date.now()}`,
        testMode: true,
        message: "Email logged (testing mode)",
      });
    }

    // In production, integrate with:
    // - Postmark: https://postmarkapp.com/
    // - SendGrid: https://sendgrid.com/
    // - AWS SES: https://aws.amazon.com/ses/
    // - Resend: https://resend.com/

    // Example with nodemailer (you'd need to install it):
    /*
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: emailData.from || process.env.SMTP_FROM,
      to: Array.isArray(emailData.to) ? emailData.to.join(", ") : emailData.to,
      subject: emailData.subject,
      text: emailData.body,
      html: emailData.html,
      cc: emailData.cc?.join(", "),
      bcc: emailData.bcc?.join(", "),
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
    });
    */

    // For now, return mock success
    return NextResponse.json({
      success: true,
      messageId: `mock-${Date.now()}`,
      message: "Email API not yet configured. Set up SMTP credentials.",
    });
  } catch (error: any) {
    console.error("Email API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
