# Mason Vector - MasonApp Build Verification
# Comprehensive validation of main application structure and functionality

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "       MASON VECTOR - MASONAPP BUILD VERIFICATION              " -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

$validationReport = @{
    missing_files = @()
    auth_issues = @()
    supabase_errors = @()
    ui_failures = @()
    build_warnings = @()
    structure_issues = @()
    passed_checks = @()
}

$checksPassed = 0
$checksFailed = 0

function Test-ValidationCheck {
    param($category, $name, $condition, $successMsg, $failMsg)
    
    if ($condition) {
        Write-Host "[PASS] $name" -ForegroundColor Green
        $script:checksPassed++
        $validationReport.passed_checks += "$category - $name"
    } else {
        Write-Host "[FAIL] $name - $failMsg" -ForegroundColor Red
        $script:checksFailed++
        switch ($category) {
            "FILE" { $validationReport.missing_files += "$name`: $failMsg" }
            "AUTH" { $validationReport.auth_issues += "$name`: $failMsg" }
            "SUPABASE" { $validationReport.supabase_errors += "$name`: $failMsg" }
            "UI" { $validationReport.ui_failures += "$name`: $failMsg" }
            "BUILD" { $validationReport.build_warnings += "$name`: $failMsg" }
            "STRUCTURE" { $validationReport.structure_issues += "$name`: $failMsg" }
        }
    }
}

function Test-Warning {
    param($message)
    Write-Host "[WARN] $message" -ForegroundColor Yellow
}

# ==============================================================================
# STEP 1: FOLDER AND LAYOUT VALIDATION
# ==============================================================================

Write-Host "Step 1: Folder and Layout Validation" -ForegroundColor Magenta
Write-Host "-------------------------------------" -ForegroundColor Magenta

$masonAppPath = "c:\Mason Vector\MasonApp"

# Check primary directories
$requiredDirs = @(
    "app",
    "src\app",
    "src\components",
    "src\lib",
    "src\styles",
    "public"
)

foreach ($dir in $requiredDirs) {
    $fullPath = Join-Path $masonAppPath $dir
    $exists = Test-Path $fullPath
    Test-ValidationCheck "STRUCTURE" "Directory: $dir" $exists "Exists" "Missing directory"
}

# Check layout files
$layoutInApp = Test-Path "$masonAppPath\app\layout.tsx"
$layoutInSrc = Test-Path "$masonAppPath\src\app\layout.tsx"
$layoutClientInSrc = Test-Path "$masonAppPath\src\app\layout-client.tsx"

Test-ValidationCheck "STRUCTURE" "layout.tsx in /app/" $layoutInApp "Found" "Missing"
Test-ValidationCheck "STRUCTURE" "layout.tsx in /src/app/" $layoutInSrc "Found (duplicate)" "Missing"
Test-ValidationCheck "FILE" "layout-client.tsx" $layoutClientInSrc "Found in /src/app/" "Missing"

if ($layoutInApp -and $layoutInSrc) {
    Test-Warning "DUPLICATE LAYOUT FILES: Both /app/layout.tsx and /src/app/ exist - this may cause routing conflicts"
    $validationReport.structure_issues += "Duplicate layout.tsx files in /app/ and /src/app/"
}

# Check tsconfig.json paths configuration
$tsconfigPath = "$masonAppPath\tsconfig.json"
if (Test-Path $tsconfigPath) {
    $tsconfigContent = Get-Content $tsconfigPath -Raw
    if ($tsconfigContent -match '"@/\*":\s*\["./src/\*"\]') {
        Write-Host "[INFO] tsconfig paths point to ./src/* but layout is in /app/" -ForegroundColor Cyan
        if ($layoutInApp) {
            $validationReport.structure_issues += "Path alias @/* points to ./src/* but main layout.tsx is in /app/ root"
        }
    }
}

Write-Host ""

# ==============================================================================
# STEP 2: SUPABASE CONFIGURATION
# ==============================================================================

Write-Host "Step 2: Supabase Configuration" -ForegroundColor Magenta
Write-Host "-------------------------------" -ForegroundColor Magenta

