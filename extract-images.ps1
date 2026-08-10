param()

$files = @(
  @{ Name = "home"; Path = "C:\Users\chacko\SkyGrace\Home.svg" },
  @{ Name = "portfolio"; Path = "C:\Users\chacko\SkyGrace\Portfolio.svg" },
  @{ Name = "architect"; Path = "C:\Users\chacko\SkyGrace\Architect Benefits.svg" },
  @{ Name = "client"; Path = "C:\Users\chacko\SkyGrace\Client Benefit.svg" },
  @{ Name = "contact"; Path = "C:\Users\chacko\SkyGrace\Contact.svg" }
)

$outDir = "C:\Users\chacko\SkyGrace\website\assets\images"
$manifest = @()

# Matches an <image ...> tag, capturing x/y/width/height (in any order, best-effort) and the base64 payload
$imgTagRegex = [regex]'<image\b[^>]*?(?:xlink:href|href)="data:image/(?<ext>png|jpeg|jpg);base64,(?<data>[A-Za-z0-9+/=]+)"[^>]*?/?>'

foreach ($f in $files) {
  Write-Output "Processing $($f.Name) ..."
  $content = Get-Content -LiteralPath $f.Path -Raw
  $matches = $imgTagRegex.Matches($content)
  $i = 0
  foreach ($m in $matches) {
    $tag = $m.Value
    $ext = $m.Groups['ext'].Value
    if ($ext -eq 'jpg') { $ext = 'jpeg' }
    $b64 = $m.Groups['data'].Value
    $bytes = [Convert]::FromBase64String($b64)

    $wMatch = [regex]::Match($tag, 'width="([0-9.]+)"')
    $hMatch = [regex]::Match($tag, 'height="([0-9.]+)"')
    $xMatch = [regex]::Match($tag, '(?<!width=")(?<!height=")\bx="(-?[0-9.]+)"')
    $yMatch = [regex]::Match($tag, '\by="(-?[0-9.]+)"')

    $w = if ($wMatch.Success) { [double]$wMatch.Groups[1].Value } else { 0 }
    $h = if ($hMatch.Success) { [double]$hMatch.Groups[1].Value } else { 0 }
    $x = if ($xMatch.Success) { [double]$xMatch.Groups[1].Value } else { 0 }
    $y = if ($yMatch.Success) { [double]$yMatch.Groups[1].Value } else { 0 }

    $fname = "{0}-{1:D2}.{2}" -f $f.Name, $i, ($ext -replace 'jpeg','jpg')
    $outPath = Join-Path $outDir $fname
    [IO.File]::WriteAllBytes($outPath, $bytes)

    $manifest += [PSCustomObject]@{
      Page = $f.Name
      Index = $i
      File = $fname
      X = $x
      Y = $y
      Width = $w
      Height = $h
      Bytes = $bytes.Length
    }
    $i++
  }
  Write-Output "  -> $i images extracted"
}

$manifest | Sort-Object Page, Y, X | Format-Table -AutoSize | Out-String -Width 200 | Write-Output
$manifest | Export-Csv -LiteralPath "C:\Users\chacko\SkyGrace\website\assets\images\manifest.csv" -NoTypeInformation
