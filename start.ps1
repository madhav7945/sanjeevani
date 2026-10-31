# Sanjeevani Master Launch Script (PowerShell)
Write-Host "========================================================" -ForegroundColor Green
Write-Host "      SANJEEVANI (ਸੰਜੀਵਨੀ) - ALL-IN-ONE LAUNCHER" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green

Set-Location "E:\sanjeevani-app"
$adb = "C:\Users\madha\AppData\Local\Android\Sdk\platform-tools\adb.exe"

# 1. Start Next.js if not running
$portActive = (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue)
if (-not $portActive) {
    Write-Host "[*] Starting Next.js Emergency Server..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd E:\sanjeevani-app; npm run dev" -WindowStyle Minimized
    Write-Host "[*] Waiting for server to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
} else {
    Write-Host "[OK] Next.js Server is already running on port 3000." -ForegroundColor Cyan
}

# 2. Wait for Phone
Write-Host "[*] Waiting for Android phone via USB..." -ForegroundColor Yellow
& $adb wait-for-device

# 3. Setup USB Tunnel
Write-Host "[*] Reversing port 3000..." -ForegroundColor Yellow
& $adb reverse tcp:3000 tcp:3000

# 4. Launch App
Write-Host "[*] Launching Sanjeevani on mobile..." -ForegroundColor Green
& $adb shell am start -S -n com.sanjeevani.emergency/.MainActivity

# 5. Open Admin in browser
Write-Host "[*] Opening Admin panel in browser..." -ForegroundColor Cyan
Start-Process "http://localhost:3000/admin"

Write-Host "`n[SUCCESS] Both Phone and Laptop Admin are live!" -ForegroundColor Green
