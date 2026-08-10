# Scans assets/images/gallery/<project>/ folders and regenerates
# assets/js/gallery-manifest.js, which the site loads to build each
# project's photo carousel. Run this after adding or removing photos.
param()

$root = $PSScriptRoot
$galleryRoot = Join-Path $root 'assets\images\gallery'
$outFile = Join-Path $root 'assets\js\gallery-manifest.js'
$extensions = @('.jpg', '.jpeg', '.png', '.webp', '.HEIC', '.mp4')

$manifest = [ordered]@{}

if (Test-Path -LiteralPath $galleryRoot) {
  Get-ChildItem -LiteralPath $galleryRoot -Directory | Sort-Object Name | ForEach-Object {
    $slug = $_.Name
    $files = Get-ChildItem -LiteralPath $_.FullName -File |
      Where-Object { $extensions -contains $_.Extension.ToLower() } |
      Sort-Object Name
    $manifest[$slug] = @($files | ForEach-Object { "assets/images/gallery/$slug/$($_.Name)" })
  }
}

$json = if ($manifest.Count -eq 0) { '{}' } else { $manifest | ConvertTo-Json -Depth 4 }
"window.GALLERY_MANIFEST = $json;" | Set-Content -LiteralPath $outFile -Encoding UTF8

Write-Output "Gallery manifest updated: $outFile"
Write-Output ""
if ($manifest.Count -eq 0) {
  Write-Output "No gallery folders found yet."
} else {
  foreach ($slug in $manifest.Keys) {
    $count = $manifest[$slug].Count
    Write-Output ("  {0,-32} {1} photo(s)" -f $slug, $count)
  }
}
