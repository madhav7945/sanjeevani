@echo off
title Sanjeevani - Master Launch System
color 0A

echo ========================================================
echo       SANJEEVANI (ਸੰਜੀਵਨੀ) - ALL-IN-ONE LAUNCHER
echo ========================================================
echo.

set ADB="C:\Users\madha\AppData\Local\Android\Sdk\platform-tools\adb.exe"

cd /d "E:\sanjeevani-app"

:: 1. Start Next.js Server if not already running on port 3000
netstat -ano | findstr :3000 >nul
if %errorlevel% neq 0 (
    echo [*] Starting Next.js Emergency Server...
    start "Sanjeevani Server" /min cmd /c "cd /d E:\sanjeevani-app && npm run dev"
    echo [*] Waiting for server to initialize...
    timeout /t 5 /nobreak >nul
) else (
    echo [OK] Next.js Server is already running on port 3000.
)

:: 2. Wait for Android Phone
echo [*] Waiting for your Android phone to be connected via USB...
%ADB% wait-for-device

:: 3. Setup USB Reverse Tunnel
echo [*] Establishing Zero-Network USB Reverse Tunnel (tcp:3000)...
%ADB% reverse tcp:3000 tcp:3000

:: 4. Launch App on Phone
echo [*] Launching Sanjeevani Emergency App on phone...
%ADB% shell am start -S -n com.sanjeevani.emergency/.MainActivity

:: 5. Open Admin Command Center in Browser
echo [*] Opening SDMA Admin Command Center on laptop...
start http://localhost:3000/admin

echo.
echo ========================================================
echo   [SUCCESS] SYSTEM IS FULLY LIVE & SYNCHRONIZED!
echo   - Laptop Admin: http://localhost:3000/admin
echo   - Mobile App:   Active on Phone via USB Tunnel
echo ========================================================
echo.
pause
