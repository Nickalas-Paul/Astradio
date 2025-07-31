# Astradio Health Monitor
# Continuously monitors service health and provides alerts

param(
    [int]$Interval = 30,
    [switch]$Continuous = $false
)

Write-Host "🔍 Astradio Health Monitor" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

# Function to check service health
function Test-ServiceHealth {
    param([string]$Name, [string]$URL, [int]$Port)
    
    $health = @{
        Name = $Name
        Port = $Port
        URL = $URL
        Status = "Unknown"
        ResponseTime = 0
        LastCheck = Get-Date
    }
    
    # Check if port is listening
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        $health.Status = "Port Open"
    }
    catch {
        $health.Status = "Port Closed"
        return $health
    }
    
    # Test HTTP endpoint if URL provided
    if ($URL) {
        try {
            $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            $response = Invoke-WebRequest -Uri $URL -UseBasicParsing -TimeoutSec 5
            $stopwatch.Stop()
            
            if ($response.StatusCode -eq 200) {
                $health.Status = "Healthy"
                $health.ResponseTime = $stopwatch.ElapsedMilliseconds
            } else {
                $health.Status = "HTTP Error: $($response.StatusCode)"
            }
        }
        catch {
            $health.Status = "HTTP Error: $($_.Exception.Message)"
        }
    }
    
    return $health
}

# Function to display health status
function Show-HealthStatus {
    param([array]$Services)
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "`n📊 Health Check - $timestamp" -ForegroundColor Cyan
    
    foreach ($service in $Services) {
        $statusColor = switch ($service.Status) {
            "Healthy" { "Green" }
            "Port Open" { "Yellow" }
            default { "Red" }
        }
        
        $statusIcon = switch ($service.Status) {
            "Healthy" { "✅" }
            "Port Open" { "⚠️" }
            default { "❌" }
        }
        
        Write-Host "$statusIcon $($service.Name): $($service.Status)" -ForegroundColor $statusColor
        
        if ($service.ResponseTime -gt 0) {
            Write-Host "   Response Time: $($service.ResponseTime)ms" -ForegroundColor Gray
        }
    }
}

# Function to write health data to log
function Write-HealthData {
    param([array]$Services)
    
    $logFile = "health-monitor.log"
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    foreach ($service in $Services) {
        $logEntry = "$timestamp | $($service.Name) | $($service.Status) | $($service.ResponseTime)ms"
        Add-Content -Path $logFile -Value $logEntry
    }
}

# Function to send alerts
function Send-HealthAlert {
    param([array]$FailedServices)
    
    if ($FailedServices.Count -gt 0) {
        Write-Host "🚨 Health Alert!" -ForegroundColor Red
        Write-Host "The following services are unhealthy:" -ForegroundColor Red
        
        foreach ($service in $FailedServices) {
            Write-Host "   ❌ $($service.Name): $($service.Status)" -ForegroundColor Red
        }
        
        Write-Host "`n💡 Troubleshooting steps:" -ForegroundColor Yellow
        Write-Host "   1. Check if services are running" -ForegroundColor White
        Write-Host "   2. Restart with: .\start-robust.ps1 -Clean" -ForegroundColor White
        Write-Host "   3. Check logs for errors" -ForegroundColor White
    }
}

# Main monitoring loop
$services = @(
    @{Name="API Server"; URL="http://localhost:3001/health"; Port=3001},
    @{Name="Web App"; URL="http://localhost:3000"; Port=3000}
)

Write-Host "Starting health monitoring..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

try {
    do {
        $healthResults = @()
        
        foreach ($service in $services) {
            $health = Test-ServiceHealth -Name $service.Name -URL $service.URL -Port $service.Port
            $healthResults += $health
        }
        
        Show-HealthStatus -Services $healthResults
        Write-HealthData -Services $healthResults
        
        # Check for failed services
        $failedServices = $healthResults | Where-Object { $_.Status -ne "Healthy" }
        Send-HealthAlert -FailedServices $failedServices
        
        if ($Continuous) {
            Write-Host "`n⏳ Waiting $Interval seconds until next check..." -ForegroundColor Gray
            Start-Sleep -Seconds $Interval
        } else {
            break
        }
    } while ($Continuous)
}
catch {
    Write-Host "`n❌ Health monitoring stopped: $($_.Exception.Message)" -ForegroundColor Red
}
finally {
    Write-Host "`n📊 Health monitoring completed" -ForegroundColor Green
} 