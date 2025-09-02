
# ODIADEV TTS one-click local run
$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Project:" $ROOT
if (-not (Test-Path "$ROOT\.env")) {
  Copy-Item "$ROOT\.env.example" "$ROOT\.env"
  Write-Host "Created .env from .env.example. Please edit OPENAI_API_KEY before running again." -ForegroundColor Yellow
  exit 0
}
Push-Location $ROOT
npm i --omit=dev
node .\src\server.js
Pop-Location
