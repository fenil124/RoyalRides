Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile('d:\Traveller\public\images\cars\urbania-transparent.png')
Write-Host "Urbania Size: $($bmp.Width) x $($bmp.Height)"
# Sample top row, middle, corners
for ($y = 10; $y -lt 150; $y += 30) {
    $c = $bmp.GetPixel(300, $y)
    Write-Host "Pixel 300,${y}: R=$($c.R) G=$($c.G) B=$($c.B) A=$($c.A)"
}
$bmp.Dispose()
