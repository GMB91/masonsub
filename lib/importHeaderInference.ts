// CSV header inference

export interface HeaderInferenceResult {
  mapping: Record<string, string>;
  confidence: number;
}

export function inferHeaders(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};

  headers.forEach((header) => {
    const lower = header.toLowerCase();
    if (lower.includes("name") || lower.includes("full")) mapping.full_name = header;
    if (lower.includes("email")) mapping.email = header;
    if (lower.includes("phone")) mapping.phone = header;
    if (lower.includes("dob") || lower.includes("birth")) mapping.dob = header;
    if (lower.includes("address")) mapping.address = header;
    if (lower.includes("state")) mapping.state = header;
    if (lower.includes("amount") || lower.includes("value")) mapping.amount = header;
  });

  return mapping;
}

export default function inferHeaderMapping(headers: string[]): HeaderInferenceResult {
  const mapping = inferHeaders(headers);
  const confidence = Object.keys(mapping).length / 7; // 7 expected fields
  return { mapping, confidence };
}
