export function splitCsvLine(line: string): string[] {
  const result: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      // handle escaped quotes
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  result.push(cur)
  return result.map((s) => s.trim())
}

export default function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '')
  if (lines.length === 0) return []
  const header = splitCsvLine(lines[0])
  const rows = [] as Record<string, string>[]
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i])
    const obj: Record<string, string> = {}
    for (let j = 0; j < header.length; j++) {
      const key = header[j] ?? `col_${j}`
      obj[key] = cols[j] ?? ''
    }
    rows.push(obj)
  }
  return rows
}
