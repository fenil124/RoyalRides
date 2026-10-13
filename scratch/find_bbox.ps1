Add-Type -AssemblyName System.Drawing
foreach ($name in @('urbania-transparent.png', 'swift-dzire-transparent.png', 'ertiga-transparent.png', 'innova-transparent.png')) {
    $bmp = [System.Drawing.Bitmap]::FromFile("d:\Traveller\public\images\cars\$name")
    $minX = $bmp.Width; $maxX = 0; $minY = $bmp.Height; $maxY = 0; $count = 0
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        for ($x = 0; $x -lt $bmp.Width; $x++) {
            $p = $bmp.GetPixel($x, $y)
            if ($p.A -gt 10) {
                $count++
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }
    Write-Host "$name : non-transparent pixels=$count, bbox: [$minX, $minY] to [$maxX, $maxY]"
    $bmp.Dispose()
}
