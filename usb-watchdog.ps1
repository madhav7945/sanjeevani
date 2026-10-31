$adb = "C:\Users\madha\AppData\Local\Android\Sdk\platform-tools\adb.exe"

Write-Host "Starting Sanjeevani USB Reverse Tunnel Watchdog..."

while ($true) {
    try {
        & $adb start-server 2>&1 | Out-Null
        $devices = & $adb devices
        if ($devices -match "QKGYH66H5T5D6HHI\s+device") {
            & $adb -s QKGYH66H5T5D6HHI reverse tcp:3000 tcp:3000 2>&1 | Out-Null
        }
    } catch {
        # ignore transient exceptions
    }
    Start-Sleep -Seconds 2
}
