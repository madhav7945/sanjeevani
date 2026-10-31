@echo off
setlocal
echo ========================================================
echo       SANJEEVANI - NATIVE PHONE LAUNCHER (USB)
echo ========================================================
echo.

set ADB="%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"

echo Setting up USB reverse port tunnel (3000 -> 3000)...
%ADB% reverse tcp:3000 tcp:3000

echo Launching Sanjeevani Emergency App on phone...
%ADB% shell am start -n com.sanjeevani.emergency/.MainActivity

echo.
echo Sanjeevani is running live on your phone!
