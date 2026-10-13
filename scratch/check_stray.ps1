Add-Type -AssemblyName System.Drawing

function Check-Stray($name) {
    $path = "d:\Traveller\public\images\cars\$name"
    $bmp = New-Object System.Drawing.Bitmap($path)
    Write-Output "=== $name ==="
    
    # Check pixels where y < 100
    $strayTop = 0
    for ($y = 0; $y -lt 100; $y++) {
        for ($x = 0; $x -lt $bmp.Width; $x++) {
            if ($bmp.GetPixel($x, $y).A -gt 10) { $strayTop++ }
        }
    }
    
    # Check pixels along border x < 30 or x > width - 30
    $strayLeft = 0; $strayRight = 0
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        for ($x = 0; $x -lt 30; $x++) {
            if ($bmp.GetPixel($x, $y).A -gt 10) { $strayLeft++ }
        }
        for ($x = $bmp.Width - 30; $x -lt $bmp.Width; $x++) {
            if ($bmp.GetPixel($x, $y).A -gt 10) { $strayRight++ }
        }
    }
    Write-Output "strayTop (y<100): $strayTop, strayLeft (x<30): $strayLeft, strayRight (x>w-30): $strayRight"
    $bmp.Dispose()
}

Check-Stray "ertiga-transparent.png"
Check-Stray "innova-transparent.png"
Check-Stray "swift-dzire-transparent.png"
Check-Stray "urbania-transparent.png"
