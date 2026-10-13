using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;

public class ImageProcessor {
    public static void MakeCutout(string inputPath, string outputPath) {
        using (Bitmap src = new Bitmap(inputPath)) {
            int w = src.Width;
            int h = src.Height;
            Bitmap dst = new Bitmap(w, h, PixelFormat.Format32bppArgb);

            using (Graphics g = Graphics.FromImage(dst)) {
                g.DrawImage(src, 0, 0, w, h);
            }

            BitmapData data = dst.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
            int stride = Math.Abs(data.Stride);
            byte[] bytes = new byte[stride * h];
            System.Runtime.InteropServices.Marshal.Copy(data.Scan0, bytes, 0, bytes.Length);

            bool[] visited = new bool[w * h];
            Queue<int> q = new Queue<int>();

            // Seed edges
            for (int x = 0; x < w; x++) {
                q.Enqueue(x);
                visited[x] = true;
                q.Enqueue((h - 1) * w + x);
                visited[(h - 1) * w + x] = true;
            }
            for (int y = 0; y < h; y++) {
                int left = y * w;
                int right = y * w + (w - 1);
                if (!visited[left]) { q.Enqueue(left); visited[left] = true; }
                if (!visited[right]) { q.Enqueue(right); visited[right] = true; }
            }

            int[] dx = { 1, -1, 0, 0 };
            int[] dy = { 0, 0, 1, -1 };

            while (q.Count > 0) {
                int curr = q.Dequeue();
                int cx = curr % w;
                int cy = curr / w;

                int offset = cy * stride + cx * 4;
                byte b = bytes[offset];
                byte g = bytes[offset + 1];
                byte r = bytes[offset + 2];

                // If pixel is near white/light grey background (R,G,B all > 225)
                if (r > 225 && g > 225 && b > 225) {
                    bytes[offset + 3] = 0; // Alpha = 0

                    for (int i = 0; i < 4; i++) {
                        int nx = cx + dx[i];
                        int ny = cy + dy[i];
                        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                            int nidx = ny * w + nx;
                            if (!visited[nidx]) {
                                visited[nidx] = true;
                                q.Enqueue(nidx);
                            }
                        }
                    }
                }
            }

            System.Runtime.InteropServices.Marshal.Copy(bytes, 0, data.Scan0, bytes.Length);
            dst.UnlockBits(data);
            dst.Save(outputPath, ImageFormat.Png);
            dst.Dispose();
        }
        Console.WriteLine("Done: " + outputPath);
    }

    public static void Main(string[] args) {
        MakeCutout(@"D:\Traveller\public\images\cars\innova.jpg", @"D:\Traveller\public\images\cars\innova-transparent.png");
        MakeCutout(@"D:\Traveller\public\images\cars\ertiga.jpg", @"D:\Traveller\public\images\cars\ertiga-transparent.png");
        MakeCutout(@"D:\Traveller\public\images\cars\swift-dzire.jpg", @"D:\Traveller\public\images\cars\swift-dzire-transparent.png");
        MakeCutout(@"D:\Traveller\public\images\cars\urbania.jpg", @"D:\Traveller\public\images\cars\urbania-transparent.png");
    }
}
