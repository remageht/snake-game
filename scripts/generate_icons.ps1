Add-Type -AssemblyName System.Drawing

$iconsDir = "src-tauri/icons"
if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir -Force | Out-Null
}

function Generate-SnakeImage([int]$size) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Background: dark rounded / circular or rectangle
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 26, 32, 44))
    $g.FillRectangle($bgBrush, 0, 0, $size, $size)
    $bgBrush.Dispose()

    # Border
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 76, 175, 80), [Math]::Max(1.0, $size * 0.04))
    $g.DrawRectangle($borderPen, 0, 0, $size, $size)
    $borderPen.Dispose()

    # Food (Apple)
    $appleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 239, 68, 68))
    $ax = $size * 0.70
    $ay = $size * 0.30
    $ar = $size * 0.12
    $g.FillEllipse($appleBrush, [float]($ax - $ar), [float]($ay - $ar), [float]($ar * 2), [float]($ar * 2))
    $appleBrush.Dispose()

    # Apple leaf
    $leafBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 34, 197, 94))
    $g.FillEllipse($leafBrush, [float]($ax - $ar * 0.4), [float]($ay - $ar * 1.5), [float]($ar * 0.8), [float]($ar * 0.8))
    $leafBrush.Dispose()

    # Snake body segments
    $bodyBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 34, 197, 94))
    $headBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 74, 222, 128))
    $eyeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $pupilBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black)

    $points = @(
        @{ X = 0.28; Y = 0.72 },
        @{ X = 0.40; Y = 0.72 },
        @{ X = 0.52; Y = 0.70 },
        @{ X = 0.60; Y = 0.60 },
        @{ X = 0.58; Y = 0.48 },
        @{ X = 0.46; Y = 0.44 },
        @{ X = 0.36; Y = 0.40 },
        @{ X = 0.34; Y = 0.28 },
        @{ X = 0.45; Y = 0.26 }
    )

    $segR = $size * 0.08
    foreach ($p in $points) {
        $px = $p.X * $size
        $py = $p.Y * $size
        $g.FillEllipse($bodyBrush, [float]($px - $segR), [float]($py - $segR), [float]($segR * 2), [float]($segR * 2))
    }

    # Head
    $head = $points[-1]
    $hx = $head.X * $size
    $hy = $head.Y * $size
    $hr = $segR * 1.3
    $g.FillEllipse($headBrush, [float]($hx - $hr), [float]($hy - $hr), [float]($hr * 2), [float]($hr * 2))

    # Eyes
    $eyeR = $hr * 0.3
    $g.FillEllipse($eyeBrush, [float]($hx + $hr * 0.1), [float]($hy - $hr * 0.4), [float]($eyeR * 2), [float]($eyeR * 2))
    $g.FillEllipse($pupilBrush, [float]($hx + $hr * 0.25), [float]($hy - $hr * 0.3), [float]$eyeR, [float]$eyeR)

    # Tongue
    $tongueBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 239, 68, 68))
    $tx = $hx + $hr
    $ty = $hy
    $tWidth = $hr * 0.6
    $tHeight = $hr * 0.3
    $g.FillPolygon($tongueBrush, @(
        [System.Drawing.PointF]::new($tx, $ty - 2),
        [System.Drawing.PointF]::new($tx + $tWidth, $ty - $tHeight),
        [System.Drawing.PointF]::new($tx + $tWidth * 0.7, $ty),
        [System.Drawing.PointF]::new($tx + $tWidth, $ty + $tHeight),
        [System.Drawing.PointF]::new($tx, $ty + 2)
    ))
    $tongueBrush.Dispose()

    $bodyBrush.Dispose()
    $headBrush.Dispose()
    $eyeBrush.Dispose()
    $pupilBrush.Dispose()
    $g.Dispose()

    return $bmp
}

# Generate 32x32, 128x128, 256x256 (128@2x), 512x512
$sizes = @{
    "32x32.png" = 32
    "128x128.png" = 128
    "128x128@2x.png" = 256
    "icon.png" = 512
    "Square30x30Logo.png" = 30
    "Square44x44Logo.png" = 44
    "Square71x71Logo.png" = 71
    "Square89x89Logo.png" = 89
    "Square107x107Logo.png" = 107
    "Square142x142Logo.png" = 142
    "Square150x150Logo.png" = 150
    "Square284x284Logo.png" = 284
    "Square310x310Logo.png" = 310
    "StoreLogo.png" = 50
}

foreach ($name in $sizes.Keys) {
    $s = $sizes[$name]
    $b = Generate-SnakeImage $s
    $outPath = Join-Path $iconsDir $name
    $b.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $b.Dispose()
}

# Generate icon.ico
$icoBmp = Generate-SnakeImage 256
$icoHicon = $icoBmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($icoHicon)
$fs = [System.IO.File]::OpenWrite((Join-Path $iconsDir "icon.ico"))
$icon.Save($fs)
$fs.Close()
$icon.Dispose()
$icoBmp.Dispose()

# Copy icon.png to icon.icns for macOS placeholder compatibility
Copy-Item (Join-Path $iconsDir "icon.png") (Join-Path $iconsDir "icon.icns") -Force

Write-Host "Icons generated successfully in $iconsDir"
