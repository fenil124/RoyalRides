Add-Type -AssemblyName System.Drawing

function Analyze-File($name) {
    $path = "d:\Traveller\public\images\cars\$name"
    $bmp = New-Object System.Drawing.Bitmap($path)
    Write-Output "=== $name (Width: $($bmp.Width), Height: $($bmp.Height)) ==="
    
    # Check bounding box of non-transparent pixels
    $minX = $bmp.Width; $maxX = 0; $minY = $bmp.Height; $maxY = 0
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        for ($x = 0; $x -lt $bmp.Width; $x++) {
            $p = $bmp.GetPixel($x, $y)
            if ($p.A -gt 20) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }
    Write-Output "Alpha Bounding Box: minX=$minX, maxX=$maxX, minY=$minY, maxY=$maxY"
    $bmp.Dispose()
}

Analyze-File "ertiga-transparent.png"
Analyze-File "innova-transparent.png"
Analyze-File "swift-dzire-transparent.png"
Analyze-File "urbania-transparent.png"