# Check .env.local
$envLocalPath = "$masonAppPath\.env.local"
$envLocalExists = Test-Path $envLocalPath

Test-ValidationCheck "SUPABASE" ".env.local file" $envLocalExists "Present" "Missing - create from .env.example"

if ($envLocalExists) {
    $envContent = Get-Content $envLocalPath -Raw
    
    $hasSupabaseUrl = $envContent -match "NEXT_PUBLIC_SUPABASE_URL="
    $hasSupabaseKey = $envContent -match "NEXT_PUBLIC_SUPABASE_ANON_KEY="
    
    Test-ValidationCheck "SUPABASE" "SUPABASE_URL configured" $hasSupabaseUrl "Found" "Missing NEXT_PUBLIC_SUPABASE_URL"
    Test-ValidationCheck "SUPABASE" "SUPABASE_ANON_KEY configured" $hasSupabaseKey "Found" "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY"
    
    if ($envContent -match "your-project\.supabase\.co" -or $envContent -match "your-.*-here") {
        Test-Warning "Environment file contains placeholder values"
        $validationReport.supabase_errors += "Placeholder values in .env.local"
    }
}

# Check supabaseClient.ts
$supabaseClientPaths = @(
    "$masonAppPath\src\lib\supabaseClient.ts",
    "$masonAppPath\lib\supabaseClient.ts",
    "$masonAppPath\src\lib\supabase.ts"
)

$supabaseClientFound = $false
foreach ($path in $supabaseClientPaths) {
    if (Test-Path $path) {
        $supabaseClientFound = $true
        Write-Host "[OK] Supabase client found: $path" -ForegroundColor Green
        
        $clientContent = Get-Content $path -Raw
        $hasCreateClient = $clientContent -match "createClient|createBrowserClient|createClientComponentClient"
        
        Test-ValidationCheck "SUPABASE" "Supabase client initialization" $hasCreateClient "Uses createClient" "Missing createClient call"
        break
    }
}

Test-ValidationCheck "FILE" "Supabase client file" $supabaseClientFound "Found" "Missing supabaseClient.ts or supabase.ts"

Write-Host ""

# ==============================================================================
# STEP 3: AUTHENTICATION FLOW
# ==============================================================================

Write-Host "Step 3: Authentication Flow" -ForegroundColor Magenta
Write-Host "---------------------------" -ForegroundColor Magenta

# Check for auth routes
$authPaths = @(
    "$masonAppPath\src\app\auth",
    "$masonAppPath\app\auth",
    "$masonAppPath\src\app\login",
    "$masonAppPath\app\login"
)

$authRouteFound = $false
foreach ($path in $authPaths) {
    if (Test-Path $path) {
        $authRouteFound = $true
        Write-Host "[OK] Auth routes found: $path" -ForegroundColor Green
        break
    }
}

Test-ValidationCheck "AUTH" "Auth routes directory" $authRouteFound "Found" "Missing /auth/ or /login/ directory"

# Check for session management
$middlewarePaths = @(
    "$masonAppPath\middleware.ts",
    "$masonAppPath\src\middleware.ts"
)

$middlewareFound = $false
foreach ($path in $middlewarePaths) {
    if (Test-Path $path) {
        $middlewareFound = $true
        Write-Host "[OK] Middleware found: $path" -ForegroundColor Green
        break
    }
}

if (-not $middlewareFound) {
    Test-Warning "No middleware.ts found - session persistence may not work across routes"
    $validationReport.auth_issues += "Missing middleware.ts for session management"
}

Write-Host ""

# ==============================================================================
# STEP 4: ROUTING & DYNAMIC PAGES
# ==============================================================================

Write-Host "Step 4: Routing & Dynamic Pages" -ForegroundColor Magenta
Write-Host "--------------------------------" -ForegroundColor Magenta

# Check dashboard
$dashboardPaths = @(
    "$masonAppPath\src\app\dashboard\page.tsx",
    "$masonAppPath\app\dashboard\page.tsx"
)

$dashboardFound = $false
foreach ($path in $dashboardPaths) {
    if (Test-Path $path) {
        $dashboardFound = $true
        Write-Host "[OK] Dashboard found: $path" -ForegroundColor Green
        break
    }
}

