Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile("d:\Traveller\public\images\cars\urbania-transparent.png")
Write-Host "Urbania ground pixels:"
for ($y = 600; $y -lt 768; $y += 20) {
    $c = $bmp.GetPixel(700, $y)
    Write-Host "  (700,$y): R=$($c.R) G=$($c.G) B=$($c.B) A=$($c.A)"
}
$bmp.Dispose()
