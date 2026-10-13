Add-Type -ReferencedAssemblies "System.Drawing" -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Collections.Generic;

public class CarProcessor
{
    public static void ProcessCar(string inputPath, string outputPath, int minY, int maxY, int minX, int maxX)
    {
        byte[] fileBytes = System.IO.File.ReadAllBytes(inputPath);
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

            for (int x = 0; x < w; x++)
            {
                q.Enqueue(idx(x, 0));
                q.Enqueue(idx(x, h - 1));
            }
            for (int y = 0; y < h; y++)
            {
                q.Enqueue(idx(0, y));
                q.Enqueue(idx(w - 1, y));
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
                byte a = buffer[offset + 3];

                bool isBgPixel = false;
                if (a < 25)
                {
                    isBgPixel = true;
                }
                else
                {
                    int maxDiff = Math.Max(Math.Abs(r - g), Math.Max(Math.Abs(g - b), Math.Abs(r - b)));
                    bool outsideBox = (cy < minY) || (cy > maxY) || (cx < minX) || (cx > maxX);

                    if (outsideBox)
                    {
                        if (r > 100 || g > 100 || b > 100 || a < 220)
                        {
                            isBgPixel = true;
                        }
                    }
                    else
                    {
                        if (maxDiff < 25 && r > 185 && g > 185 && b > 185)
                        {
                            // Avoid car hood/roof bleed
                            if (cy < minY + 40 || cy > maxY - 40 || cx < minX + 50 || cx > maxX - 50)
                            {
                                isBgPixel = true;
                            }
                        }
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

            for (int y = 0; y < h; y++)
            {
                for (int x = 0; x < w; x++)
                {
                    int offset = y * stride + x * 4;
                    byte a = buffer[offset + 3];

                    if (isBg[idx(x, y)])
                    {
                        buffer[offset + 3] = 0;
                    }
                    else if (y > maxY + 15 || y < minY - 5 || x < minX - 10 || x > maxX + 10)
                    {
                        buffer[offset + 3] = 0;
                    }
                    else
                    {
                        // Defringe edges
                        byte b = buffer[offset];
                        byte g = buffer[offset + 1];
                        byte r = buffer[offset + 2];
                        int maxDiff = Math.Max(Math.Abs(r - g), Math.Max(Math.Abs(g - b), Math.Abs(r - b)));
                        if (maxDiff < 15 && r > 215 && g > 215 && b > 215 && (y < minY + 30 || x < minX + 40 || x > maxX - 40))
                        {
                            buffer[offset + 3] = 0;
                        }
                    }
                }
            }

            Marshal.Copy(buffer, 0, destData.Scan0, bytes);
            dest.UnlockBits(destData);
            dest.Save(outputPath, ImageFormat.Png);
        }
    }
}
"@

# Ertiga: 1376 x 768, minY=125, maxY=650, minX=80, maxX=1220
[CarProcessor]::ProcessCar('d:\Traveller\public\images\cars\ertiga-transparent.png', 'd:\Traveller\public\images\cars\ertiga-transparent.png', 125, 650, 80, 1220)
Write-Host "Cleaned Ertiga"

# Innova: 1376 x 768, minY=130, maxY=655, minX=90, maxX=1250
[CarProcessor]::ProcessCar('d:\Traveller\public\images\cars\innova-transparent.png', 'd:\Traveller\public\images\cars\innova-transparent.png', 130, 655, 90, 1250)
Write-Host "Cleaned Innova"

# Swift Dzire: 1376 x 768, minY=130, maxY=650, minX=120, maxX=1210
[CarProcessor]::ProcessCar('d:\Traveller\public\images\cars\swift-dzire-transparent.png', 'd:\Traveller\public\images\cars\swift-dzire-transparent.png', 130, 650, 120, 1210)
Write-Host "Cleaned Swift Dzire"

# Urbania: 1376 x 768, minY=110, maxY=660, minX=130, maxX=1220
[CarProcessor]::ProcessCar('d:\Traveller\public\images\cars\urbania-transparent.png', 'd:\Traveller\public\images\cars\urbania-transparent.png', 110, 660, 130, 1220)
Write-Host "Cleaned Urbania"
