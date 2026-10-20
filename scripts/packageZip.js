import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const destDir = path.join(rootDir, 'Sourcecode');
const zipPath = path.join(destDir, 'Spinnight-V3-Sourcecode.zip');
const stagingDir = path.join(destDir, 'staging');

console.log('1. Ensuring destination directory exists...');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

if (fs.existsSync(stagingDir)) {
  fs.rmSync(stagingDir, { recursive: true, force: true });
}
fs.mkdirSync(stagingDir, { recursive: true });

// Items to include in the delivery zip
const includeItems = [
  'src',
  'public',
  'scripts',
  'index.html',
  'package.json',
  'package-lock.json',
  'vite.config.js',
  'README.md',
  '.oxlintrc.json',
  '.gitignore'
];

console.log('2. Copying source files to staging...');
for (const item of includeItems) {
  const src = path.join(rootDir, item);
  const dest = path.join(stagingDir, item);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, {
      recursive: true,
      filter: (srcPath) => {
        const basename = path.basename(srcPath);
        // Exclude prohibited files & folders
        if (
          basename === 'node_modules' ||
          basename === 'dist' ||
          basename === 'build' ||
          basename === '.git' ||
          basename.startsWith('.env') ||
          basename.includes('#U0e')
        ) {
          return false;
        }
        return true;
      }
    });
  }
}

// Ensure no .env or prohibited files leaked into staging
function removeProhibited(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      if (['node_modules', 'dist', 'build', '.git'].includes(file.name)) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        removeProhibited(fullPath);
      }
    } else {
      if (file.name.startsWith('.env') || file.name.includes('#U0e')) {
        fs.unlinkSync(fullPath);
      }
    }
  }
}
removeProhibited(stagingDir);

console.log('3. Compressing staging directory into ZIP...');
const psCmd = `powershell -ExecutionPolicy Bypass -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('${stagingDir.replace(/'/g, "''")}', '${zipPath.replace(/'/g, "''")}', [System.IO.Compression.CompressionLevel]::Optimal, $false)"`;
execSync(psCmd, { stdio: 'inherit' });

console.log('4. Cleaning up temporary staging directory...');
fs.rmSync(stagingDir, { recursive: true, force: true });

if (fs.existsSync(zipPath)) {
  const stats = fs.statSync(zipPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log('==============================================');
  console.log('✅ SUCCESS! Source code packaged successfully.');
  console.log(`📍 Path: ${zipPath}`);
  console.log(`📦 Size: ${sizeMB} MB (${stats.size} bytes)`);
  console.log('==============================================');
} else {
  console.error('❌ Error: Zip file was not created.');
  process.exit(1);
}
