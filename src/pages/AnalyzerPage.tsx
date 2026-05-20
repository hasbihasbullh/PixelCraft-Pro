import { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  Trash2, 
  Palette, 
  Info,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Download,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ColorMetric {
  cluster_id: number;
  pixel_percentage: string;
  color_names_tags: string[];
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsv: { h: number; s: number; v: number };
  lch: { l: number; c: number; h: number };
  lab: { l: number; a: number; b: number };
}

interface AnalysisResponse {
  overall_summary: {
    dominant_tone: string;
    harmony_type: string;
  };
  color_table: ColorMetric[];
}

export default function AnalyzerPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeImage = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/analyze-colors', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to analyze colors');
      }

      const result = await res.json();
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }
    setError(null);
    setFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    analyzeImage(file);
  };

  const onDrop = useCallback((e: any) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadJSON = () => {
    if (!analysis) return;
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `color-analysis-${file?.name.split('.')[0] || 'result'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F7] text-[#1A1A1A] font-sans selection:bg-[#E5E5E5] flex flex-col">
      <header className="border-b border-[#1A1A1A]/10 bg-white/80 backdrop-blur-md z-50 sticky top-0">
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-[#F5F5F4] rounded-lg transition-colors group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div className="h-6 w-[1px] bg-[#1A1A1A]/10 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#1A1A1A] rounded flex items-center justify-center shadow-lg shadow-black/10">
                <Palette size={18} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold tracking-tight text-sm leading-none uppercase">Color Profiler</h1>
                <p className="text-[10px] font-medium opacity-40 mt-1 uppercase tracking-wider hidden sm:block">AI Chromatic Analysis</p>
              </div>
            </div>
          </div>
          {analysis && (
            <button 
              onClick={downloadJSON}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              <Download size={14} /> Export Report
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          {!file ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="aspect-video min-h-[400px] border-2 border-dashed border-[#1A1A1A]/10 rounded-[40px] flex flex-col items-center justify-center gap-8 hover:border-[#1A1A1A]/20 transition-all cursor-pointer bg-white group p-12 text-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-24 h-24 bg-[#F5F5F4] rounded-[32px] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 border border-[#1A1A1A]/5">
                <Upload size={40} className="text-[#1A1A1A]/40" />
              </div>
              <div className="max-w-md">
                <h2 className="font-black text-3xl tracking-tighter uppercase italic">Inject Visual Sample</h2>
                <p className="text-sm opacity-40 mt-3 font-medium">Extract precise chromatic DNA, Lab values, and dominant clusters using Multimodal AI.</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }} 
                className="hidden" 
                accept="image/*"
              />
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Image Preview Sidebar */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="aspect-square rounded-[32px] overflow-hidden bg-white border border-[#1A1A1A]/5 shadow-2xl relative group">
                  <img src={previewUrl!} alt="Sample" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                     <span className="text-[10px] text-white font-black uppercase tracking-widest bg-black/50 px-4 py-2 rounded-full backdrop-blur">Sample Reference</span>
                  </div>
                </div>
                
                <div className="p-6 bg-white rounded-[24px] border border-[#1A1A1A]/5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">File Details</span>
                     <button 
                        onClick={() => {
                          setFile(null);
                          setAnalysis(null);
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm truncate">{file.name}</h3>
                    <p className="text-[10px] opacity-40 font-mono mt-1 uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.split('/')[1]}</p>
                  </div>
                </div>

                {analysis && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-6 bg-blue-600 text-white rounded-[24px] shadow-xl shadow-blue-600/20"
                  >
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Summary</h4>
                    <p className="text-xl font-bold tracking-tight leading-tight italic">"{analysis.overall_summary.dominant_tone}"</p>
                    <div className="mt-4 pt-4 border-t border-white/20 flex flex-col gap-2">
                       <span className="text-[8px] font-black uppercase opacity-60">Harmony Type</span>
                       <span className="text-xs font-bold uppercase tracking-wider">{analysis.overall_summary.harmony_type}</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Analysis Results */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                {isAnalyzing ? (
                  <div className="bg-white rounded-[40px] border border-[#1A1A1A]/5 p-20 flex flex-col items-center justify-center gap-6 shadow-sm min-h-[600px]">
                    <div className="relative">
                       <Loader2 className="animate-spin text-blue-600" size={60} />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse" />
                       </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-black text-2xl uppercase italic tracking-tighter">Deep Raster Scan</h3>
                      <p className="text-sm opacity-40 mt-2 font-medium">Clustering pixels and mapping CIELAB color space...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="p-12 bg-red-50 border border-red-100 rounded-[40px] flex flex-col items-center text-center gap-4 text-red-600">
                    <AlertCircle size={48} />
                    <div>
                      <h4 className="font-black text-2xl uppercase italic">Diagnostic Alert</h4>
                      <p className="text-sm opacity-80 mt-2 max-w-md">{error}</p>
                      <button 
                        onClick={() => analyzeImage(file)}
                        className="mt-8 px-8 py-3 bg-red-600 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
                      >
                        Retry Analysis
                      </button>
                    </div>
                  </div>
                ) : analysis ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="grid grid-cols-1 gap-4">
                      {analysis.color_table.map((color, i) => (
                        <motion.div
                          key={color.cluster_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-white rounded-3xl border border-[#1A1A1A]/5 p-5 shadow-sm group hover:border-[#1A1A1A]/10 transition-colors"
                        >
                          <div className="flex flex-col md:flex-row gap-6 md:items-center">
                            {/* Color Block */}
                            <div className="flex items-center gap-4 shrink-0">
                               <div 
                                  className="w-16 h-16 rounded-2xl shadow-inner border border-[#1A1A1A]/5"
                                  style={{ backgroundColor: color.hex }}
                                />
                                <div className="flex flex-col">
                                   <span className="text-[10px] font-black opacity-20 uppercase">Cluster {color.cluster_id}</span>
                                   <span className="text-lg font-black tracking-tight">{color.pixel_percentage}</span>
                                </div>
                            </div>

                            <div className="h-10 w-[1px] bg-[#1A1A1A]/5 hidden md:block" />

                            {/* Name & Hex */}
                            <div className="flex-1 min-w-0">
                               <div className="flex flex-wrap gap-2 mb-2">
                                  {color.color_names_tags.map(tag => (
                                    <span key={tag} className="text-[9px] font-bold uppercase tracking-wider bg-[#F5F5F4] px-2 py-1 rounded-md opacity-60">
                                      {tag}
                                    </span>
                                  ))}
                               </div>
                               <button 
                                  onClick={() => copyToClipboard(color.hex, `hex-${color.cluster_id}`)}
                                  className="flex items-center gap-2 hover:opacity-100 opacity-100"
                                >
                                  <span className="font-mono font-bold text-sm tracking-widest">{color.hex}</span>
                                  <div className="p-1 hover:bg-[#F5F5F4] rounded transition-colors">
                                     {copiedId === `hex-${color.cluster_id}` ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="opacity-20" />}
                                  </div>
                               </button>
                            </div>

                            <div className="h-10 w-[1px] bg-[#1A1A1A]/5 hidden md:block" />

                            {/* Technical Specs */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-3">
                               <div className="flex flex-col">
                                  <span className="text-[8px] font-black uppercase opacity-20 tracking-widest">RGB</span>
                                  <span className="text-[10px] font-mono font-bold">{color.rgb.r}, {color.rgb.g}, {color.rgb.b}</span>
                               </div>
                               <div className="flex flex-col">
                                  <span className="text-[8px] font-black uppercase opacity-20 tracking-widest">HSV</span>
                                  <span className="text-[10px] font-mono font-bold">{color.hsv.h}°, {color.hsv.s}%, {color.hsv.v}%</span>
                               </div>
                               <div className="flex flex-col">
                                  <span className="text-[8px] font-black uppercase opacity-20 tracking-widest">LCH</span>
                                  <span className="text-[10px] font-mono font-bold">{color.lch.l}, {color.lch.c}, {color.lch.h}</span>
                               </div>
                               <div className="flex flex-col">
                                  <span className="text-[8px] font-black uppercase opacity-20 tracking-widest">Lab</span>
                                  <span className="text-[10px] font-mono font-bold">{color.lab.l}, {color.lab.a}, {color.lab.b}</span>
                               </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="p-8 bg-[#F5F5F4] rounded-[32px] border border-[#1A1A1A]/5 text-center flex flex-col items-center">
                      <Info size={32} className="opacity-10 mb-4" />
                      <h4 className="font-black uppercase italic tracking-widest opacity-30 text-sm">Forensic Data Notice</h4>
                      <p className="text-[10px] font-bold opacity-20 mt-2 max-w-lg mx-auto leading-relaxed">
                        Color clusters are derived via Multimodal AI vision analysis. Metrics including CIELAB (Lab) and LCH are approximations calculated based on the primary pixel distribution patterns within the neural representation of the sample.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="p-10 bg-white rounded-[40px] border border-[#1A1A1A]/5 text-center h-full flex flex-col items-center justify-center opacity-40">
                    <Palette size={48} className="mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest italic">Awaiting Processing Buffer...</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.01] z-[-1]" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />
    </div>
  );
}
