"use client";
import React, { useState } from "react";
import { Upload, ChevronLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import Papa from "papaparse"; // CSV parser
import { createClient } from "@supabase/supabase-js";

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Expected CSV headers for validation
const EXPECTED_HEADERS = [
  "full_name",
  "address", 
  "amount",
  "state",
  "reference_number",
  "source"
];

interface ValidationResult {
  ok: boolean;
  message: string;
}

export default function DataImportPage() {
  const [selectedFolder, setSelectedFolder] = useState("QLD Public Trustee Records");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!file) throw new Error("No file selected");

      // Supabase storage bucket: "imports"
      const filePath = `${selectedFolder}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("imports")
        .upload(filePath, file, { upsert: true });

      if (error) throw error;
      return data;
    },
    onMutate: () => setUploadProgress(0),
    onSuccess: () => {
      setUploadProgress(100);
      // Reset form after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        setValidationResult(null);
        setUploadProgress(null);
      }, 2000);
    },
    onError: () => setUploadProgress(null),
  });

  const validateCsv = (file: File) => {
    Papa.parse(file, {
      header: true,
      preview: 1, // Only parse first row for header validation
      complete: (results: Papa.ParseResult<any>) => {
        const headers = results.meta.fields || [];
        const missing = EXPECTED_HEADERS.filter(h => !headers.includes(h));
        
        if (missing.length === 0) {
          setValidationResult({ 
            ok: true, 
            message: "✅ CSV schema validated successfully - all required columns found." 
          });
        } else {
          setValidationResult({
            ok: false,
            message: `❌ Missing required columns: ${missing.join(", ")}`
          });
        }
      },
      error: () => {
        setValidationResult({
          ok: false,
          message: "❌ Failed to parse CSV file - please check file format."
        });
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValidationResult(null);
      
      if (file.name.toLowerCase().endsWith(".csv")) {
        validateCsv(file);
      } else if (file.name.toLowerCase().endsWith(".pdf")) {
        setValidationResult({
          ok: true,
          message: "📄 PDF file selected - skipping column validation (ready for document processing)."
        });
      } else {
        setValidationResult({
          ok: false,
          message: "❌ Unsupported file type. Please select a CSV or PDF file."
        });
      }
    }
  };

  const handleUpload = () => {
    if (selectedFile && validationResult?.ok) {
      uploadMutation.mutate(selectedFile);
    }
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon">
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </Button>
        <h1 className="text-3xl font-bold text-slate-800">
          Import Claimant Data
        </h1>
      </div>
      <p className="text-slate-500 -mt-4">Upload CSV or PDF file</p>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-slate-700 font-medium mb-2">
          <span className="font-semibold text-blue-700">Supported Formats:</span>{" "}
          CSV (with schema validation), PDF
        </p>
        <p className="text-slate-600">
          <span className="font-semibold text-blue-700">Excel Files:</span> Please save as CSV format first (File → Save As → CSV)
        </p>
        <p className="text-slate-600 mt-1">
          <span className="font-semibold text-blue-700">File Size Limit:</span> Maximum 10MB per upload (up to ~1,000 records)
        </p>
      </div>

      {/* Required Schema Info */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <h3 className="font-semibold text-slate-800 mb-2">Required CSV Columns</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {EXPECTED_HEADERS.map((header) => (
            <div key={header} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <code className="text-slate-600 bg-white px-2 py-1 rounded border">
                {header}
              </code>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Your CSV file must contain all these columns for successful validation.
        </p>
      </div>

      {/* Data Source Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          Select Data Source Folder
        </h2>
        <select
          value={selectedFolder}
          onChange={(e) => setSelectedFolder(e.target.value)}
          className="w-full border border-slate-300 rounded-lg p-3 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option>QLD Public Trustee Records</option>
          <option>NSW Revenue Unclaimed Funds</option>
          <option>VIC Treasury Unclaimed Assets</option>
          <option>WA Department of Finance</option>
          <option>ASIC Gazette Notices</option>
        </select>
        <p className="text-sm text-slate-500 mt-2">
          All imported records will be stored in this folder with timestamp.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Upload className="text-blue-600 h-5 w-5" />
          Upload File
        </h2>
        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-16 cursor-pointer transition ${
            validationResult?.ok 
              ? "border-green-300 bg-green-50 hover:bg-green-100"
              : validationResult?.ok === false
              ? "border-red-300 bg-red-50 hover:bg-red-100"  
              : "border-blue-300 bg-blue-50 hover:bg-blue-100"
          }`}
        >
          <Upload className={`h-10 w-10 mb-2 ${
            validationResult?.ok 
              ? "text-green-500"
              : validationResult?.ok === false
              ? "text-red-500"
              : "text-blue-500"
          }`} />
          <p className="text-slate-800 font-medium">Drop your file here or click to select</p>
          <p className="text-sm text-slate-500">CSV or PDF supported</p>
          <input
            id="file-upload"
            type="file"
            accept=".csv,.pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          {selectedFile && (
            <p className="text-sm text-slate-600 mt-2 font-medium">{selectedFile.name}</p>
          )}
        </label>

        {/* Validation Result */}
        {validationResult && (
          <div
            className={`mt-4 flex items-center gap-3 text-sm px-4 py-3 rounded-lg border ${
              validationResult.ok
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {validationResult.ok ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <span className="flex-1">{validationResult.message}</span>
          </div>
        )}

        {/* Upload Button */}
        <div className="mt-4 flex items-center justify-between">
          <Button
            onClick={handleUpload}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!selectedFile || !validationResult?.ok || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <>
                <Upload className="animate-spin h-4 w-4 mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload & Save to {selectedFolder}
              </>
            )}
          </Button>
          {uploadProgress === 100 && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Upload Complete!</span>
            </div>
          )}
        </div>

        {/* Excel Notice */}
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          <strong>💡 Excel Users:</strong> Open your .xlsx file in Excel and save as CSV format 
          (File → Save As → Comma Separated Values) before uploading for schema validation.
        </div>

        {/* Upload Progress */}
        {uploadProgress !== null && uploadProgress < 100 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-slate-600 mb-1">
              <span>Uploading to Supabase Storage...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}