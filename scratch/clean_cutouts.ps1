Add-Type -ReferencedAssemblies "System.Drawing" -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Collections.Generic;

public class CleanCarCutouts
{
    public static void ProcessCar(string inputJpg, string outputPng, int thresholdR = 214, int maxDiffVal = 14, int floorY = 660)
    {
        byte[] fileBytes = System.IO.File.ReadAllBytes(inputJpg);
        using (var ms = new System.IO.MemoryStream(fileBytes))
        using (Bitmap src = new Bitmap(ms))
        {
            int w = src.Width;
            int h = src.Height;
            Bitmap dest = new Bitmap(w, h, PixelFormat.Format32bppArgb);

            BitmapData srcData = src.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            BitmapData destData = dest.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);

            int bytes = Math.Abs(srcData.Stride) * h;
            byte[] buffer = new byte[bytes];
            Marshal.Copy(srcData.Scan0, buffer, 0, bytes);
            src.UnlockBits(srcData);

            int stride = srcData.Stride;
            bool[] isBg = new bool[w * h];
            Queue<int> q = new Queue<int>();
            Func<int, int, int> idx = (x, y) => y * w + x;

            // Seed outer border pixels
            for (int x = 0; x < w; x++)
            {
                q.Enqueue(idx(x, 0));
                q.Enqueue(idx(x, 1));
                q.Enqueue(idx(x, h - 1));
                q.Enqueue(idx(x, h - 2));
            }
            for (int y = 0; y < h; y++)
            {
                q.Enqueue(idx(0, y));
                q.Enqueue(idx(1, y));
                q.Enqueue(idx(w - 1, y));
                q.Enqueue(idx(w - 2, y));
            }

            while (q.Count > 0)
            {
                int curr = q.Dequeue();
                if (isBg[curr]) continue;

                int cx = curr % w;
                int cy = curr / w;
                int offset = cy * stride + cx * 4;

                byte b = buffer[offset];
                byte g = buffer[offset + 1];
                byte r = buffer[offset + 2];

                int maxDiff = Math.Max(Math.Abs(r - g), Math.Max(Math.Abs(g - b), Math.Abs(r - b)));

                bool isBgPixel = false;
                if (cy >= floorY)
                {
                    // Floor shadow: anything light grey or close to white is background
                    if (r > 180 && g > 180 && b > 180)
                    {
                        isBgPixel = true;
                    }
                    else if (maxDiff < 15 && (r > 150))
                    {
                        isBgPixel = true;
                    }
                }
                else
                {
                    // Studio background is neutral grey/white
                    if (maxDiff <= maxDiffVal && r >= thresholdR && g >= thresholdR && b >= thresholdR)
                    {
                        isBgPixel = true;
                    }
                }

                if (isBgPixel)
                {
                    isBg[curr] = true;
                    if (cx > 0) q.Enqueue(idx(cx - 1, cy));
                    if (cx < w - 1) q.Enqueue(idx(cx + 1, cy));
                    if (cy > 0) q.Enqueue(idx(cx, cy - 1));
                    if (cy < h - 1) q.Enqueue(idx(cx, cy + 1));
                }
            }

            // Apply transparency and smooth edge feathering
            for (int y = 0; y < h; y++)
            {
                for (int x = 0; x < w; x++)
                {
                    int offset = y * stride + x * 4;
                    if (isBg[idx(x, y)])
                    {
                        buffer[offset + 3] = 0;
                    }
                    else if (y > floorY + 60)
                    {
                        // Clean any stray pixels deep on the floor
                        buffer[offset + 3] = 0;
                    }
                }
            }

            Marshal.Copy(buffer, 0, destData.Scan0, bytes);
            dest.UnlockBits(destData);
            dest.Save(outputPng, ImageFormat.Png);
        }
    }
}
"@

# Innova: studio background is pure white (R >= 230)
[CleanCarCutouts]::ProcessCar('d:\Traveller\public\images\cars\innova.jpg', 'd:\Traveller\public\images\cars\innova-transparent.png', 225, 15, 660)
Write-Host "Processed Innova"

# Ertiga: studio background is R >= 215, neutral
[CleanCarCutouts]::ProcessCar('d:\Traveller\public\images\cars\ertiga.jpg', 'd:\Traveller\public\images\cars\ertiga-transparent.png', 215, 14, 660)
Write-Host "Processed Ertiga"

# Swift Dzire: studio background is R >= 215, neutral
[CleanCarCutouts]::ProcessCar('d:\Traveller\public\images\cars\swift-dzire.jpg', 'd:\Traveller\public\images\cars\swift-dzire-transparent.png', 215, 14, 650)
Write-Host "Processed Swift Dzire"

# Urbania: studio background is R >= 214, neutral
[CleanCarCutouts]::ProcessCar('d:\Traveller\public\images\cars\urbania.jpg', 'd:\Traveller\public\images\cars\urbania-transparent.png', 214, 14, 665)
Write-Host "Processed Urbania"
