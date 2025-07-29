# Astradio Development Status Monitor
# This script checks the status of all development servers

Write-Host "📊 Astradio Development Environment Status" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Function to check server status
function Test-ServerStatus {
    param([string]$Url, [string]$Name, [string]$Port)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $Name (Port $Port): RUNNING" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⚠️  $Name (Port $Port): RESPONDING BUT UNHEALTHY" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        Write-Host "❌ $Name (Port $Port): NOT RUNNING" -ForegroundColor Red
        return $false
    }
}

# Function to check port usage
function Test-PortUsage {
    param([int]$Port)
    
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Check Node.js processes
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
Write-Host "🔍 Node.js Processes: $($nodeProcesses.Count) running" -ForegroundColor Yellow

# Check background jobs
$jobs = Get-Job -ErrorAction SilentlyContinue
Write-Host "🔍 Background Jobs: $($jobs.Count) active" -ForegroundColor Yellow

# Check server statuses
Write-Host "`n🌐 Server Status:" -ForegroundColor Cyan
$apiStatus = Test-ServerStatus "http://localhost:3001/health" "API Server" "3001"
$webStatus = Test-ServerStatus "http://localhost:3000" "Web Server" "3000"

# Check port usage
Write-Host "`n🔌 Port Usage:" -ForegroundColor Cyan
$ports = @(3000, 3001, 3002)
foreach ($port in $ports) {
    if (Test-PortUsage $port) {
        Write-Host "Port $port`: IN USE" -ForegroundColor Red
    } else {
        Write-Host "Port $port`: FREE" -ForegroundColor Green
    }
}

# Summary
Write-Host "`n📋 Summary:" -ForegroundColor Cyan
if ($apiStatus -and $webStatus) {
    Write-Host "🎉 All servers are running properly!" -ForegroundColor Green
    Write-Host "📊 API Health: http://localhost:3001/health" -ForegroundColor Cyan
    Write-Host "🌐 Web App: http://localhost:3000" -ForegroundColor Cyan
} elseif ($apiStatus) {
    Write-Host "⚠️  API server is running, but web server may have issues" -ForegroundColor Yellow
} elseif ($webStatus) {
    Write-Host "⚠️  Web server is running, but API server may have issues" -ForegroundColor Yellow
} else {
    Write-Host "No servers are running properly" -ForegroundColor Red
    Write-Host "Run .\start-dev.ps1 to start the development environment" -ForegroundColor Cyan
}

# Quick actions
Write-Host "`n🔧 Quick Actions:" -ForegroundColor Cyan
Write-Host "   Start: .\start-dev.ps1" -ForegroundColor White
Write-Host "   Stop:  .\stop-dev.ps1" -ForegroundColor White
Write-Host "   Status: .\status-dev.ps1" -ForegroundColor White 