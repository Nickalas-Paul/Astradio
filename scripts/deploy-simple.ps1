$ErrorActionPreference="Stop"
Set-StrictMode -Version Latest
function Info($m){Write-Host $m -ForegroundColor Cyan}
function Ok($m){Write-Host $m -ForegroundColor Green}
function Warn($m){Write-Host $m -ForegroundColor Yellow}

Info "Simple Deployment Script"

# Set environment variables
$env:RENDER_API_KEY = "rnd_gKmqXJ9NIcYhZB0PrDJ989uH2H1n"
$env:RENDER_OWNER_ID = "tea-cvu1lsh5pdvs73e3dfe0"

# API URL
$apiUrl = "https://astradio-1.onrender.com"
Ok "Using Render API: $apiUrl"

# Test API health
try {
  $response = Invoke-WebRequest -Uri "$apiUrl/health" -UseBasicParsing
  Ok "API Health: $($response.StatusCode)"
} catch {
  Warn "API Health: $($_.Exception.Message)"
}

# Deploy to Vercel
Info "Deploying to Vercel..."
Push-Location apps/web

# Set environment variable
"$apiUrl" | vercel env add NEXT_PUBLIC_API_URL production

# Deploy
vercel --prod

Pop-Location

Ok "Deployment completed!"
Ok "API: $apiUrl"
Ok "Web: Check Vercel dashboard for URL"
