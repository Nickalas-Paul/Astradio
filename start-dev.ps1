# Astradio Development Startup Script
# This script ensures proper startup sequence and prevents port conflicts

param(
    [switch]$Clean,
    [switch]$ApiOnly,
    [switch]$WebOnly
)

Write-Host "🚀 Astradio Development Environment Startup" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Function to check if port is in use
function Test-Port {
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

# Function to kill processes on specific port
function Stop-PortProcess {
    param([int]$Port)
    $processes = netstat -ano | Select-String ":$Port " | ForEach-Object {
        ($_ -split '\s+')[-1]
    }
    if ($processes) {
        Write-Host "🛑 Stopping processes on port $Port..." -ForegroundColor Yellow
        $processes | ForEach-Object { 
            Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue 
        }
        Start-Sleep -Seconds 2
    }
}

# Function to wait for server to be ready
function Wait-ForServer {
    param([string]$Url, [string]$Name, [int]$Timeout = 30)
    Write-Host "⏳ Waiting for $Name to be ready..." -ForegroundColor Yellow
    $startTime = Get-Date
    do {
        try {
            $response = Invoke-WebRequest -Uri $Url -TimeoutSec 5 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ $Name is ready!" -ForegroundColor Green
                return $true
            }
        }
        catch {
            $elapsed = (Get-Date) - $startTime
            if ($elapsed.TotalSeconds -gt $Timeout) {
                Write-Host "❌ $Name failed to start within $Timeout seconds" -ForegroundColor Red
                return $false
            }
            Start-Sleep -Seconds 1
        }
    } while ($true)
}

# Clean mode - kill all Node processes
if ($Clean) {
    Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 3
}

# Check and clear ports
Write-Host "🔍 Checking port availability..." -ForegroundColor Yellow
if (Test-Port 3001) {
    Write-Host "⚠️  Port 3001 is in use, clearing..." -ForegroundColor Yellow
    Stop-PortProcess 3001
}
if (Test-Port 3000) {
    Write-Host "⚠️  Port 3000 is in use, clearing..." -ForegroundColor Yellow
    Stop-PortProcess 3000
}

# Start API Server
if (-not $WebOnly) {
    Write-Host "🔧 Starting API Server..." -ForegroundColor Cyan
    $apiJob = Start-Job -ScriptBlock {
        Set-Location "C:\Users\nicka\OneDrive\Desktop\Astradio\apps\api"
        npm run dev
    }
    
    # Wait for API to be ready
    if (Wait-ForServer "http://localhost:3001/health" "API Server") {
        Write-Host "✅ API Server started successfully on port 3001" -ForegroundColor Green
    } else {
        Write-Host "❌ API Server failed to start" -ForegroundColor Red
        exit 1
    }
}

# Start Web Server
if (-not $ApiOnly) {
    Write-Host "🌐 Starting Web Server..." -ForegroundColor Cyan
    $webJob = Start-Job -ScriptBlock {
        Set-Location "C:\Users\nicka\OneDrive\Desktop\Astradio\apps\web"
        npm run dev
    }
    
    # Wait for Web to be ready
    if (Wait-ForServer "http://localhost:3000" "Web Server") {
        Write-Host "✅ Web Server started successfully on port 3000" -ForegroundColor Green
    } else {
        Write-Host "❌ Web Server failed to start" -ForegroundColor Red
        exit 1
    }
}

Write-Host "🎉 All servers started successfully!" -ForegroundColor Green
Write-Host "📊 API Health: http://localhost:3001/health" -ForegroundColor Cyan
Write-Host "🌐 Web App: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 To stop servers, press Ctrl+C or run: Get-Job | Stop-Job" -ForegroundColor Yellow

# Keep script running to maintain jobs
try {
    while ($true) {
        Start-Sleep -Seconds 10
        $apiStatus = Get-Job -Name $apiJob.Name -ErrorAction SilentlyContinue
        $webStatus = Get-Job -Name $webJob.Name -ErrorAction SilentlyContinue
        
        if ($apiStatus.State -eq "Failed" -or $webStatus.State -eq "Failed") {
            Write-Host "❌ One or more servers crashed. Check logs for details." -ForegroundColor Red
            break
        }
    }
}
catch {
    Write-Host "🛑 Shutting down servers..." -ForegroundColor Yellow
    Get-Job | Stop-Job
    Get-Job | Remove-Job
} 