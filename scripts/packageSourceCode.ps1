$sourceDir = (Get-Location).Path
$destDir = Join-Path $sourceDir "Sourcecode"
$zipPath = Join-Path $destDir "Spinnight-V3-Sourcecode.zip"

Write-Host "Source directory: $sourceDir"
Write-Host "Destination folder: $destDir"

if (!(Test-Path -Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

if (Test-Path -Path $zipPath) {
    Remove-Item -Path $zipPath -Force
}

$tempStaging = Join-Path $destDir "staging_temp"
if (Test-Path -Path $tempStaging) {
    Remove-Item -Path $tempStaging -Recurse -Force
}
New-Item -ItemType Directory -Path $tempStaging -Force | Out-Null

$includeItems = @(
    "src",
    "public",
    "scripts",
    "index.html",
    "package.json",
    "package-lock.json",
    "vite.config.js",
    "README.md",
    ".oxlintrc.json",
    ".gitignore"
)

foreach ($item in $includeItems) {
    $srcPath = Join-Path $sourceDir $item
    if (Test-Path $srcPath) {
        Write-Host "Copying $item to staging..."
        Copy-Item -Path $srcPath -Destination $tempStaging -Recurse -Force
    } else {
        Write-Host "Item not found: $item"
    }
}

# Strict security: remove any .env, node_modules, dist, .git from staging
$prohibited = Get-ChildItem -Path $tempStaging -Recurse -Force | Where-Object { 
    $_.Name -like "*.env*" -or 
    $_.FullName -like "*node_modules*" -or 
    $_.FullName -like "*\dist*" -or 
    $_.FullName -like "*\.git*"
}

if ($prohibited) {
    Write-Host "Removing prohibited files from staging..."
    $prohibited | Remove-Item -Recurse -Force
}

Write-Host "Compressing to $zipPath ..."
# Use .NET ZipFile to create zip cleanly
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempStaging, $zipPath, [System.IO.Compression.CompressionLevel]::Optimal, $false)

Write-Host "Cleaning up staging directory..."
Remove-Item -Path $tempStaging -Recurse -Force

if (Test-Path $zipPath) {
    $zipItem = Get-Item $zipPath
    $sizeMB = [math]::Round($zipItem.Length / 1MB, 2)
    Write-Host "SUCCESS: ZIP created successfully."
    Write-Host "Location: $($zipItem.FullName)"
    Write-Host "File Size: $sizeMB MB ($($zipItem.Length) bytes)"
} else {
    Write-Error "Failed to create ZIP file."
}
