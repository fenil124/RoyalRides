Add-Type -ReferencedAssemblies "System.Drawing" -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Collections.Generic;

public class ImageCleaner
{
    public static void Clean(string inputPath, string outputPath)
    {
        using (Bitmap src = new Bitmap(inputPath))
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

            // Step 1: Remove near-white / gray noise in the background
            // Background speckles typically have high R, G, B (e.g. > 195) and are near top/sides
            // Let's do a flood-fill / breadth-first search from all four borders for any pixel with (A == 0 || (R > 180 && G > 180 && B > 180))
            bool[] isBg = new bool[w * h];
            Queue<int> q = new Queue<int>();

            // Helper to get index
            Func<int, int, int> idx = (x, y) => y * w + x;

            // Flood fill from outer edges
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

            // We know the car is inside bounding box:
            // Top of car is around y=110 to 140
            // Bottom of tires is around y=630 to 650
            // Left of car is around x=80
            // Right of car is around x=1220
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
                if (a < 20)
                {
                    isBgPixel = true;
                }
                else
                {
                    int maxDiff = Math.Max(Math.Abs(r - g), Math.Max(Math.Abs(g - b), Math.Abs(r - b)));
                    // Outside car area:
                    bool outsideCar = (cy < 125) || (cx < 85) || (cx > w - 100) || (cy > 650);
                    
                    if (outsideCar)
                    {
                        // Any non-dark pixel outside the car is studio background
                        if (r > 120 || g > 120 || b > 120 || a < 200)
                        {
                            isBgPixel = true;
                        }
                    }
                    else
                    {
                        // Studio background surrounding the car
                        // Studio light is very neutral (low maxDiff) and bright (r,g,b > 185)
                        // If it's connected to background and matches studio background:
                        if (maxDiff < 25 && r > 180 && g > 180 && b > 180)
                        {
                            // Make sure we don't bleed into white car body:
                            // The car outline has dark borders (windshield, roof rails, pillars, wheel arches, grilles, headlights)
                            // On the front hood, hood edge is at cy > 250 and cx > 100
                            if (cy < 240 && cx < 300)
                            {
                                isBgPixel = true;
                            }
                            else if (cy < 150)
                            {
                                isBgPixel = true;
                            }
                            else if (cy > 620 && (r > 170 && g > 170 && b > 170))
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

            // Step 2: Clear identified background pixels
            for (int y = 0; y < h; y++)
            {
                for (int x = 0; x < w; x++)
                {
                    int offset = y * stride + x * 4;
                    byte a = buffer[offset + 3];

                    if (isBg[idx(x, y)])
                    {
                        buffer[offset + 3] = 0; // Transparent
                    }
                    else if (y > 660)
                    {
                        // Remove floor reflections below tires
                        buffer[offset + 3] = 0;
                    }
                    else if (y < 125 || x < 85 || x > w - 85)
                    {
                        // Outside bounds stray dots
                        buffer[offset + 3] = 0;
                    }
                    else
                    {
                        // Defringe border pixels: if high brightness and semi-transparent
                        byte b = buffer[offset];
                        byte g = buffer[offset + 1];
                        byte r = buffer[offset + 2];
                        int maxDiff = Math.Max(Math.Abs(r - g), Math.Max(Math.Abs(g - b), Math.Abs(r - b)));
                        if (maxDiff < 15 && r > 210 && g > 210 && b > 210 && (y < 160 || x < 150))
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