Test-ValidationCheck "FILE" "Dashboard route" $dashboardFound "Found /dashboard/page.tsx" "Missing dashboard route"

# Check for dynamic org routes
$orgRoutePaths = @(
    "$masonAppPath\src\app\org\[org]\page.tsx",
    "$masonAppPath\app\org\[org]\page.tsx",
    "$masonAppPath\src\app\org\[orgId]\page.tsx"
)

$orgRouteFound = $false
foreach ($path in $orgRoutePaths) {
    if (Test-Path $path) {
        $orgRouteFound = $true
        Write-Host "[OK] Dynamic org route found: $path" -ForegroundColor Green
        break
    }
}

if (-not $orgRouteFound) {
    Test-Warning "No dynamic org route found (e.g., /org/[org]/)"
    $validationReport.structure_issues += "Missing dynamic tenant route pattern"
}

# Check error pages
$notFoundPaths = @(
    "$masonAppPath\src\app\not-found.tsx",
    "$masonAppPath\app\not-found.tsx"
)

$notFoundFound = $false
foreach ($path in $notFoundPaths) {
    if (Test-Path $path) {
        $notFoundFound = $true
        break
    }
}

Test-ValidationCheck "FILE" "404 error page" $notFoundFound "Found not-found.tsx" "Missing custom 404 page"

Write-Host ""

# ==============================================================================
# STEP 5: UI & STYLING INTEGRITY
# ==============================================================================

Write-Host "Step 5: UI & Styling Integrity" -ForegroundColor Magenta
Write-Host "-------------------------------" -ForegroundColor Magenta

# Check Tailwind config
$tailwindPath = "$masonAppPath\tailwind.config.cjs"
$tailwindExists = Test-Path $tailwindPath

Test-ValidationCheck "UI" "Tailwind config" $tailwindExists "Found tailwind.config.cjs" "Missing Tailwind configuration"

if ($tailwindExists) {
    $tailwindContent = Get-Content $tailwindPath -Raw
    $hasMasonColors = $tailwindContent -match "#4F46E5|#64748B|indigo|slate"
    
    if ($hasMasonColors) {
        Write-Host "[OK] Mason Vector color palette detected in Tailwind config" -ForegroundColor Green
    } else {
        Test-Warning "Mason Vector brand colors not found in Tailwind config"
        $validationReport.ui_failures += "Missing Mason Vector color palette (#4F46E5 indigo, #64748B slate)"
    }
}

# Check globals.css
$globalsCssPaths = @(
    "$masonAppPath\src\styles\globals.css",
    "$masonAppPath\app\globals.css",
    "$masonAppPath\src\app\globals.css"
)

$globalsCssFound = $false
foreach ($path in $globalsCssPaths) {
    if (Test-Path $path) {
        $globalsCssFound = $true
        Write-Host "[OK] Global CSS found: $path" -ForegroundColor Green
        break
    }
}

Test-ValidationCheck "UI" "Global CSS file" $globalsCssFound "Found globals.css" "Missing global styles"

# Check UI components
$uiComponentsPath = "$masonAppPath\src\components\ui"
if (Test-Path $uiComponentsPath) {
    $uiComponents = Get-ChildItem $uiComponentsPath -Filter "*.tsx" | Select-Object -ExpandProperty Name
    Write-Host "[OK] Found $($uiComponents.Count) UI components" -ForegroundColor Green
    
    $requiredComponents = @("button.tsx", "card.tsx", "input.tsx")
    foreach ($comp in $requiredComponents) {
        $found = $uiComponents -contains $comp
        if ($found) {
            Write-Host "  [OK] $comp" -ForegroundColor Green
        } else {
            Write-Host "  [MISS] $comp missing" -ForegroundColor Red
            $validationReport.ui_failures += "Missing UI component: $comp"
        }
    }
} else {
    Test-Warning "UI components directory not found at $uiComponentsPath"
    $validationReport.ui_failures += "Missing /src/components/ui/ directory"
}

