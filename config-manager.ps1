# Astradio Configuration Manager
# Manages environment variables, ports, and settings

param(
    [string]$Action = "check",
    [string]$Environment = "development"
)

Write-Host "⚙️ Astradio Configuration Manager" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green

# Function to check current configuration
function Test-Configuration {
    Write-Host "🔍 Checking current configuration..." -ForegroundColor Yellow
    
    # Check environment file
    if (Test-Path ".env") {
        Write-Host "✅ .env file found" -ForegroundColor Green
        $envContent = Get-Content ".env"
        $envLines = $envContent.Count
        Write-Host "   Lines: $envLines" -ForegroundColor Gray
    } else {
        Write-Host "❌ .env file missing" -ForegroundColor Red
    }
    
    # Check package.json files
    $packageFiles = @(
        "package.json",
        "apps/api/package.json",
        "apps/web/package.json",
        "packages/types/package.json",
        "packages/astro-core/package.json",
        "packages/audio-mappings/package.json"
    )
    
    foreach ($file in $packageFiles) {
        if (Test-Path $file) {
            Write-Host "✅ $file found" -ForegroundColor Green
        } else {
            Write-Host "❌ $file missing" -ForegroundColor Red
        }
    }
    
    # Check port configuration
    Write-Host "`n🔌 Port Configuration:" -ForegroundColor Yellow
    $ports = @(3000, 3001, 3002, 3003, 3004)
    foreach ($port in $ports) {
        $inUse = Test-PortInUse -Port $port
        if ($inUse) {
            Write-Host "⚠️ Port $port is in use" -ForegroundColor Yellow
        } else {
            Write-Host "✅ Port $port is available" -ForegroundColor Green
        }
    }
}

# Function to check if port is in use
function Test-PortInUse {
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

# Function to create environment file
function New-EnvironmentFile {
    Write-Host "🔧 Creating environment file..." -ForegroundColor Yellow
    
    $envContent = @"
# Astradio Environment Configuration
# Generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# API Configuration
API_PORT=3001
NODE_ENV=development

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# Swiss Ephemeris Integration (local calculations)
SWISS_EPHEMERIS_ENABLED="true"
SWISS_EPHEMERIS_PRECISION="high"

# Supabase (get from https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"

# Database Configuration
DATABASE_URL="file:./astroaudio.db"

# Security Configuration
CORS_ORIGINS="http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004"

# Audio Configuration
AUDIO_SAMPLE_RATE=44100
AUDIO_BUFFER_SIZE=4096

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=astradio.log
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Created .env file" -ForegroundColor Green
}

# Function to validate configuration
function Test-ConfigurationValidity {
    Write-Host "🔍 Validating configuration..." -ForegroundColor Yellow
    
    $errors = @()
    $warnings = @()
    
    # Check required environment variables
    if (Test-Path ".env") {
        $envContent = Get-Content ".env"
        
        $requiredVars = @(
            "API_PORT",
            "NODE_ENV",
            "NEXT_PUBLIC_API_URL"
        )
        
        foreach ($var in $requiredVars) {
            if ($envContent -match "^$var=") {
                Write-Host "✅ $var is set" -ForegroundColor Green
            } else {
                $errors += "Missing required environment variable: $var"
            }
        }
        
        # Check for placeholder values
        $placeholderVars = @(
                    "true",
        "high",
            "your_supabase_url",
            "your_supabase_anon_key"
        )
        
        foreach ($placeholder in $placeholderVars) {
            if ($envContent -match $placeholder) {
                $warnings += "Using placeholder value: $placeholder"
            }
        }
    } else {
        $errors += "Missing .env file"
    }
    
    # Check package.json consistency
    $packageFiles = @(
        "apps/api/package.json",
        "apps/web/package.json"
    )
    
    foreach ($file in $packageFiles) {
        if (Test-Path $file) {
            try {
                $package = Get-Content $file | ConvertFrom-Json
                if ($package.scripts.dev) {
                    Write-Host "✅ $file has dev script" -ForegroundColor Green
                } else {
                    $errors += "$file missing dev script"
                }
            }
            catch {
                $errors += "Invalid JSON in $file"
            }
        } else {
            $errors += "Missing $file"
        }
    }
    
    # Display results
    if ($errors.Count -gt 0) {
        Write-Host "`n❌ Configuration Errors:" -ForegroundColor Red
        foreach ($err in $errors) {
            Write-Host "   $err" -ForegroundColor Red
        }
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "`n⚠️ Configuration Warnings:" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "   $warning" -ForegroundColor Yellow
        }
    }
    
    if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
        Write-Host "`n✅ Configuration is valid" -ForegroundColor Green
    }
}

# Function to backup configuration
function Backup-Configuration {
    Write-Host "💾 Creating configuration backup..." -ForegroundColor Yellow
    
    $backupDir = "backups/$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')"
    New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
    
    $filesToBackup = @(
        ".env",
        "package.json",
        "apps/api/package.json",
        "apps/web/package.json",
        "apps/api/src/app.ts",
        "apps/web/src/app/page.tsx"
    )
    
    foreach ($file in $filesToBackup) {
        if (Test-Path $file) {
            $destPath = "$backupDir/$file"
            $destDir = Split-Path $destPath -Parent
            New-Item -ItemType Directory -Force -Path $destDir | Out-Null
            Copy-Item $file $destPath
            Write-Host "✅ Backed up: $file" -ForegroundColor Green
        }
    }
    
    Write-Host "✅ Configuration backup created in: $backupDir" -ForegroundColor Green
}

# Function to restore configuration
function Restore-Configuration {
    param([string]$BackupPath)
    
    if (-not (Test-Path $BackupPath)) {
        Write-Host "❌ Backup path not found: $BackupPath" -ForegroundColor Red
        return
    }
    
    Write-Host "🔄 Restoring configuration from: $BackupPath" -ForegroundColor Yellow
    
    $filesToRestore = @(
        ".env",
        "package.json",
        "apps/api/package.json",
        "apps/web/package.json"
    )
    
    foreach ($file in $filesToRestore) {
        $backupFile = "$BackupPath/$file"
        if (Test-Path $backupFile) {
            Copy-Item $backupFile $file -Force
            Write-Host "✅ Restored: $file" -ForegroundColor Green
        }
    }
    
    Write-Host "✅ Configuration restored" -ForegroundColor Green
}

# Main execution
switch ($Action.ToLower()) {
    "check" {
        Test-Configuration
        Test-ConfigurationValidity
    }
    "create" {
        New-EnvironmentFile
    }
    "backup" {
        Backup-Configuration
    }
    "restore" {
        if ($args.Count -eq 0) {
            Write-Host "❌ Please provide backup path: .\config-manager.ps1 -Action restore -BackupPath path" -ForegroundColor Red
        } else {
            Restore-Configuration -BackupPath $args[0]
        }
    }
    "validate" {
        Test-ConfigurationValidity
    }
    default {
        Write-Host "Usage:" -ForegroundColor Yellow
        Write-Host "  .\config-manager.ps1 -Action check" -ForegroundColor White
        Write-Host "  .\config-manager.ps1 -Action create" -ForegroundColor White
        Write-Host "  .\config-manager.ps1 -Action backup" -ForegroundColor White
        Write-Host "  .\config-manager.ps1 -Action restore -BackupPath path" -ForegroundColor White
        Write-Host "  .\config-manager.ps1 -Action validate" -ForegroundColor White
    }
} 