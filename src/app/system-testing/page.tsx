"use client";
import React, { useState } from "react";

// Simple Button Component (inline to avoid import issues)
const Button = ({ 
  onClick, 
  disabled, 
  className, 
  children, 
  size = "md" 
}: {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) => {
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${sizeClasses[size]} ${className || ""}`}
    >
      {children}
    </button>
  );
};

// Simple Card Components (inline to avoid import issues)
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className || ""}`}>
    {children}
  </div>
);

const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className || ""}`}>
    {children}
  </div>
);

// Simple Icons (inline to avoid lucide-react dependency issues)
const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="9,11 12,14 22,4"/>
  </svg>
);

const XCircle = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="m15 9-6 6"/>
    <path d="m9 9 6 6"/>
  </svg>
);

const AlertTriangle = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/>
    <path d="m12 17 .01 0"/>
  </svg>
);

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12a9 9 0 11-6.219-8.56"/>
  </svg>
);

const FlaskConical = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 2v7.31"/>
    <path d="M14 9.3V1.99"/>
    <path d="M8.5 2h7"/>
    <path d="M14 9.3a6.5 6.5 0 1 1-4 0"/>
    <path d="M5.52 16h12.96"/>
  </svg>
);

const ShieldCheck = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 13c0 5-3.5 7.5-8 7.5s-8-2.5-8-7.5c0-1 0-3 0-3s3-2 8-2 8 2 8 2 0 2 0 3z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

export default function SystemTestingPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunTests = async () => {
    setIsRunning(true);
    setResults(null);
    setError(null);

    try {
      const res = await fetch("/api/system-test/run");
      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      setError("System test failed to execute: " + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const renderStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle2 className="text-green-600 h-5 w-5" />
    ) : (
      <XCircle className="text-red-600 h-5 w-5" />
    );
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="text-blue-600 h-7 w-7" />
            System Tester AI
          </h1>
          <p className="text-slate-500 mt-1">
            Comprehensive automated diagnostics for Mason Vector system components
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <FlaskConical className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-slate-800">Automated Testing</h3>
                <p className="text-sm text-slate-600">12+ critical system checks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-slate-800">System Integrity</h3>
                <p className="text-sm text-slate-600">Database, API, Storage validation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-700 font-bold text-sm">QA</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Quality Assurance</h3>
                <p className="text-sm text-slate-600">Real-time diagnostics engine</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Run Test Button */}
      <Card className="shadow-md border border-slate-200">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <FlaskConical className="text-purple-600 h-5 w-5" />
                Automated System Test Suite
              </h2>
              <p className="text-slate-600 mt-1">
                Run comprehensive tests across Supabase connectivity, data integrity, portal access, and workflow systems.
              </p>
            </div>

            <Button
              onClick={handleRunTests}
              disabled={isRunning}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3"
              size="lg"
            >
              {isRunning ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" /> Running Tests...
                </>
              ) : (
                <>⚡ Run Full System Test</>
              )}
            </Button>
          </div>

          {/* Test Coverage Info */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Test Coverage Includes:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-blue-700">
              <div>✓ Supabase Connectivity</div>
              <div>✓ Storage Bucket Access</div>
              <div>✓ Database Schema Integrity</div>
              <div>✓ CSV Import Validation</div>
              <div>✓ Portal Data Access</div>
              <div>✓ Timesheet System</div>
              <div>✓ Admin Role Verification</div>
              <div>✓ Calendar & Reminders</div>
              <div>✓ Audit Logging</div>
              <div>✓ Security & Compliance</div>
              <div>✓ Workflow Automation</div>
              <div>✓ Error Handling</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" /> 
          <span>{error}</span>
        </div>
      )}

      {/* Test Results */}
      {results && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-slate-500 text-sm font-medium">Total Tests</p>
                <p className="text-2xl font-bold text-slate-800">{results.summary.total}</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border border-green-200 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-green-700 text-sm font-medium">Passed</p>
                <p className="text-2xl font-bold text-green-700">{results.summary.passed}</p>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border border-red-200 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-red-700 text-sm font-medium">Failed</p>
                <p className="text-2xl font-bold text-red-700">{results.summary.failed}</p>
              </CardContent>
            </Card>
            <Card 
              className={`shadow-sm ${
                results.summary.status === "PASS ✅"
                  ? "bg-green-50 border-green-300"
                  : "bg-red-50 border-red-300"
              }`}
            >
              <CardContent className="p-4 text-center">
                <p className={`text-sm font-medium ${
                  results.summary.status === "PASS ✅" ? "text-green-700" : "text-red-700"
                }`}>
                  Overall Status
                </p>
                <p className={`text-lg font-bold ${
                  results.summary.status === "PASS ✅" ? "text-green-700" : "text-red-700"
                }`}>
                  {results.summary.status}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(results.timestamp).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Results Table */}
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-blue-600" />
                Detailed Test Results
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 border-b">
                      <th className="py-3 px-4 font-semibold">Test Component</th>
                      <th className="py-3 px-4 font-semibold text-center">Status</th>
                      <th className="py-3 px-4 font-semibold">Details</th>
                      <th className="py-3 px-4 font-semibold text-center">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.results.map((result: any, index: number) => (
                      <tr 
                        key={index} 
                        className={`border-b hover:bg-slate-50 transition-colors ${
                          result.success ? 'bg-green-50/30' : 'bg-red-50/30'
                        }`}
                      >
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {result.test}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {renderStatusIcon(result.success)}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <span className={result.success ? 'text-green-700' : 'text-red-700'}>
                            {result.details}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-center font-mono text-xs">
                          {result.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Test Summary & Next Steps */}
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">System Health Summary</h3>
              
              {results.summary.failed === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">All Systems Operational</span>
                  </div>
                  <p className="text-green-700 text-sm">
                    All {results.summary.total} system tests passed successfully. Mason Vector is operating at full capacity with all components validated.
                  </p>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <span className="font-medium text-amber-800">
                      {results.summary.failed} Issue{results.summary.failed > 1 ? 's' : ''} Detected
                    </span>
                  </div>
                  <p className="text-amber-700 text-sm">
                    Review the failed tests above and address any connectivity, permission, or configuration issues. 
                    {results.summary.passed > 0 && ` ${results.summary.passed} tests passed successfully.`}
                  </p>
                </div>
              )}

              <div className="mt-4 text-xs text-slate-500">
                Last updated: {new Date(results.timestamp).toLocaleString()} • 
                Test execution time: ~{results.results.length * 0.5}s
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}