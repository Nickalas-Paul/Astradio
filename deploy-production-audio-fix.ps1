# Production Audio Fix Deployment Script
Write-Host "🎵 Deploying Audio Fixes to Production..." -ForegroundColor Green

# Step 1: Verify local environment
Write-Host "`n1. Checking local environment..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Local API: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Local API: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 2: Test production API
Write-Host "`n2. Testing production API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://astradio.onrender.com/health" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ Production API: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Production API: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Test audio endpoint
Write-Host "`n3. Testing production audio endpoint..." -ForegroundColor Yellow
try {
    $body = @{
        chart_data = @{
            metadata = @{
                birth_datetime = "1990-01-01T12:00:00Z"
            }
            planets = @{}
        }
        mode = "moments"
    } | ConvertTo-Json -Depth 3

    $response = Invoke-WebRequest -Uri "https://astradio.onrender.com/api/audio/sequential" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 15
    Write-Host "✅ Production Audio: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Production Audio: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎵 Audio Fix Deployment Complete!" -ForegroundColor Green
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Deploy to Vercel with environment variable:" -ForegroundColor White
Write-Host "   NEXT_PUBLIC_API_URL=https://astradio.onrender.com" -ForegroundColor Cyan
Write-Host "2. Test the deployed app at your Vercel URL" -ForegroundColor White
Write-Host "3. Verify audio generation works in production" -ForegroundColor White 