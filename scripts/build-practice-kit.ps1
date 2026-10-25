$ErrorActionPreference = 'Stop'
$practiceRoot = Join-Path $PSScriptRoot '../apps/web/public/practice'
$kitRoot = Join-Path $practiceRoot 'kit'
$templateTarget = Join-Path $kitRoot 'templates'
New-Item -ItemType Directory -Path $templateTarget -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $practiceRoot 'templates/case-matrix.csv'), (Join-Path $practiceRoot 'templates/bug-lifecycle.csv'), (Join-Path $practiceRoot 'templates/case-and-bug-guide.md'), (Join-Path $practiceRoot 'templates/bug-report.md') -Destination $templateTarget -Force
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
$archivePath = Join-Path $practiceRoot 'qapath-practice-kit.zip'
$temporaryArchive = Join-Path $practiceRoot 'qapath-practice-kit.new.zip'
$resolvedKitRoot = (Resolve-Path -LiteralPath $kitRoot).Path
$archive = [System.IO.Compression.ZipFile]::Open($temporaryArchive, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    Get-ChildItem -LiteralPath $resolvedKitRoot -File -Recurse -Force | Where-Object { $_.FullName -notmatch '[\\/]node_modules[\\/]' } | ForEach-Object {
        $entryName = $_.FullName.Substring($resolvedKitRoot.Length + 1).Replace('\', '/')
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $_.FullName, $entryName, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
} finally { $archive.Dispose() }
Move-Item -LiteralPath $temporaryArchive -Destination $archivePath -Force
Write-Output 'Kit actualizado: 24 guias, plantillas, Postman, SQL y Playwright.'
