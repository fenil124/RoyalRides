Add-Type -AssemblyName System.Drawing

$files = @('ertiga-transparent.png', 'urbania-transparent.png')
foreach ($name in $files) {
    $path = "d:\Traveller\public\images\cars\$name"
    $bmp = New-Object System.Drawing.Bitmap($path)
    Write-Output "--- $name ---"
    for ($y = 0; $y -lt 5; $y++) {
        $nonZeroInRow = 0
        $sampleColors = @()
        for ($x = 0; $x -lt $bmp.Width; $x++) {
            $p = $bmp.GetPixel($x, $y)
            if ($p.A -gt 10) {
                $nonZeroInRow++
                if ($sampleColors.Count -lt 3) {
                    $sampleColors += "($($p.R),$($p.G),$($p.B),A=$($p.A))"
                }
            }
        }
        Write-Output "Row ${y}: nonZero=$nonZeroInRow samples: $($sampleColors -join ' ')"
    }
    $bmp.Dispose()
}
