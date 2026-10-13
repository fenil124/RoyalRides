Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile('d:\Traveller\public\images\references\hero-reference.jpg')
Write-Host "hero-reference.jpg size: $($bmp.Width) x $($bmp.Height)"
$bmp.Dispose()
