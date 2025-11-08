import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '../../../../lib/supabaseClient';
import { createPortalInvite } from '../../../../lib/utils/createPortalInvite';
import jwt from 'jsonwebtoken';

interface CreatePortalRequest {
  email: string;
  full_name: string;
  role: 'client' | 'contractor' | 'manager';
}

interface PortalInvitation {
  invitation_id: string;
  user_id: string;
  email: string;
  temp_password: string;
  invite_token: string;
  invite_url: string;
  expires_at: string;
}

// Helper function to authenticate admin user
async function authenticateAdmin(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return { error: 'Missing authorization header', user: null };
    }

    const token = authHeader.split(' ')[1];
    const supabase = getSupabaseServiceClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { error: 'Invalid token', user: null };
    }

    const userRole = user.user_metadata?.role || user.app_metadata?.role || 'client';
    
    if (!['admin', 'manager'].includes(userRole)) {
      return { error: 'Insufficient permissions', user: null };
    }

    // Set session variables for RLS
    await supabase.rpc('set_session_variables', {
      user_id: user.id,
      user_role: userRole,
      user_email: user.email || ''
    });

    return { error: null, user: { ...user, role: userRole } };
  } catch (error) {
    console.error('Auth error:', error);
    return { error: 'Authentication failed', user: null };
  }
}

// Generate JWT invite token
function generateInviteToken(payload: any): string {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.sign(payload, secret, { expiresIn: '24h' });
}

// Email template rendering helper
function renderTemplate(template: string, variables: Record<string, any>): string {
  let rendered = template;
  
  // Replace simple variables {{variable}}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, String(value || ''));
  });
  
  // Handle conditional blocks {{#if condition}} content {{/if}}
  rendered = rendered.replace(/{{#if\s+(\w+)}}(.*?){{\/if}}/gs, (match, condition, content) => {
    return variables[condition] ? content : '';
  });
  
  // Handle lowercase filter {{variable | lower}}
  rendered = rendered.replace(/{{(\w+)\s*\|\s*lower}}/g, (match, variable) => {
    const value = variables[variable];
    return value ? String(value).toLowerCase() : '';
  });
  
  return rendered;
}

