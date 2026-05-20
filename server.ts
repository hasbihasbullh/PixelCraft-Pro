import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import sharp from 'sharp';
import exifReader from 'exif-reader';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use memory storage for processing in RAM as requested
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  });

  // API Routes
  app.post('/api/analyze-colors', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
      }

      const prompt = `You are an advanced Multimodal Image Color Analyzer. Your task is to perform a detailed color clustering and comprehensive statistical analysis on the attached image, matching the layout and data fields of professional color summarizers.

### INSTRUCTIONS:
1. Analyze the visual pixels of the provided image.
2. Group the colors into the top 8 most dominant color clusters based on pixel distribution.
3. For each color cluster, extract and calculate the following precise metrics:
   - Percentage of total pixels (e.g., 41.02%).
   - Color names and tags (human-readable descriptors like 'army green', 'turtle green', 'starship').
   - HEX code (e.g., #4B5B10).
   - RGB values (Red, Green, Blue).
   - HSV values (Hue, Saturation, Value).
   - LCH values (Lightness, Chroma, Hue).
   - Lab values (CIELAB color space).
4. Provide a brief creative summary of the overall color palette harmony.

### OUTPUT FORMAT:
You must output the result strictly in a clean JSON format. Do not include any conversational filler text, markdown code blocks, or explanations outside the JSON.

### EXPECTED JSON SCHEMA:
{
  "overall_summary": {
    "dominant_tone": "string",
    "harmony_type": "string"
  },
  "color_table": [
    {
      "cluster_id": integer,
      "pixel_percentage": "string",
      "color_names_tags": ["string"],
      "hex": "string",
      "rgb": { "r": integer, "g": integer, "b": integer },
      "hsv": { "h": integer, "s": integer, "v": integer },
      "lch": { "l": integer, "c": integer, "h": integer },
      "lab": { "l": integer, "a": integer, "b": integer }
    }
  ]
}`;

      const imagePart = {
        inlineData: {
          mimeType: req.file.mimetype,
          data: req.file.buffer.toString('base64'),
        },
      };

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overall_summary: {
                type: Type.OBJECT,
                properties: {
                  dominant_tone: { type: Type.STRING },
                  harmony_type: { type: Type.STRING }
                },
                required: ["dominant_tone", "harmony_type"]
              },
              color_table: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    cluster_id: { type: Type.INTEGER },
                    pixel_percentage: { type: Type.STRING },
                    color_names_tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    hex: { type: Type.STRING },
                    rgb: {
                      type: Type.OBJECT,
                      properties: {
                        r: { type: Type.INTEGER },
                        g: { type: Type.INTEGER },
                        b: { type: Type.INTEGER }
                      },
                      required: ["r", "g", "b"]
                    },
                    hsv: {
                      type: Type.OBJECT,
                      properties: {
                        h: { type: Type.INTEGER },
                        s: { type: Type.INTEGER },
                        v: { type: Type.INTEGER }
                      },
                      required: ["h", "s", "v"]
                    },
                    lch: {
                      type: Type.OBJECT,
                      properties: {
                        l: { type: Type.INTEGER },
                        c: { type: Type.INTEGER },
                        h: { type: Type.INTEGER }
                      },
                      required: ["l", "c", "h"]
                    },
                    lab: {
                      type: Type.OBJECT,
                      properties: {
                        l: { type: Type.INTEGER },
                        a: { type: Type.INTEGER },
                        b: { type: Type.INTEGER }
                      },
                      required: ["l", "a", "b"]
                    }
                  },
                  required: ["cluster_id", "pixel_percentage", "color_names_tags", "hex", "rgb", "hsv", "lch", "lab"]
                }
              }
            },
            required: ["overall_summary", "color_table"]
          }
        }
      });

      if (!response.text) {
        throw new Error('Empty response from Gemini');
      }

      res.json(JSON.parse(response.text));
    } catch (error) {
      console.error('Color Analysis Error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to analyze colors' });
    }
  });

  app.post('/api/metadata', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
      }

      const metadata = await sharp(req.file.buffer).metadata();
      let exif = null;
      
      if (metadata.exif) {
        try {
          exif = exifReader(metadata.exif);
        } catch (e) {
          console.warn('Failed to parse EXIF:', e);
        }
      }

      res.json({
        basic: {
          format: metadata.format,
          width: metadata.width,
          height: metadata.height,
          space: metadata.space,
          channels: metadata.channels,
          depth: metadata.depth,
          density: metadata.density,
          hasProfile: metadata.hasProfile,
          hasAlpha: metadata.hasAlpha,
          size: req.file.size
        },
        exif: exif
      });
    } catch (error) {
      console.error('Metadata Extraction Error:', error);
      res.status(500).json({ error: 'Failed to extract metadata' });
    }
  });

  app.post('/api/process', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
      }

      const { mode, scale, format = 'png', quality = 90 } = req.body;
      let processor = sharp(req.file.buffer);

      // 1. Color Modes
      switch (mode) {
        case 'grayscale':
          processor = processor.grayscale();
          break;
        case 'bw':
          processor = processor.threshold(128); // 1-bit simulation
          break;
        case 'indexed256':
          // Valid only for PNG output in sharp palette mode
          break;
        case 'indexed1024':
          break;
        case 'highcolor':
          // Set bit depth for PNG
          break;
      }

      // 2. Scaling (Lanczos is default for sharp resize)
      if (scale && scale !== '1') {
        const metadata = await processor.metadata();
        const factor = parseFloat(scale);
        if (metadata.width && metadata.height) {
          processor = processor.resize({
            width: Math.round(metadata.width * factor),
            height: Math.round(metadata.height * factor),
            kernel: 'lanczos3'
          });
        }
      }

      // 3. Final Output & Format
      let outputBuffer: Buffer;
      const targetFormat = format.toLowerCase();

      if (targetFormat === 'jpg' || targetFormat === 'jpeg') {
        outputBuffer = await processor.jpeg({ quality: parseInt(quality) }).toBuffer();
      } else if (targetFormat === 'tiff') {
        outputBuffer = await processor.tiff().toBuffer();
      } else {
        // PNG Processing
        if (mode === 'indexed256') {
          outputBuffer = await processor.png({ palette: true, colors: 256 }).toBuffer();
        } else if (mode === 'indexed1024') {
          // Sharp caps PNG palette entries at 256. 
          // We use the maximum allowed to approximate high-quality indexing.
          outputBuffer = await processor.png({ palette: true, colors: 256 }).toBuffer();
        } else if (mode === 'highcolor') {
          outputBuffer = await processor.png({ bitdepth: 16 } as any).toBuffer();
        } else {
          outputBuffer = await processor.png().toBuffer();
        }
      }

      const base64 = outputBuffer.toString('base64');
      const mimeType = targetFormat === 'jpg' ? 'image/jpeg' : `image/${targetFormat}`;
      
      res.json({
        data: `data:${mimeType};base64,${base64}`,
        info: await sharp(outputBuffer).metadata()
      });

    } catch (error) {
      console.error('Image Processing Error:', error);
      res.status(500).json({ error: 'Failed to process image' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
