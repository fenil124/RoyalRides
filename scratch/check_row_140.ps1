Add-Type -AssemblyName System.Drawing

$path = "d:\Traveller\public\images\cars\ertiga-transparent.png"
$bmp = New-Object System.Drawing.Bitmap($path)
for ($x = 0; $x -lt $bmp.Width; $x++) {
    $p = $bmp.GetPixel($x, 140)
    if ($p.A -gt 10) {
        Write-Output "x=$x : R=$($p.R), G=$($p.G), B=$($p.B), A=$($p.A)"
    }
}
$bmp.Dispose()
