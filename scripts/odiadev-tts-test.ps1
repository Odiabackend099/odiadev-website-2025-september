# ODIADEV TTS Windows Test Script
# Downloads audio from your TTS API and auto-plays it

param(
    [string]$ApiKey = "odiadev_10abb658e85c30550ed75b30e7f55836",  # Replace with your actual API key
    [string]$Text = "Hello Lagos! ODIADEV TTS is working perfectly.",
    [string]$Voice = "naija_female_warm",
    [string]$ApiUrl = "https://tts-api.odia.dev/v1/tts"
)

# Create downloads directory
$downloadDir = Join-Path $env:USERPROFILE "Downloads\ODIADEV-TTS"
New-Item -ItemType Directory -Force -Path $downloadDir | Out-Null

# Generate filename with timestamp
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputFile = Join-Path $downloadDir "odiadev-tts-$timestamp.mp3"

Write-Host "🎤 ODIADEV TTS Test Script" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "Text: $Text" -ForegroundColor Yellow
Write-Host "Voice: $Voice" -ForegroundColor Yellow
Write-Host "API: $ApiUrl" -ForegroundColor Yellow
Write-Host ""

try {
    # Prepare request body
    $body = @{
        text = $Text
        voice_id = $Voice
        format = "mp3"
    } | ConvertTo-Json -Compress

    Write-Host "📡 Sending request to TTS API..." -ForegroundColor Green
    
    # Make the API request
    $response = Invoke-WebRequest `
        -Uri $ApiUrl `
        -Method POST `
        -Headers @{
            "x-api-key" = $ApiKey
            "Content-Type" = "application/json"
        } `
        -Body $body `
        -OutFile $outputFile `
        -ErrorAction Stop

    # Check file size
    $fileSize = (Get-Item $outputFile).Length
    Write-Host "✅ Audio downloaded successfully!" -ForegroundColor Green
    Write-Host "📁 Saved to: $outputFile" -ForegroundColor White
    Write-Host "📊 File size: $fileSize bytes" -ForegroundColor White

    if ($fileSize -lt 1000) {
        Write-Host "⚠️  Warning: File size is very small ($fileSize bytes). The request might have failed." -ForegroundColor Red
        Write-Host "   Check your API key and try again." -ForegroundColor Red
        exit 1
    }

    # Auto-play the audio file
    Write-Host "🔊 Auto-playing audio..." -ForegroundColor Green
    Start-Process $outputFile

    Write-Host ""
    Write-Host "🎉 Success! Audio should be playing now." -ForegroundColor Green
    Write-Host "💡 Tip: You can find all your TTS files in: $downloadDir" -ForegroundColor Cyan

} catch {
    Write-Host "❌ Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "HTTP Status: $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq 401) {
            Write-Host "🔑 Authentication failed. Please check your API key." -ForegroundColor Yellow
        } elseif ($statusCode -eq 429) {
            Write-Host "⏱️  Rate limit exceeded. Please wait a moment and try again." -ForegroundColor Yellow
        }
    }
    
    exit 1
}

