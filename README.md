# PixelCraft Pro 🎨🛠️

PixelCraft Pro is an advanced, professional-grade image processing, forensic metadata extraction, and AI-powered chromatic analysis suite. Designed with a clean, high-contrast display aesthetic and an organic minimalist layout, PixelCraft Pro operates as a self-contained local graphics sandbox.

Whether you need forensic-level EXIF inspection, extreme high-speed downscaling/upscaling via Lanczos interpolations, or deep neural pixel color clustering into CIELAB, LCH, and HSV color structures, PixelCraft Pro does it with maximum responsiveness and visual honesty.

---

## 🚀 Key Modules

### 1. Image Studio (`/process`)
An advanced render environment utilizing structural sliders to customize and preview graphic output in real time.
* **Resizing & Calibration**: Control width, height, and crop layout constraints.
* **Sharp Kernel Mechanics**: Powered by the hyper-efficient C-based `sharp` framework with Lanczos3 interpolations.
* **Quantization & Depth**: Toggle customized quantization, palette indexing, color profiles (sRGB), and 16-bit PNG modes.
* **Responsive Comparison Sandbox**: Interactive vertical slider mode and translation pans to scrutinize original versus processed variations at high magnification ratios.

### 2. Color Profiler (`/analyzer`)
A deep vision system powered by **Gemini 3.5 Flash** to segment visual colors and generate highly detailed technical color reports.
* **Structured Cluster Extraction**: Analyzes spatial pixel groupings to surface the top 8 most dominant color clusters.
* **Complete Multi-Space Metrics**: Maps each color identifier directly into:
  - Human-friendly color tags (e.g., *starship*, *turtle green*).
  - Exact HEX and RGB codes.
  - Cylindrical HSV (Hue, Saturation, Value) coordinates.
  - High-precision LCH (Lightness, Chroma, Hue) values.
  - CIE $L^*a^*b^*$ color systems for scientific consistency.
* **Dynamic Reports**: Generates an overall harmony summary with an export system allowing you to download complete chromatic profiling profiles as structured JSON logs.

### 3. Meta Inspector (`/metadata`)
A robust digital forensic tool for identifying hidden patterns, file headers, and telemetry records within any graphic target.
* **Global Header Reader**: Surfaces pixel heights, widths, density formats, color lanes, and byte sizes immediately.
* **EXIF Demultiplexing**: Decrypts sensor records, camera specifications, shutter configurations, exposure values, focus metrics, and flash states.
* **Digital Trace Indicators**: Tracks editing systems, compile software signatures, and original modify times.
* **Geo Location (GPS)**: Extracts and structures altitude profiles and geographic coordinate boundaries if attached to the media record.

---

## 🛠️ Technology Stack

* **Frontend Framework**: React 19 + TypeScript + Vite
* **Fluid Layout Styling**: Tailwind CSS (v4 structure)
* **Choreographed Motion**: `motion/react` for elegant hardware-accelerated user interaction.
* **Backend Runtime**: Node.js + Express with ES Module runtime supported by `tsx`.
* **Rendering & Imaging Engines**: `sharp` for native pipeline speed and `exif-reader` for sensor record processing.
* **Multimodal Generation Core**: Google @google/genai SDK targeting Gemini models to extract structured JSON properties.

---

## ⚙️ Initial Startup & Setup Instructions

### 1. Prerequisite Environment Declaration
Duplicate `.env.example` to establish configuration files:
```bash
cp .env.example .env
```

Populate the required Gemini credentials:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_goes_here
```

### 2. Installing Packages
Run local dependency initialization to fetch node modules:
```bash
npm install
```

### 3. Running Development Sandbox
Launch the Express reverse proxy and hot asset-reloading compiler bundled with Vite:
```bash
npm run dev
```
The application will boot up and bind to host interface `0.0.0.0` at port `3000`. Open your browser or deployment link to access PixelCraft Pro.

### 4. Compilation & Production Pipeline
To assemble optimized server engines and bundled client pipelines:
```bash
npm run build
```
Launches Vite build processes for the static React assets, compiling the Express custom backend architecture directly into `dist/server.cjs` via `esbuild`.

To launch in production mode:
```bash
npm run start
```

---

## 📂 Modular Blueprint Overview

* `/src/pages/HomePage.tsx` - High-contrast hero landing viewport highlighting structural navigation anchors.
* `/src/pages/ProcessorPage.tsx` - Image Studio editing environment with comparative pan sliders.
* `/src/pages/AnalyzerPage.tsx` - AI Color Profiler compiling structural color tables and multi-space projections.
* `/src/pages/MetadataPage.tsx` - Forensic Meta Inspector parsing EXIF, camera, and GPS coordinates.
* `/server.ts` - Self-contained Express application integrating Multer uploads, Sharp graphics, and GenAI SDK hooks.
* `/metadata.json` - Active configuration parameters specifying descriptive metadata terms and permissions.
