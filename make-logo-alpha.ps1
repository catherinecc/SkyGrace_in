param()

Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\chacko\SkyGrace\website\assets\images\home-00.png"
$outDir  = "C:\Users\chacko\SkyGrace\website\assets\images"

# Target recolors: [name, R, G, B]
$targets = @(
  @{ Name = "logo-ink.png";   R = 0x24; G = 0x1C; B = 0x16 },  # dark ink, for light backgrounds
  @{ Name = "logo-white.png"; R = 0xFF; G = 0xFF; B = 0xFF }   # white, for dark/photo backgrounds
)

$src = [System.Drawing.Bitmap]::FromFile($srcPath)
$w = $src.Width
$h = $src.Height

# Find tight bounding box of non-background (luminance > threshold) pixels to trim the black canvas
$minX = $w; $minY = $h; $maxX = 0; $maxY = 0
for ($y = 0; $y -lt $h; $y++) {
  for ($x = 0; $x -lt $w; $x++) {
    $p = $src.GetPixel($x, $y)
    if ($p.R -gt 8) {
      if ($x -lt $minX) { $minX = $x }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}
Write-Output "Bounding box: x=$minX..$maxX y=$minY..$maxY (source $w x $h)"

$cropW = $maxX - $minX + 1
$cropH = $maxY - $minY + 1

foreach ($t in $targets) {
  $out = New-Object System.Drawing.Bitmap $cropW, $cropH, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  for ($y = 0; $y -lt $cropH; $y++) {
    for ($x = 0; $x -lt $cropW; $x++) {
      $p = $src.GetPixel($minX + $x, $minY + $y)
      $alpha = $p.R  # luminance of white-on-black source doubles as alpha
      $color = [System.Drawing.Color]::FromArgb($alpha, $t.R, $t.G, $t.B)
      $out.SetPixel($x, $y, $color)
    }
  }
  $outPath = Join-Path $outDir $t.Name
  $out.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $out.Dispose()
  Write-Output "Wrote $outPath ($cropW x $cropH)"
}

$src.Dispose()
