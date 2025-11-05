import { z } from "zod";

export const ClaimantSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  dob: z.string().optional(),
  address: z.string().optional(),
  state: z.string().min(2, "State is required"),
  amount: z.number().optional(),
  source: z.string().optional(),
  status: z.enum(["new", "in_progress", "completed", "rejected"]).default("new"),
});

export type ClaimantInput = z.infer<typeof ClaimantSchema>;

export function validateClaimant(data: unknown) {
  return ClaimantSchema.safeParse(data);
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
}

// Normalize phone number
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}
