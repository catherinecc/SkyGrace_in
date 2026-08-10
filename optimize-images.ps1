param()

Add-Type -AssemblyName System.Drawing

$dir = "C:\Users\chacko\SkyGrace\website\assets\images"
$maxDim = 2000
$jpegQuality = 82

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [int64]$jpegQuality)

# Photos to process as JPEG (recompress + resize). Logos (logo-ink.png/logo-white.png) are left untouched — small, need alpha.
$targets = Get-ChildItem -LiteralPath $dir -Include *.jpg,*.jpeg,*.png -File | Where-Object { $_.Name -notin @('logo-ink.png','logo-white.png') }

foreach ($file in $targets) {
  $img = [System.Drawing.Image]::FromFile($file.FullName)
  $w = $img.Width
  $h = $img.Height
  $scale = 1.0
  if ($w -gt $maxDim -or $h -gt $maxDim) {
    $scale = [Math]::Min($maxDim / $w, $maxDim / $h)
  }
  $newW = [int]([Math]::Round($w * $scale))
  $newH = [int]([Math]::Round($h * $scale))

  $bmp = New-Object System.Drawing.Bitmap $newW, $newH
  $bmp.SetResolution($img.HorizontalResolution, $img.VerticalResolution)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.DrawImage($img, 0, 0, $newW, $newH)
  $g.Dispose()
  $img.Dispose()

  $isPng = $file.Extension -ieq '.png'
  $outPath = $file.FullName
  if ($isPng) {
    $outPath = [IO.Path]::ChangeExtension($file.FullName, '.jpg')
  }

  $tmpPath = $outPath + '.tmp'
  $bmp.Save($tmpPath, $jpegCodec, $encParams)
  $bmp.Dispose()

  if ($isPng) {
    Remove-Item -LiteralPath $file.FullName -Force
  }
  Move-Item -LiteralPath $tmpPath -Destination $outPath -Force

  $newSize = (Get-Item -LiteralPath $outPath).Length
  Write-Output ("{0,-45} {1}x{2} -> {3}x{4}   {5,8:N0} KB -> {6,8:N0} KB" -f $file.Name, $w, $h, $newW, $newH, [Math]::Round($file.Length/1KB), [Math]::Round($newSize/1KB))
}
