Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile('d:\Traveller\public\images\cars\ertiga-transparent.png')
Write-Host "Size: $($bmp.Width) x $($bmp.Height)"
$c = $bmp.GetPixel(10, 10)
Write-Host "Pixel 10,10: R=$($c.R) G=$($c.G) B=$($c.B) A=$($c.A)"
$c2 = $bmp.GetPixel(300, 50)
Write-Host "Pixel 300,50: R=$($c2.R) G=$($c2.G) B=$($c2.B) A=$($c2.A)"
$bmp.Dispose()
