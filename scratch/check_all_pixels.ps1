Add-Type -AssemblyName System.Drawing
foreach ($name in @('urbania-transparent.png', 'swift-dzire-transparent.png', 'ertiga-transparent.png', 'innova-transparent.png')) {
    $bmp = [System.Drawing.Bitmap]::FromFile("d:\Traveller\public\images\cars\$name")
    Write-Host "=== $name ($($bmp.Width)x$($bmp.Height)) ==="
    $c1 = $bmp.GetPixel(100, 300)
    Write-Host "  (100,300): R=$($c1.R) G=$($c1.G) B=$($c1.B) A=$($c1.A)"
    $c2 = $bmp.GetPixel(1200, 300)
    Write-Host "  (1200,300): R=$($c2.R) G=$($c2.G) B=$($c2.B) A=$($c2.A)"
    $c3 = $bmp.GetPixel(300, 200)
    Write-Host "  (300,200): R=$($c3.R) G=$($c3.G) B=$($c3.B) A=$($c3.A)"
    $c4 = $bmp.GetPixel(100, 600)
    Write-Host "  (100,600): R=$($c4.R) G=$($c4.G) B=$($c4.B) A=$($c4.A)"
    $bmp.Dispose()
}
