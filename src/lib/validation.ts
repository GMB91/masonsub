export function isValidEmail(email?: string) {
  if (!email) return false
  // simple RFC 5322-ish regex (permissive)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function normalizePhone(phone?: string) {
  if (!phone) return ""
  // remove non-digits
  const digits = phone.replace(/\D+/g, "")
  // naive normalization: +1 if 10 digits, else keep as-is with +
  if (digits.length === 10) return `+1${digits}`
  if (digits.startsWith("1") && digits.length === 11) return `+${digits}`
  return `+${digits}`
}

export function isValidPhone(phone?: string) {
  if (!phone) return false
  const digits = phone.replace(/\D+/g, "")
  return digits.length >= 7 && digits.length <= 15
}
