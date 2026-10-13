Add-Type -AssemblyName System.Drawing

$files = @('ertiga-transparent.png', 'innova-transparent.png', 'swift-dzire-transparent.png', 'urbania-transparent.png')
foreach ($name in $files) {
    $path = "d:\Traveller\public\images\cars\$name"
    $bmp = New-Object System.Drawing.Bitmap($path)
    $w = $bmp.Width
    $h = $bmp.Height
    
    $nonZeroTop = 0
    $nonZeroBottom = 0
    $nonZeroLeft = 0
    $nonZeroRight = 0
    
    for ($x = 0; $x -lt $w; $x++) {
        if ($bmp.GetPixel($x, 0).A -gt 10) { $nonZeroTop++ }
        if ($bmp.GetPixel($x, $h - 1).A -gt 10) { $nonZeroBottom++ }
    }
    for ($y = 0; $y -lt $h; $y++) {
        if ($bmp.GetPixel(0, $y).A -gt 10) { $nonZeroLeft++ }
        if ($bmp.GetPixel($w - 1, $y).A -gt 10) { $nonZeroRight++ }
    }
    Write-Output "$name : ${w}x${h} TopNonZero=$nonZeroTop, BottomNonZero=$nonZeroBottom, LeftNonZero=$nonZeroLeft, RightNonZero=$nonZeroRight"
    $bmp.Dispose()
}
