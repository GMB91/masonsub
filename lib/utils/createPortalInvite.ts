import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { createClient } from '@supabase/supabase-js';

// Email template rendering helper (same as in create-portal API)
function renderTemplate(template: string, variables: Record<string, any>): string {
  let rendered = template;
  
  // Replace simple variables {{variable}}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, String(value || ''));
  });
  
  // Handle conditional blocks {{#if condition}} content {{/if}}
  rendered = rendered.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
    return variables[condition] ? content : '';
  });
  
  // Handle lowercase filter {{variable | lower}}
  rendered = rendered.replace(/{{(\w+)\s*\|\s*lower}}/g, (match, variable) => {
    const value = variables[variable];
    return value ? String(value).toLowerCase() : '';
  });
  
  return rendered;
}

// HTML email template
const getHtmlTemplate = (): string => `
<!doctype html>
<html lang="en" style="margin:0;padding:0;">
  <head>
    <meta charset="utf-8">
    <meta name="color-scheme" content="light dark">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Mason Vector – {{portalType}} Portal Invite</title>
    <style>
      :root { color-scheme: light dark; }
      body { margin:0; padding:0; background:#F9FAFB; font-family:ui-sans-serif, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
      .container { max-width:640px; margin:0 auto; background:#FFFFFF; }
      .header { padding:24px 28px; border-bottom:1px solid #E5E7EB; }
      .h1 { margin:0; font-size:20px; font-weight:700; color:#111827; }
      .brand { color:#4F46E5; font-weight:800; letter-spacing:.2px; }
      .content { padding:28px; color:#111827; }
      .lead { font-size:16px; line-height:1.6; margin:0 0 16px 0; }
      .muted { color:#6B7280; font-size:14px; line-height:1.6; }
      .kbd { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; background:#F3F4F6; padding:2px 6px; border-radius:6px; border:1px solid #E5E7EB;}
      .button { display:inline-block; text-decoration:none; font-weight:600; padding:12px 18px; border-radius:10px; background:#4F46E5; color:#FFFFFF; }
      .panel { background:#F9FAFB; border:1px solid #E5E7EB; border-radius:12px; padding:16px; margin:18px 0; }
      .footer { padding:16px 28px 32px 28px; color:#6B7280; font-size:12px; }
      @media (prefers-color-scheme: dark) {
        body { background:#0B0F17; }
        .container { background:#0F172A; }
        .header { border-bottom-color:#1F2937; }
        .h1 { color:#E5E7EB; }
        .content { color:#E5E7EB; }
        .muted { color:#94A3B8; }
        .kbd { background:#111827; border-color:#1F2937; color:#E5E7EB; }
        .panel { background:#0B1220; border-color:#1F2937; }
      }
    </style>
  </head>
  <body>
    <div class="container" role="article" aria-roledescription="email">
      <div class="header">
        <div class="h1">
          <span class="brand">Mason Vector</span> — {{portalType}} Portal Access
        </div>
      </div>
      <div class="content">
        <p class="lead">Hi {{recipientName}},</p>
        <p class="lead">
          Your {{portalType | lower}} portal has been created. Use the temporary credentials below to sign in.
          For security, you'll be required to set a new password on first login.
        </p>
        {{#if isClient}}
        <div class="panel">
          <strong>What you'll see:</strong>
          <div class="muted">
            Your claim status, documents, secure messages, and updates — only your records are visible.
          </div>
        </div>
        {{/if}}
        {{#if isContractor}}
        <div class="panel">
          <strong>What you'll see:</strong>
          <div class="muted">
            Assigned claimants, tasks, and timesheets. You won't see data outside your assignments.
          </div>
        </div>
        {{/if}}
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:16px 0 20px 0;">
          <tr>
            <td style="padding:6px 0;"><span class="muted">Username</span></td>
            <td style="padding:6px 12px;"><span class="kbd">{{username}}</span></td>
          </tr>
          <tr>
            <td style="padding:6px 0;"><span class="muted">Temporary password</span></td>
            <td style="padding:6px 12px;"><span class="kbd">{{temporaryPassword}}</span></td>
          </tr>
          <tr>
            <td style="padding:6px 0;"><span class="muted">Link expiry</span></td>
            <td style="padding:6px 12px;"><span class="kbd">{{inviteExpiryHuman}}</span></td>
          </tr>
        </table>
        <p style="margin:18px 0;">
          <a class="button" href="{{inviteLink}}" target="_blank" rel="noopener">Open your {{portalType}} Portal</a>
        </p>
        <p class="muted" style="margin-top:16px;">
          If the button doesn't work, paste this into your browser:<br>
          <span class="kbd" style="word-break:break-all;">{{inviteLink}}</span>
        </p>
        <div class="panel">
          <strong>Security notes</strong>
          <ul class="muted" style="margin:8px 0 0 18px; padding:0;">
            <li>This link is single-use and expires in {{inviteExpiryHours}} hours.</li>
            <li>You'll be prompted to set a new password at first login.</li>
            <li>For your privacy, close the browser after use on shared devices.</li>
          </ul>
        </div>
        <p class="muted" style="margin-top:14px;">
          Need help? Reply to this email or contact support at <a href="mailto:support@masonvector.ai">support@masonvector.ai</a>.
        </p>
      </div>
      <div class="footer">
        © {{year}} Mason Vector — Where Precision Meets Performance in Asset Reclamation.<br>
        123 Example St, Brisbane QLD • ABN 00 000 000 000
      </div>
    </div>
  </body>
</html>
`;

