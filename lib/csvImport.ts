// CSV import utilities

export interface CSVRow {
  [key: string]: string;
}

export function parseCSV(text: string): CSVRow[] {
  const lines = text.split("\n").filter((line) => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    const row: CSVRow = {};
    headers.forEach((header, i) => {
      row[header] = values[i] || "";
    });
    return row;
  });

  return rows;
}

export function validateCSVHeaders(headers: string[], required: string[]): boolean {
  return required.every((req) => headers.includes(req));
}

// Default export for backward compatibility
export default parseCSV;
