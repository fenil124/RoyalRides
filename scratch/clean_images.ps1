Add-Type -AssemblyName System.Drawing

function Clean-CarImage($name, $topCutoff, $leftCutoff, $rightCutoff, $bottomStart, $bottomEnd) {
    $srcPath = "d:\Traveller\public\images\cars\$name"
    $backupPath = "d:\Traveller\public\images\cars\$name.orig"
    
    if (-not (Test-Path $backupPath)) {
        Copy-Item $srcPath $backupPath
        Write-Output "Backed up $name to $name.orig"
    }
    
    $bmp = New-Object System.Drawing.Bitmap($backupPath)
    $w = $bmp.Width
    $h = $bmp.Height
    
    $outBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $p = $bmp.GetPixel($x, $y)
            $a = $p.A
            $r = $p.R
            $g = $p.G
            $b = $p.B
            
            # Stray top
            if ($y -lt $topCutoff) {
                # Exception for Ertiga antenna around x=645..685, y >= 135
                if ($name -eq 'ertiga-transparent.png' -and $y -ge 135 -and $x -ge 645 -and $x -le 685) {
                    # keep
                } else {
                    $a = 0
                }
            }
            
            # Stray left/right
            if ($a -gt 0 -and ($x -lt $leftCutoff -or $x -gt $rightCutoff) -and $y -lt 600) {
                $a = 0
            }
            
            # Bottom shadow feathering
            if ($a -gt 0 -and $y -ge $bottomStart) {
                if ($y -ge $bottomEnd) {
                    $a = 0
                } else {
                    $factor = [Math]::Max(0.0, [Math]::Min(1.0, 1.0 - (($y - $bottomStart) / ($bottomEnd - $bottomStart))))
                    # smoothstep factor
                    $smoothFactor = $factor * $factor * (3.0 - 2.0 * $factor)
                    $a = [int]([Math]::Round($a * $smoothFactor))
                }
            }
            
            if ($a -le 3) {
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            } else {
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($a, $r, $g, $b))
            }
        }
    }
    
    $bmp.Dispose()
    
    # Save to temp and replace
    $tmpPath = "d:\Traveller\public\images\cars\tmp_$name"
    $outBmp.Save($tmpPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $outBmp.Dispose()
    
    Move-Item -Force $tmpPath $srcPath
    Write-Output "Successfully cleaned $name"
}

Clean-CarImage "ertiga-transparent.png" 130 35 1360 660 708
Clean-CarImage "innova-transparent.png" 135 40 1340 665 715
Clean-CarImage "swift-dzire-transparent.png" 155 35 1340 660 705
Clean-CarImage "urbania-transparent.png" 120 40 1350 660 710
