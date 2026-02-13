$newIp = "10.67.158.172"
$oldIps = @("10.183.118.172", "10.243.228.172")

Get-ChildItem -Path "app" -Recurse -Filter "*.tsx" | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content $file -Raw
    $changed = $false
    
    foreach ($oldIp in $oldIps) {
        if ($content -contains $oldIp -or $content.Contains($oldIp)) {
            $content = $content -replace [regex]::Escape($oldIp), $newIp
            $changed = $true
        }
    }
    
    if ($changed) {
        Set-Content -Path $file -Value $content -Encoding UTF8
        Write-Host "Updated: $file"
    }
}
