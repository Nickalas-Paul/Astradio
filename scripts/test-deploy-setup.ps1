param([switch]$Verbose)
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
function Write-Info($m){Write-Host $m -ForegroundColor Cyan}
function Write-Ok($m){Write-Host $m -ForegroundColor Green}
function Write-Warn($m){Write-Host $m -ForegroundColor Yellow}
function Write-Err($m){Write-Host $m -ForegroundColor Red}

Write-Info "Testing deployment prerequisites..."
$errors = [System.Collections.Generic.List[string]]::new()
$warnings = [System.Collections.Generic.List[string]]::new()

function Test-Tool($n,[string]$v="--version"){
  $c=Get-Command $n -ErrorAction SilentlyContinue
  if(-not $c){return $false}
  if($Verbose){try{$vv=& $n $v 2>$null;Write-Host ("  • {0}: {1}"-f $n,($vv -replace "`r|`n"," ")) -f 'DarkGray'}catch{}}
  return $true
}
function ParseDotEnv([string]$p){
  $map=@{}
  if(-not(Test-Path $p)){return $map}
  $raw=Get-Content -Path $p -Raw -ErrorAction Stop
  foreach($ln in ($raw -split "`r?`n")){
    $t=$ln.Trim(); if($t.Length -eq 0 -or $t.StartsWith("#")){continue}
    $i=$t.IndexOf("="); if($i -lt 1){continue}
    $k=$t.Substring(0,$i).Trim(); $v=$t.Substring($i+1).Trim()
    if($k){$map[$k]=$v}
  }; return $map
}

Write-Warn "Checking tools..."
$needed=@("vercel","pnpm","node","git","curl")
$miss=@(); foreach($t in $needed){if(-not(Test-Tool $t)){ $miss+=$t }}
if($miss.Count -gt 0){$errors.Add("Missing tools: $($miss -join ', '). Install: npm i -g vercel pnpm")}
else{Write-Ok "All required tools found"}

Write-Warn "Checking repo layout..."
if((Test-Path "package.json") -and (Test-Path "pnpm-workspace.yaml") -and (Test-Path "apps/api") -and (Test-Path "apps/web")){Write-Ok "Monorepo structure OK"}
else{$errors.Add("Not at monorepo root or missing apps/api or apps/web")}

Write-Warn "Checking git..."
try{$r=git config --get remote.origin.url 2>$null;if($r){Write-Ok "Git remote: $r"}else{$warnings.Add("No git remote found")}}catch{$warnings.Add("Git check failed")}

Write-Warn "Dry-run install..."
try{pnpm install --dry-run 1>$null 2>$null;if($LASTEXITCODE -eq 0){Write-Ok "Install dry run OK"}else{$warnings.Add("Install dry run failed (check registry/network)")} }catch{$warnings.Add("Could not run install dry run")}

Write-Host ""
Write-Info "Summary:"
if($errors.Count -eq 0){
  Write-Ok "All critical tests passed"
} else {
  Write-Err "Critical issues:"
  foreach($e in $errors){
    Write-Err "  • $e"
  }
}
if($warnings.Count -gt 0){
  Write-Warn "Warnings:"
  foreach($w in $warnings){
    Write-Warn "  • $w"
  }
}
Write-Host ""
Write-Info "Next steps:"
if($errors.Count -eq 0){
  Write-Ok "  • Run: . scripts/load-deploy-env.ps1; scripts/deploy.ps1"
} else {
  Write-Err "  • Fix the critical issues above first"
}
Write-Host "  • See scripts/DEPLOYMENT-README.md" -ForegroundColor Blue
