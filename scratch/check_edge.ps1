Add-Type -AssemblyName System.Drawing

$path = "d:\Traveller\public\images\cars\ertiga-transparent.png"
$bmp = New-Object System.Drawing.Bitmap($path)
Write-Output "Checking ertiga roof edge at y=140..155:"
for ($y = 140; $y -lt 155; $y++) {
    for ($x = 400; $x -lt 800; $x++) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.A -gt 0 -and $p.A -lt 255) {
            # semi transparent
            Write-Output "x=$x, y=$y : R=$($p.R), G=$($p.G), B=$($p.B), A=$($p.A)"
            break
        }
    }
}
$bmp.Dispose()
