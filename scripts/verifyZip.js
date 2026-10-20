import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const zipPath = path.join(process.cwd(), 'Sourcecode', 'Spinnight-V3-Sourcecode.zip');

const script = `
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('${zipPath.replace(/'/g, "''")}')
$prohibited = $zip.Entries | Where-Object { 
  $_.FullName -like '*.env*' -or 
  $_.FullName -like '*node_modules*' -or 
  $_.FullName -like '*dist/*' -or 
  $_.FullName -like '*.git*'
}
Write-Host "Total entries in ZIP: $($zip.Entries.Count)"
Write-Host "Prohibited entries found: $($prohibited.Count)"
$zip.Dispose()
`;

execSync(`powershell -ExecutionPolicy Bypass -Command "${script.replace(/\n/g, '; ')}"`, { stdio: 'inherit' });