# Check public assets
$publicPath = "$masonAppPath\public"
if (Test-Path $publicPath) {
    $favicon = Test-Path "$publicPath\favicon.ico"
    Test-ValidationCheck "UI" "Favicon" $favicon "Found favicon.ico" "Missing favicon"
} else {
    $validationReport.ui_failures += "Missing /public/ directory"
}

Write-Host ""

# ==============================================================================
# STEP 6: FUNCTIONAL COMPONENTS
# ==============================================================================

Write-Host "Step 6: Functional Components" -ForegroundColor Magenta
Write-Host "------------------------------" -ForegroundColor Magenta

# Check for ThemeProvider
$layoutClientPath = "$masonAppPath\src\app\layout-client.tsx"
if (Test-Path $layoutClientPath) {
    $layoutClientContent = Get-Content $layoutClientPath -Raw
    
    $hasThemeProvider = $layoutClientContent -match "ThemeProvider"
    $hasToaster = $layoutClientContent -match "Toaster"
    $hasUseClient = $layoutClientContent -match '"use client"'
    
    Test-ValidationCheck "UI" "ThemeProvider in layout-client" $hasThemeProvider "Found" "Missing ThemeProvider"
    Test-ValidationCheck "UI" "Toaster notifications" $hasToaster "Found" "Missing Toaster component"
    Test-ValidationCheck "STRUCTURE" "'use client' directive" $hasUseClient "Present" "Missing 'use client' in layout-client.tsx"
}

# Check for API routes
$apiPath = "$masonAppPath\src\app\api"
if (-not (Test-Path $apiPath)) {
    $apiPath = "$masonAppPath\app\api"
}

if (Test-Path $apiPath) {
    $apiRoutes = Get-ChildItem $apiPath -Recurse -Filter "route.ts" -ErrorAction SilentlyContinue
    Write-Host "[OK] Found $($apiRoutes.Count) API routes" -ForegroundColor Green
} else {
    Test-Warning "No /api/ directory found"
}

Write-Host ""

# ==============================================================================
# STEP 7: SECURITY & COMPLIANCE
# ==============================================================================

Write-Host "Step 7: Security and Compliance" -ForegroundColor Magenta
Write-Host "--------------------------------" -ForegroundColor Magenta

# Check security files
$securityFiles = @(
    @{path="$masonAppPath\public\robots.txt"; name="robots.txt"},
    @{path="$masonAppPath\public\security.txt"; name="security.txt"},
    @{path="$masonAppPath\.gitignore"; name=".gitignore"}
)

foreach ($file in $securityFiles) {
    $exists = Test-Path $file.path
    Test-ValidationCheck "FILE" $file.name $exists "Present" "Missing"
}

# Check .gitignore for secrets
if (Test-Path "$masonAppPath\.gitignore") {
    $gitignoreContent = Get-Content "$masonAppPath\.gitignore" -Raw
    $ignoresEnv = $gitignoreContent -match "\.env"
    
    Test-ValidationCheck "SECURITY" ".env in .gitignore" $ignoresEnv ".env files protected" ".env files may be exposed"
}

Write-Host ""

# ==============================================================================
# STEP 8: BUILD & DOCKER VALIDATION
# ==============================================================================

Write-Host "Step 8: Build and Docker Validation" -ForegroundColor Magenta
Write-Host "------------------------------------" -ForegroundColor Magenta

Push-Location $masonAppPath

# Check package.json
$packageJsonExists = Test-Path "package.json"
Test-ValidationCheck "BUILD" "package.json" $packageJsonExists "Found" "Missing"

if ($packageJsonExists) {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    
    $hasDevScript = $null -ne $packageJson.scripts.dev
    $hasBuildScript = $null -ne $packageJson.scripts.build
    $hasStartScript = $null -ne $packageJson.scripts.start
    
    Test-ValidationCheck "BUILD" "dev script" $hasDevScript "Found" "Missing dev script"
    Test-ValidationCheck "BUILD" "build script" $hasBuildScript "Found" "Missing build script"
    Test-ValidationCheck "BUILD" "start script" $hasStartScript "Found" "Missing start script"
}

# Check Dockerfile
$dockerfileExists = Test-Path "Dockerfile"
Test-ValidationCheck "BUILD" "Dockerfile" $dockerfileExists "Found" "Missing Dockerfile"

