Add-Type -AssemblyName System.Drawing

function Remove-Background([string]$inputPath, [string]$outputPath, [int]$threshold = 230) {
    $bmp = [System.Drawing.Bitmap]::FromFile($inputPath)
    $w = $bmp.Width
    $h = $bmp.Height
    
    # Create 32bpp ARGB copy
    $outBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($outBmp)
    $g.DrawImage($bmp, 0, 0, $w, $h)
    $g.Dispose()
    $bmp.Dispose()
    
    # Lock bits for fast processing
    $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $bmpData = $outBmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    $totalBytes = [Math]::Abs($bmpData.Stride) * $h
    $bytes = New-Object byte[] $totalBytes
    [System.Runtime.InteropServices.Marshal]::Copy($bmpData.Scan0, $bytes, 0, $totalBytes)
    
    # Visited queue for flood fill from edges
    $visited = New-Object bool[] ($w * $h)
    $queue = New-Object System.Collections.Generic.Queue[int]
    
    # Seed top and bottom edges, left and right edges
    for ($x = 0; $x -lt $w; $x++) {
        $queue.Enqueue($x) # top edge y=0
        $queue.Enqueue(($h - 1) * $w + $x) # bottom edge
        $visited[$x] = $true
        $visited[($h - 1) * $w + $x] = $true
    }
    for ($y = 0; $y -lt $h; $y++) {
        $idx1 = $y * $w
        $idx2 = $y * $w + ($w - 1)
        if (-not $visited[$idx1]) { $queue.Enqueue($idx1); $visited[$idx1] = $true }
        if (-not $visited[$idx2]) { $queue.Enqueue($idx2); $visited[$idx2] = $true }
    }
    
    while ($queue.Count -gt 0) {
        $curr = $queue.Dequeue()
        $cx = $curr % $w
        $cy = [Math]::Floor($curr / $w)
        
        $byteIdx = $cy * [Math]::Abs($bmpData.Stride) + $cx * 4
        $b = $bytes[$byteIdx]
        $gCol = $bytes[$byteIdx + 1]
        $r = $bytes[$byteIdx + 2]
        
        # Check if background (near white or light grey)
        $isBg = ($r -gt $threshold -and $gCol -gt $threshold -and $b -gt $threshold)
        
        if ($isBg) {
            # Make transparent
            $bytes[$byteIdx + 3] = 0
            
            # Check 4 neighbors
            $neighbors = @(
                @($cx + 1, $cy),
                @($cx - 1, $cy),
                @($cx, $cy + 1),
                @($cx, $cy - 1)
            )
            foreach ($n in $neighbors) {
                $nx = $n[0]
                $ny = $n[1]
                if ($nx -ge 0 -and $nx -lt $w -and $ny -ge 0 -and $ny -lt $h) {
                    $nIdx = $ny * $w + $nx
                    if (-not $visited[$nIdx]) {
                        $visited[$nIdx] = $true
                        $queue.Enqueue($nIdx)
                    }
                }
            }
        }
    }
    
    [System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $bmpData.Scan0, $totalBytes)
    $outBmp.UnlockBits($bmpData)
    
    $outBmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $outBmp.Dispose()
    Write-Host "Processed $inputPath -> $outputPath"
}

Remove-Background "D:\Traveller\public\images\cars\innova.jpg" "D:\Traveller\public\images\cars\innova.png"
Remove-Background "D:\Traveller\public\images\cars\ertiga.jpg" "D:\Traveller\public\images\cars\ertiga.png"
Remove-Background "D:\Traveller\public\images\cars\swift-dzire.jpg" "D:\Traveller\public\images\cars\swift-dzire.png"
Remove-Background "D:\Traveller\public\images\cars\urbania.jpg" "D:\Traveller\public\images\cars\urbania.png"
