import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Upload, AlertCircle, Database } from "lucide-react";

export default function UploadDataPage() {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div>
          <h3 className="font-semibold text-yellow-900">🧪 Testing Mode Active</h3>
          <p className="text-sm text-yellow-700">File uploads are disabled in testing mode.</p>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Upload Data</h1>
        <p className="text-slate-500 mt-1">Import claimant data and unclaimed money records</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-indigo-600" />
              Upload CSV File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer">
              <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-500 mt-1">CSV, XLS, XLSX (Max 10MB)</p>
            </div>
            <div className="mt-4">
              <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                Browse Files
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-indigo-600" />
              API Import
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600">Import data directly from state databases:</p>
            <button className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors text-left">
              🇦🇺 QLD Public Trustee
            </button>
            <button className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors text-left">
              🇦🇺 NSW Unclaimed Money
            </button>
            <button className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors text-left">
              🇦🇺 VIC State Revenue
            </button>
            <button className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors text-left">
              🇦🇺 ASIC Gazette
            </button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Imports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
              <div>
                <p className="text-sm font-medium text-slate-900">QLD_unclaimed_2024.csv</p>
                <p className="text-xs text-slate-500">Imported 3 hours ago • 1,234 records</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                Success
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
              <div>
                <p className="text-sm font-medium text-slate-900">NSW_data_update.xlsx</p>
                <p className="text-xs text-slate-500">Imported yesterday • 856 records</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                Success
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
