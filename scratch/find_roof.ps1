Add-Type -AssemblyName System.Drawing

function Find-Roof($name) {
    $path = "d:\Traveller\public\images\cars\$name"
    $bmp = New-Object System.Drawing.Bitmap($path)
    Write-Output "=== $name ==="
    for ($y = 0; $y -lt 250; $y += 10) {
        $count = 0
        for ($x = 0; $x -lt $bmp.Width; $x++) {
            $p = $bmp.GetPixel($x, $y)
            if ($p.A -gt 20) { $count++ }
        }
        if ($count -gt 0) {
            Write-Output "y=$y : non-transparent pixels = $count"
        }
    }
    $bmp.Dispose()
}

Find-Roof "ertiga-transparent.png"
Find-Roof "swift-dzire-transparent.png"
Find-Roof "urbania-transparent.png"
