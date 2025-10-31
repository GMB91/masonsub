type SendEmailParams = {
  to: string
  subject: string
  html?: string
  text?: string
  attachments?: Array<{ filename: string; content: Buffer | string }>
}

export async function sendEmail(params: SendEmailParams): Promise<{ messageId: string }> {
  // Minimal dev-friendly behavior: if SMTP vars are not set, act as a no-op and return a fake id.
  const host = process.env.SMTP_HOST
  if (!host) {
    // Log to stdout for visibility in dev
    // eslint-disable-next-line no-console
    console.log('[email] SMTP not configured — skipping sendEmail (dev-mode).', params.to, params.subject)
    return { messageId: `dev-${Date.now()}` }
  }

  // Production: implement real SMTP or provider-based sending here (nodemailer / SendGrid SDK)
  throw new Error('sendEmail: SMTP configured but sending not implemented in scaffold')
}

export async function sendProactiveClientUpdate(claimantId: string, templateName: string, data?: Record<string, any>): Promise<void> {
  // Resolve template and call sendEmail. For now this is a safe stub.
  // eslint-disable-next-line no-console
  console.log(`[email] sendProactiveClientUpdate (dev): claimant=${claimantId} template=${templateName}`)
  // no-op in scaffold
}

export default { sendEmail, sendProactiveClientUpdate }
