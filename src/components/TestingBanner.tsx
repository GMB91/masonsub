import { AlertCircle } from "lucide-react";

export default function TestingBanner() {
  if (process.env.NEXT_PUBLIC_TESTING_MODE !== "true") return null;

  return (
    <div className="w-full bg-yellow-50 border-b border-yellow-300 px-4 py-3 flex items-center gap-3">
      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-yellow-900">
          🧪 Testing Mode Active
        </p>
        <p className="text-xs text-yellow-700">
          External APIs and database writes are mocked. No real data will be modified.
        </p>
      </div>
    </div>
  );
}
