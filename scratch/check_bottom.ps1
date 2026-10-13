Add-Type -AssemblyName System.Drawing

function Check-Bottom($name) {
    $path = "d:\Traveller\public\images\cars\$name"
    $bmp = New-Object System.Drawing.Bitmap($path)
    Write-Output "=== $name ==="
    for ($y = 650; $y -lt $bmp.Height; $y += 10) {
        $count = 0
        $darkCount = 0
        $lightCount = 0
        for ($x = 0; $x -lt $bmp.Width; $x++) {
            $p = $bmp.GetPixel($x, $y)
            if ($p.A -gt 20) {
                $count++
                $brightness = ($p.R + $p.G + $p.B) / 3
                if ($brightness -lt 50) { $darkCount++ }
                if ($brightness -gt 150) { $lightCount++ }
            }
        }
        if ($count -gt 0) {
            Write-Output "y=$y : total=$count, dark(tires/shadow)=$darkCount, light(grey floor)=$lightCount"
        }
    }
    $bmp.Dispose()
}

Check-Bottom "ertiga-transparent.png"
Check-Bottom "innova-transparent.png"
Check-Bottom "swift-dzire-transparent.png"
Check-Bottom "urbania-transparent.png"
