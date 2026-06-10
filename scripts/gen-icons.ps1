# PWA/iOS 用 PNG アイコンを System.Drawing で生成する(全面ブリード=マスカブル対応)
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$pub = Join-Path $root 'public'
$icons = Join-Path $pub 'icons'
if (-not (Test-Path $icons)) { New-Item -ItemType Directory -Path $icons | Out-Null }

function New-RoundedRect([single]$x, [single]$y, [single]$w, [single]$h, [single]$r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  if ($r -le 0) {
    $path.AddRectangle((New-Object System.Drawing.RectangleF($x, $y, $w, $h)))
  } else {
    $d = $r * 2
    $path.AddArc($x, $y, $d, $d, 180, 90)
    $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $path.CloseFigure()
  }
  return $path
}

function Save-Icon([int]$S, [string]$file) {
  $bmp = New-Object System.Drawing.Bitmap($S, $S)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

  # 背景グラデーション(blue -> green)
  $rect = New-Object System.Drawing.Rectangle(0, 0, $S, $S)
  $c1 = [System.Drawing.Color]::FromArgb(79, 140, 255)
  $c2 = [System.Drawing.Color]::FromArgb(52, 211, 153)
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 45)
  $g.FillRectangle($brush, $rect)

  # ダンベル(白)
  $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
  function F([single]$f) { return [single]($f * $S) }

  $parts = @(
    (New-RoundedRect (F 0.300) (F 0.455) (F 0.400) (F 0.090) (F 0.045)),  # handle
    (New-RoundedRect (F 0.235) (F 0.360) (F 0.075) (F 0.280) (F 0.032)),  # inner L
    (New-RoundedRect (F 0.690) (F 0.360) (F 0.075) (F 0.280) (F 0.032)),  # inner R
    (New-RoundedRect (F 0.150) (F 0.400) (F 0.070) (F 0.200) (F 0.028)),  # outer L
    (New-RoundedRect (F 0.780) (F 0.400) (F 0.070) (F 0.200) (F 0.028))   # outer R
  )
  foreach ($p in $parts) { $g.FillPath($white, $p); $p.Dispose() }

  $g.Dispose()
  $bmp.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "wrote $file"
}

Save-Icon 192 (Join-Path $icons 'icon-192.png')
Save-Icon 512 (Join-Path $icons 'icon-512.png')
Save-Icon 180 (Join-Path $pub 'apple-touch-icon.png')
