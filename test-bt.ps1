[Windows.Devices.Bluetooth.BluetoothAdapter, Windows.Devices.Bluetooth, ContentType = WindowsRuntime] | Out-Null
$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { 
    $_.Name -eq "AsTask" -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -match "IAsyncOperation" 
})[0]
$op = [Windows.Devices.Bluetooth.BluetoothAdapter]::GetDefaultAsync()
$adapter = $asTask.MakeGenericMethod([Windows.Devices.Bluetooth.BluetoothAdapter]).Invoke($null, @($op)).Result
Write-Host "Adapter: $($adapter.DeviceId)"
Write-Host "IsLowEnergySupported: $($adapter.IsLowEnergySupported)"
Write-Host "IsCentralRoleSupported: $($adapter.IsCentralRoleSupported)"
Write-Host "IsPeripheralRoleSupported: $($adapter.IsPeripheralRoleSupported)"
Write-Host "IsAdvertisementOffloadSupported: $($adapter.IsAdvertisementOffloadSupported)"