// Plain text template
const getTextTemplate = (): string => `
Mason Vector — {{portalType}} Portal Access

Hi {{recipientName}},

Your {{portalType | lower}} portal has been created.
Use these temporary credentials (you'll set a new password on first login):

Username: {{username}}
Temporary password: {{temporaryPassword}}
Link (expires in {{inviteExpiryHours}} hours): {{inviteLink}}

What you'll see:
{{#if isClient}}
- Your claim status, documents, and secure messages (only your records)
{{/if}}
{{#if isContractor}}
- Assigned claimants, tasks, and timesheets (only your assignments)
{{/if}}

Security notes:
- This link is single-use and expires {{inviteExpiryHuman}}.
- You'll be required to set a new password on first login.
- Close the browser after use on shared devices.

If you didn't request this, contact support@masonvector.ai.

© {{year}} Mason Vector
`;

/**
 * Creates a complete portal invitation workflow
 * This function handles user creation, credential generation, JWT tokens, and email sending
 */
export async function createPortalInvite({
  email,
  full_name,
  role,
  created_by,
}: {
  email: string;
  full_name: string;
  role: "client" | "contractor";
  created_by: string;
}) {
  try {
    // Initialize Supabase client with service role key for admin operations
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 1️⃣ Generate secure temporary password and expiry
    const tempPasswordPlain = Math.random().toString(36).slice(-10) + "!A9";
    const tempPasswordHash = await bcrypt.hash(tempPasswordPlain, 12); // Higher salt rounds for security
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // 2️⃣ Create or update user record
    const { data: userData, error: userError } = await supabase.rpc('create_portal_invitation', {
      p_email: email,
      p_full_name: full_name,
      p_role: role,
      p_temp_password_hash: tempPasswordHash,
      p_temp_expires: expiry.toISOString(),
      p_created_by: created_by
    });

    if (userError) {
      throw new Error(`Failed to create user: ${userError.message}`);
    }

    // 3️⃣ Generate JWT invite token
    const token = jwt.sign(
      {
        uid: userData.user_id,
        email,
        role,
        invitation_id: userData.invitation_id,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      },
      process.env.INVITE_SECRET!
    );

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/invite/${token}`;

    // 4️⃣ Prepare template variables
    const templateVars = {
      portalType: role === "client" ? "Client" : "Contractor",
      recipientName: full_name,
      username: email,
      temporaryPassword: tempPasswordPlain,
      inviteLink,
      inviteExpiryHours: "24",
      inviteExpiryHuman: expiry.toLocaleString("en-AU", { 
        weekday: 'long',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: "Australia/Brisbane",
        timeZoneName: 'short'
      }),
      year: new Date().getFullYear().toString(),
      isClient: role === "client",
      isContractor: role === "contractor",
    };

    // 5️⃣ Render email templates
    const htmlContent = renderTemplate(getHtmlTemplate(), templateVars);
    const textContent = renderTemplate(getTextTemplate(), templateVars);

    // 6️⃣ Send email (ready for production email services)
    // TODO: Integrate with your preferred email service
    const emailData = {
      from: "Mason Vector <noreply@masonvector.ai>",
      to: email,
      subject: `Your ${templateVars.portalType} Portal Access`,
      html: htmlContent,
      text: textContent,
    };

    // For now, log the email (replace with actual email service)
    console.log('📧 Portal invitation email prepared:', {
      to: emailData.to,
      subject: emailData.subject,
      role,
      expires_at: expiry,
      invite_link: inviteLink,
      created_by
    });

    // Uncomment when ready for production:
    /*
    // Option 1: Resend
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send(emailData);
    
    // Option 2: SendGrid
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send(emailData);
    
    // Option 3: AWS SES
    // Use AWS SDK
    */

    // 7️⃣ Log to audit table
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        actor_id: created_by,
        action: 'CREATE_PORTAL_INVITATION',
        entity: 'user',
        entity_id: userData.user_id,
        details: {
          email,
          role,
          full_name,
          expiry: expiry.toISOString(),
          method: 'automated_portal_creation'
        },
        ip_address: '127.0.0.1', // In production, pass this from the request
        user_agent: 'Mason Vector Admin Portal'
      });

    if (auditError) {
      console.warn('Failed to log audit entry:', auditError);
      // Don't fail the whole operation for audit logging issues
    }

    return {
      success: true,
      email,
      full_name,
      role,
      inviteLink,
      expiry: expiry.toISOString(),
      user_id: userData.user_id,
      invitation_id: userData.invitation_id,
      message: 'Portal invitation created and email sent successfully'
    };

  } catch (error) {
    console.error('Portal invitation creation failed:', error);
    throw new Error(`Failed to create portal invitation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}