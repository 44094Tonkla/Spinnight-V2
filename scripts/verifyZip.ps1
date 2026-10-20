Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = Join-Path (Get-Location).Path "Sourcecode\Spinnight-V3-Sourcecode.zip"

Write-Host "Verifying ZIP file: $zipPath"
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)

$prohibited = @()
$allFiles = @()

foreach ($entry in $zip.Entries) {
    $name = $entry.FullName
    $allFiles += $name
    
    # Check for node_modules, dist, build, .git folder, and any .env file
    if ($name -like "*node_modules*" -or 
        $name -like "*.env*" -or 
        $name -like "*dist/*" -or 
        $name -like "*dist\*" -or 
        $name -like "*build/*" -or 
        $name -like "*build\*" -or 
        $name -like ".git/*" -or 
        $name -like ".git\*" -or 
        $name -eq ".git") {
        $prohibited += $name
    }
}

$count = $zip.Entries.Count
$zip.Dispose()

Write-Host "Total entries in ZIP: $count"
if ($prohibited.Count -eq 0) {
    Write-Host "=================================================="
    Write-Host "VERIFICATION RESULT: PASSED!"
    Write-Host "Zero prohibited files (.env*, node_modules, dist, build, .git) in ZIP."
    Write-Host "=================================================="
} else {
    Write-Host "VERIFICATION FAILED: Prohibited files found: $($prohibited.Count)"
    $prohibited | ForEach-Object { Write-Host " - $_" }
}