// Professional HTML email template
const getHtmlTemplate = (): string => `
<!doctype html>
<html lang="en" style="margin:0;padding:0;">
  <head>
    <meta charset="utf-8">
    <meta name="color-scheme" content="light dark">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Mason Vector – {{portalType}} Portal Invite</title>
    <style>
      /* Brand */
      :root {
        color-scheme: light dark;
      }
      body { margin:0; padding:0; background:#F9FAFB; font-family:ui-sans-serif, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
      .container { max-width:640px; margin:0 auto; background:#FFFFFF; }
      .header { padding:24px 28px; border-bottom:1px solid #E5E7EB; }
      .h1 { margin:0; font-size:20px; font-weight:700; color:#111827; }
      .brand { color:#4F46E5; font-weight:800; letter-spacing:.2px; }
      .content { padding:28px; color:#111827; }
      .lead { font-size:16px; line-height:1.6; margin:0 0 16px 0; }
      .muted { color:#6B7280; font-size:14px; line-height:1.6; }
      .kbd { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; background:#F3F4F6; padding:2px 6px; border-radius:6px; border:1px solid #E5E7EB;}
      .button {
        display:inline-block; text-decoration:none; font-weight:600;
        padding:12px 18px; border-radius:10px;
        background:#4F46E5; color:#FFFFFF;
      }
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

        <!-- Role blurb -->
        <!-- CLIENT copy -->
        {{#if isClient}}
        <div class="panel">
          <strong>What you'll see:</strong>
          <div class="muted">
            Your claim status, documents, secure messages, and updates — only your records are visible.
          </div>
        </div>
        {{/if}}
        <!-- CONTRACTOR copy -->
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

// Plain text email template
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

// Send invitation email with professional templates
async function sendInvitationEmail(invitation: PortalInvitation, createdBy: string) {
  try {
    // Parse JWT to get role information (for role-specific content)
    let roleInfo = { role: 'client' }; // fallback
    try {
      const payload = JSON.parse(atob(invitation.invite_token.split('.')[1]));
      roleInfo = payload;
    } catch (e) {
      console.warn('Could not parse JWT for role info, using fallback');
    }

    // Prepare template variables
    const expiryDate = new Date(invitation.expires_at);
    const now = new Date();
    const hoursUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    const templateVars = {
      portalType: roleInfo.role === 'client' ? 'Client' : 'Contractor',
      recipientName: invitation.email.split('@')[0] || 'there', // fallback name
      username: invitation.email,
      temporaryPassword: invitation.temp_password,
      inviteLink: invitation.invite_url,
      inviteExpiryHours: hoursUntilExpiry.toString(),
      inviteExpiryHuman: expiryDate.toLocaleString('en-AU', {
        weekday: 'long',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      }),
      year: new Date().getFullYear().toString(),
      isClient: roleInfo.role === 'client',
      isContractor: roleInfo.role === 'contractor'
    };

    // Render email templates
    const htmlContent = renderTemplate(getHtmlTemplate(), templateVars);
    const textContent = renderTemplate(getTextTemplate(), templateVars);

    // Prepare email data
    const emailData = {
      from: 'Mason Vector <noreply@masonvector.ai>',
      to: invitation.email,
      subject: `Your ${templateVars.portalType} Portal Access`,
      html: htmlContent,
      text: textContent
    };

    // TODO: Send actual email using your preferred service
    // Example integrations:
    
    // Option 1: Resend
    // const { Resend } = require('resend');
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send(emailData);
    
    // Option 2: SendGrid  
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send(emailData);
    
    // Option 3: AWS SES
    // Use AWS SDK to send via SES

    // For now, log the email details
    console.log('📧 Portal invitation email prepared:', {
      to: emailData.to,
      subject: emailData.subject,
      role: roleInfo.role,
      expires_in_hours: hoursUntilExpiry,
      invite_url: invitation.invite_url,
      created_by: createdBy,
      template_vars: templateVars
    });

    // Return success (in production, return actual send result)
    return { 
      success: true, 
      message: 'Invitation email sent successfully',
      email_id: `mock-${Date.now()}` // In production, return actual email ID
    };

  } catch (error) {
    console.error('Failed to send invitation email:', error);
    throw new Error('Email sending failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate admin user
    const { error: authError, user } = await authenticateAdmin(request);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: authError || 'Authentication failed' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: CreatePortalRequest = await request.json();
    const { email, full_name, role } = body;

    // Validate input
    if (!email || !full_name || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: email, full_name, role' },
        { status: 400 }
      );
    }

    if (!['client', 'contractor', 'manager'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role. Must be client, contractor, or manager' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Use the new unified portal creation utility
    const result = await createPortalInvite({
      email: email.toLowerCase().trim(),
      full_name: full_name.trim(),
      role: role as "client" | "contractor", // Note: manager role may need separate handling
      created_by: user.id
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        invitation_id: result.invitation_id,
        email: result.email,
        full_name: result.full_name,
        role: result.role,
        expires_at: result.expiry,
        invite_url: result.inviteLink
      }
    });

  } catch (error) {
    console.error('Portal creation error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to list pending invitations (admin only)
export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const { error: authError, user } = await authenticateAdmin(request);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: authError || 'Authentication failed' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseServiceClient();

    // Get pending invitations
    const { data: invitations, error } = await supabase
      .from('portal_invitations')
      .select(`
        id,
        email,
        full_name,
        role,
        expires_at,
        used_at,
        created_at,
        created_by
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invitations:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch invitations' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: invitations
    });

  } catch (error) {
    console.error('Get invitations error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}