# Check node_modules
$nodeModulesExists = Test-Path "node_modules"
if ($nodeModulesExists) {
    Write-Host "[OK] node_modules directory exists" -ForegroundColor Green
} else {
    Test-Warning "node_modules not found - run: npm install"
    $validationReport.build_warnings += "Dependencies not installed (missing node_modules)"
}

Pop-Location

Write-Host ""

# ==============================================================================
# STEP 9: AGENT INTEGRATION
# ==============================================================================

Write-Host "Step 9: Agent Integration" -ForegroundColor Magenta
Write-Host "-------------------------" -ForegroundColor Magenta

$agentsPath = "c:\Mason Vector\agents"
$requiredAgents = @(
    "Tracer ai",
    "Database Admin AI",
    "Sentinel Agent"
)

foreach ($agent in $requiredAgents) {
    $agentPath = Join-Path $agentsPath $agent
    $exists = Test-Path $agentPath
    Test-ValidationCheck "STRUCTURE" "Agent: $agent" $exists "Found in /agents/" "Missing"
}

# Check global config
$globalConfigPaths = @(
    "c:\Mason Vector\config\global.env",
    "c:\Mason Vector\.env"
)

$globalConfigFound = $false
foreach ($path in $globalConfigPaths) {
    if (Test-Path $path) {
        $globalConfigFound = $true
        Write-Host "[OK] Global config found: $path" -ForegroundColor Green
        break
    }
}

if (-not $globalConfigFound) {
    Test-Warning "No global configuration file found"
}

Write-Host ""

# ==============================================================================
# FINAL REPORT
# ==============================================================================

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "                   BUILD VERIFICATION REPORT                   " -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

$total = $checksPassed + $checksFailed
$successRate = if ($total -gt 0) { [math]::Round(($checksPassed / $total) * 100, 1) } else { 0 }

Write-Host "Checks Passed: " -NoNewline
Write-Host $checksPassed -ForegroundColor Green
Write-Host "Checks Failed: " -NoNewline
Write-Host $checksFailed -ForegroundColor Red
Write-Host "Success Rate:  " -NoNewline
if ($successRate -ge 80) {
    Write-Host "$successRate%" -ForegroundColor Green
} elseif ($successRate -ge 60) {
    Write-Host "$successRate%" -ForegroundColor Yellow
} else {
    Write-Host "$successRate%" -ForegroundColor Red
}

Write-Host ""
Write-Host "Overall Status: " -NoNewline
if ($checksFailed -eq 0) {
    Write-Host "BUILD READY" -ForegroundColor Green
} elseif ($checksFailed -le 5) {
    Write-Host "NEEDS MINOR FIXES" -ForegroundColor Yellow
} else {
    Write-Host "REQUIRES ATTENTION" -ForegroundColor Red
}

# Generate JSON report
$jsonReport = $validationReport | ConvertTo-Json -Depth 3
$reportPath = "c:\Mason Vector\MasonApp\validation_report.json"
$jsonReport | Out-File -FilePath $reportPath -Encoding UTF8

Write-Host ""
Write-Host "Detailed JSON report saved to:" -ForegroundColor Cyan
Write-Host "  $reportPath" -ForegroundColor White

# Display issues
if ($validationReport.structure_issues.Count -gt 0) {
    Write-Host ""
    Write-Host "Structure Issues:" -ForegroundColor Yellow
    foreach ($issue in $validationReport.structure_issues) {
        Write-Host "  - $issue" -ForegroundColor Yellow
    }
}

if ($validationReport.missing_files.Count -gt 0) {
    Write-Host ""
    Write-Host "Missing Files:" -ForegroundColor Red
    foreach ($file in $validationReport.missing_files) {
        Write-Host "  - $file" -ForegroundColor Red
    }
}

if ($validationReport.supabase_errors.Count -gt 0) {
    Write-Host ""
    Write-Host "Supabase Issues:" -ForegroundColor Red
    foreach ($supabaseError in $validationReport.supabase_errors) {
        Write-Host "  - $supabaseError" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

# Return exit code
if ($checksFailed -eq 0) {
    exit 0
} else {
    exit 1
}
