import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabaseClient";

/**
 * Upload a file to Supabase Storage
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = getSupabaseServiceClient();
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bucket = (formData.get("bucket") as string) || "documents";
    const path = (formData.get("path") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check testing mode
    if (process.env.NEXT_PUBLIC_TESTING_MODE === "true") {
      return NextResponse.json({
        success: true,
        path: `${path}/${file.name}`,
        url: `https://example.com/storage/${bucket}/${path}/${file.name}`,
        testMode: true,
      });
    }

    // Upload to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      path: data.path,
      url: urlData.publicUrl,
    });
  } catch (error: any) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: error.message || "File upload failed" },
      { status: 500 }
    );
  }
}

/**
 * Get a signed URL for a file
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const bucket = searchParams.get("bucket") || "documents";
    const path = searchParams.get("path");
    const expiresIn = parseInt(searchParams.get("expiresIn") || "3600");

    if (!path) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }

    // Check testing mode
    if (process.env.NEXT_PUBLIC_TESTING_MODE === "true") {
      return NextResponse.json({
        success: true,
        signedUrl: `https://example.com/storage/${bucket}/${path}?token=test`,
        testMode: true,
      });
    }

    // Get signed URL from Supabase
    const supabase = getSupabaseServiceClient();
    const { data, error} = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      signedUrl: data.signedUrl,
    });
  } catch (error: any) {
    console.error("File URL error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate signed URL" },
      { status: 500 }
    );
  }
}
