import { NextRequest, NextResponse } from "next/server";

interface ExtractRequest {
  type: "csv" | "pdf" | "xlsx";
  url?: string;
  content?: string;
}

/**
 * Extract data from files (CSV, PDF, XLSX)
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: ExtractRequest = await req.json();
    const { type, url, content } = body;

    if (!type) {
      return NextResponse.json({ error: "Type is required" }, { status: 400 });
    }

    if (!url && !content) {
      return NextResponse.json(
        { error: "Either url or content is required" },
        { status: 400 }
      );
    }

    // Check testing mode
    if (process.env.NEXT_PUBLIC_TESTING_MODE === "true") {
      return NextResponse.json({
        success: true,
        data: generateMockData(type),
        testMode: true,
      });
    }

    // Handle different file types
    switch (type) {
      case "csv":
        return handleCSV(url, content);
      case "pdf":
        return handlePDF(url, content);
      case "xlsx":
        return handleXLSX(url, content);
      default:
        return NextResponse.json(
          { error: `Unsupported type: ${type}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Extract API error:", error);
    return NextResponse.json(
      { error: error.message || "Extraction failed" },
      { status: 500 }
    );
  }
}

async function handleCSV(
  url?: string,
  content?: string
): Promise<NextResponse> {
  // In production, use a library like papaparse or csv-parse
  const text = content || (url ? await fetch(url).then((r) => r.text()) : "");

  if (!text) {
    return NextResponse.json({ error: "No content to parse" }, { status: 400 });
  }

  // Simple CSV parsing
  const lines = text.split("\n").filter((line) => line.trim());
  if (lines.length === 0) {
    return NextResponse.json({ success: true, data: [] });
  }

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = values[i] || "";
    });
    return row;
  });

  return NextResponse.json({
    success: true,
    data: rows,
    headers,
    rowCount: rows.length,
  });
}

async function handlePDF(
  url?: string,
  content?: string
): Promise<NextResponse> {
  // In production, use pdf-parse or similar
  // npm install pdf-parse
  
  return NextResponse.json({
    success: true,
    data: {
      text: "PDF parsing not yet implemented. Install pdf-parse library.",
      pages: 0,
    },
    message: "Install pdf-parse library for PDF extraction",
  });
}

async function handleXLSX(
  url?: string,
  content?: string
): Promise<NextResponse> {
  // In production, use xlsx or exceljs
  // npm install xlsx
  
  return NextResponse.json({
    success: true,
    data: [],
    message: "Install xlsx library for Excel extraction",
  });
}

function generateMockData(type: string) {
  switch (type) {
    case "csv":
      return [
        { name: "John Smith", email: "john@example.com", amount: "1500" },
        { name: "Jane Doe", email: "jane@example.com", amount: "2300" },
        { name: "Bob Wilson", email: "bob@example.com", amount: "800" },
      ];
    case "pdf":
      return {
        text: "Sample PDF content extracted in testing mode.",
        pages: 3,
      };
    case "xlsx":
      return [
        { Column1: "Value1", Column2: "Value2" },
        { Column1: "Value3", Column2: "Value4" },
      ];
    default:
      return [];
  }
}
