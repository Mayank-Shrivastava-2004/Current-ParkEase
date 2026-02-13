$currentIp = "10.67.158.86"
$files = Get-ChildItem -Path "c:\JAVA Springboard Internship\current work 06\SmartParkingSpot_Frontend\SmartParkingSpot_Frontend-main" -Recurse -Include *.ts, *.tsx | Where-Object { $_.FullName -notmatch "node_modules" }
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    if ($content -match "10\.\d+\.\d+\.\d+") {
        $newContent = $content -replace "10\.\d+\.\d+\.\d+", $currentIp
        [System.IO.File]::WriteAllText($file.FullName, $newContent)
        Write-Host "Updated $($file.FullName) to $currentIp"
    }
}
