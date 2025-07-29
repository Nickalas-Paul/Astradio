# Astradio Development Stop Script
# This script properly stops all development servers and cleans up processes

Write-Host "🛑 Stopping Astradio Development Environment" -ForegroundColor Red
Write-Host "=============================================" -ForegroundColor Red

# Stop all background jobs
Write-Host "🔄 Stopping background jobs..." -ForegroundColor Yellow
Get-Job | Stop-Job -ErrorAction SilentlyContinue
Get-Job | Remove-Job -ErrorAction SilentlyContinue

# Kill all Node.js processes
Write-Host "🔄 Stopping Node.js processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "✅ Stopped $($nodeProcesses.Count) Node.js processes" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No Node.js processes found" -ForegroundColor Cyan
}

# Kill processes on specific ports
Write-Host "🔄 Clearing ports..." -ForegroundColor Yellow
$ports = @(3000, 3001, 3002)
foreach ($port in $ports) {
    $processes = netstat -ano | Select-String ":$port " | ForEach-Object {
        ($_ -split '\s+')[-1]
    }
    if ($processes) {
        Write-Host "🛑 Stopping processes on port $port..." -ForegroundColor Yellow
        $processes | ForEach-Object { 
            Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue 
        }
    }
}

# Wait a moment for cleanup
Start-Sleep -Seconds 2

# Verify ports are free
Write-Host "🔍 Verifying ports are free..." -ForegroundColor Yellow
foreach ($port in $ports) {
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $port)
        $connection.Close()
        Write-Host "⚠️  Port $port is still in use" -ForegroundColor Yellow
    }
    catch {
        Write-Host "✅ Port $port is free" -ForegroundColor Green
    }
}

Write-Host "🎉 Development environment stopped successfully!" -ForegroundColor Green
Write-Host "💡 To restart, run: .\start-dev.ps1" -ForegroundColor Cyan 