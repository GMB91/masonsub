# Mason Vector - MasonApp Automated Repairs
# Fixes identified issues from build verification

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "         MASON VECTOR - AUTOMATED BUILD REPAIRS                " -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

$masonAppPath = "c:\Mason Vector\MasonApp"
$repairsMade = 0

# ==============================================================================
# FIX 1: Create .env.local from root .env
# ==============================================================================

Write-Host "Fix 1: Creating .env.local file..." -ForegroundColor Yellow

$envLocalPath = "$masonAppPath\.env.local"
if (-not (Test-Path $envLocalPath)) {
    $rootEnvPath = "c:\Mason Vector\.env"
    
    if (Test-Path $rootEnvPath) {
        Write-Host "  Copying from root .env..." -ForegroundColor Cyan
        Copy-Item $rootEnvPath $envLocalPath
        Write-Host "  [FIXED] .env.local created" -ForegroundColor Green
        $repairsMade++
    } else {
        # Create template
        $envTemplate = @"
# MasonApp Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
"@
        $envTemplate | Out-File -FilePath $envLocalPath -Encoding UTF8
        Write-Host "  [FIXED] .env.local template created" -ForegroundColor Green
        Write-Host "  [ACTION] Update with real Supabase credentials" -ForegroundColor Yellow
        $repairsMade++
    }
} else {
    Write-Host "  [SKIP] .env.local already exists" -ForegroundColor Gray
}

# ==============================================================================
# FIX 2: Create missing UI components
# ==============================================================================

Write-Host ""
Write-Host "Fix 2: Creating missing UI components..." -ForegroundColor Yellow

$uiPath = "$masonAppPath\src\components\ui"
if (-not (Test-Path $uiPath)) {
    New-Item -ItemType Directory -Path $uiPath -Force | Out-Null
    Write-Host "  [CREATED] UI components directory" -ForegroundColor Green
}

# Create input.tsx
$inputPath = "$uiPath\input.tsx"
if (-not (Test-Path $inputPath)) {
    $inputComponent = @'
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm",
          "ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950",
          "dark:placeholder:text-slate-400 dark:focus-visible:ring-indigo-400",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
'@
    $inputComponent | Out-File -FilePath $inputPath -Encoding UTF8
    Write-Host "  [FIXED] input.tsx created" -ForegroundColor Green
    $repairsMade++
} else {
    Write-Host "  [SKIP] input.tsx already exists" -ForegroundColor Gray
}

# ==============================================================================
# FIX 3: Create 404 error page
# ==============================================================================

Write-Host ""
Write-Host "Fix 3: Creating 404 error page..." -ForegroundColor Yellow

$notFoundPath = "$masonAppPath\src\app\not-found.tsx"
if (-not (Test-Path $notFoundPath)) {
    $notFoundComponent = @'
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-indigo-600 dark:text-indigo-400">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
          Page Not Found
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-6">
          <Link href="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
'@
    $notFoundComponent | Out-File -FilePath $notFoundPath -Encoding UTF8
    Write-Host "  [FIXED] not-found.tsx created" -ForegroundColor Green
    $repairsMade++
} else {
    Write-Host "  [SKIP] not-found.tsx already exists" -ForegroundColor Gray
}

# ==============================================================================
# FIX 4: Create robots.txt
# ==============================================================================

Write-Host ""
Write-Host "Fix 4: Creating robots.txt..." -ForegroundColor Yellow

$robotsPath = "$masonAppPath\public\robots.txt"
if (-not (Test-Path $robotsPath)) {
    $robotsContent = @"
# Mason Vector Platform - Robots.txt
User-agent: *
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Allow: /

Sitemap: https://masonvector.com/sitemap.xml
"@
    $robotsContent | Out-File -FilePath $robotsPath -Encoding UTF8
    Write-Host "  [FIXED] robots.txt created" -ForegroundColor Green
    $repairsMade++
} else {
    Write-Host "  [SKIP] robots.txt already exists" -ForegroundColor Gray
}

# ==============================================================================
# FIX 5: Create security.txt
# ==============================================================================

Write-Host ""
Write-Host "Fix 5: Creating security.txt..." -ForegroundColor Yellow

$securityPath = "$masonAppPath\public\security.txt"
if (-not (Test-Path $securityPath)) {
    $securityContent = @"
# Mason Vector Platform - Security Policy
Contact: security@masonvector.com
Expires: 2026-12-31T23:59:59.000Z
Preferred-Languages: en
Canonical: https://masonvector.com/security.txt

# Please report security vulnerabilities responsibly
# Do not publicly disclose until we have had time to address
"@
    $securityContent | Out-File -FilePath $securityPath -Encoding UTF8
    Write-Host "  [FIXED] security.txt created" -ForegroundColor Green
    $repairsMade++
} else {
    Write-Host "  [SKIP] security.txt already exists" -ForegroundColor Gray
}

# ==============================================================================
# FIX 6: Create auth directory structure
# ==============================================================================

Write-Host ""
Write-Host "Fix 6: Creating auth directory structure..." -ForegroundColor Yellow

$authPath = "$masonAppPath\src\app\auth"
if (-not (Test-Path $authPath)) {
    New-Item -ItemType Directory -Path $authPath -Force | Out-Null
    New-Item -ItemType Directory -Path "$authPath\login" -Force | Out-Null
    New-Item -ItemType Directory -Path "$authPath\signup" -Force | Out-Null
    New-Item -ItemType Directory -Path "$authPath\callback" -Force | Out-Null
    
    Write-Host "  [FIXED] Created /src/app/auth/ directory structure" -ForegroundColor Green
    $repairsMade++
} else {
    Write-Host "  [SKIP] Auth directory already exists" -ForegroundColor Gray
}

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "                      REPAIR SUMMARY                           " -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Repairs Made: " -NoNewline
Write-Host $repairsMade -ForegroundColor Green

Write-Host ""
Write-Host "Manual Actions Required:" -ForegroundColor Yellow
Write-Host "  1. Update .env.local with real Supabase credentials" -ForegroundColor White
Write-Host "  2. Create/add favicon.ico to /public/" -ForegroundColor White
Write-Host "  3. Implement auth pages (login, signup, callback)" -ForegroundColor White
Write-Host "  4. Run: npm install" -ForegroundColor White

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Re-run: .\build_verification.ps1" -ForegroundColor White
Write-Host "  2. Start dev server: npm run dev" -ForegroundColor White

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

exit 0
