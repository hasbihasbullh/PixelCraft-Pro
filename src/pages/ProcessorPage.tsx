import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Upload, 
  Trash2, 
  Download, 
  Image as ImageIcon, 
  Layers, 
  Maximize, 
  Settings2,
  ChevronRight,
  Info,
  Loader2,
  AlertCircle,
  Activity,
  Move,
  RefreshCw,
  MousePointer2,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Mode = 'original' | 'grayscale' | 'bw' | 'indexed256' | 'indexed1024' | 'highcolor';
type Scale = '1' | '2' | '4';
type Format = 'png' | 'jpg' | 'tiff';

interface ProcessInfo {
  width: number;
  height: number;
  format: string;
  size?: number;
  channels?: number;
  depth?: string;
  space?: string;
  density?: number;
  chromaSubsampling?: string;
  isProgressive?: boolean;
  hasProfile?: boolean;
  hasAlpha?: boolean;
  [key: string]: any;
}

interface ImageSliderProps {
  before: string;
  after: string;
  isProcessing: boolean;
  aspectRatio?: number;
}

function ImageSlider({ before, after, isProcessing, aspectRatio }: ImageSliderProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanActive, setIsPanActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: any) => {
    if (!containerRef.current || isPanActive) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    
    setSliderPos(Math.max(0, Math.min(100, position)));
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      
      setScale(prev => {
        const newScale = Math.max(1, Math.min(8, prev + delta));
        if (newScale === 1) {
          setOffset({ x: 0, y: 0 });
        }
        return newScale;
      });
    };

    container.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => container.removeEventListener('wheel', handleWheelNative);
  }, []);

  const  handlePan = (_: any, info: { delta: { x: number; y: number } }) => {
    if (!isPanActive) return;
    setOffset(prev => ({
      x: prev.x + info.delta.x,
      y: prev.y + info.delta.y
    }));
  };

  const resetView = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') resetView();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPanActive(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetView]);

  return (
    <div 
      ref={containerRef}
      onDoubleClick={resetView}
      className={cn(
        "relative bg-[#E5E5E5] rounded-xl overflow-hidden shadow-inner border border-[#1A1A1A]/5 select-none h-full w-full touch-none",
        !aspectRatio ? "aspect-square" : ""
      )}
      style={aspectRatio ? { aspectRatio: `${aspectRatio}`, width: aspectRatio > 1 ? '100%' : 'auto', height: aspectRatio > 1 ? 'auto' : '100%', margin: '0 auto' } : undefined}
      onMouseMove={(e: any) => handleMove(e)}
      onTouchMove={(e: any) => handleMove(e)}
    >
      <motion.div 
        className="w-full h-full relative"
        animate={{ 
          scale,
          x: offset.x,
          y: offset.y
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
        onPan={handlePan}
      >
        <img 
          src={before} 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
          alt="Original" 
        />

        <div 
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
        >
          <img 
            src={after} 
            className="absolute inset-0 w-full h-full object-cover" 
            alt="Processed" 
          />
        </div>

        <div 
          className="absolute inset-y-0 w-0.5 bg-white shadow-xl z-20 pointer-events-none flex items-center justify-center"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-2xl border border-[#1A1A1A]/10 flex items-center justify-center gap-1">
            <div className="w-0.5 h-3 bg-[#1A1A1A]/20" />
            <div className="w-0.5 h-3 bg-[#1A1A1A]/20" />
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-4 right-4 flex items-center gap-2 z-30">
        <div className="flex bg-white/90 backdrop-blur border border-[#1A1A1A]/10 rounded-xl overflow-hidden shadow-xl">
          <button 
            onClick={() => setIsPanActive(false)}
            className={cn(
              "w-9 h-9 flex items-center justify-center transition-colors",
              !isPanActive ? "bg-[#1A1A1A] text-white" : "hover:bg-[#F5F5F4]"
            )}
            title="Slider Mode"
          >
            <MousePointer2 size={16} />
          </button>
          <button 
            onClick={() => setIsPanActive(true)}
            className={cn(
              "w-9 h-9 flex items-center justify-center transition-colors border-l border-[#1A1A1A]/5",
              isPanActive ? "bg-[#1A1A1A] text-white" : "hover:bg-[#F5F5F4]"
            )}
            title="Pan Mode"
          >
            <Move size={16} />
          </button>
        </div>
        
        <button 
          onClick={resetView}
          className="w-9 h-9 bg-white/90 backdrop-blur border border-[#1A1A1A]/10 rounded-xl flex items-center justify-center hover:bg-[#F5F5F4] transition-colors shadow-xl"
          title="Reset Viewport"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="absolute bottom-4 left-4 z-30 bg-white/90 backdrop-blur border border-[#1A1A1A]/10 rounded-lg px-2 py-1 shadow-xl">
        <span className="text-[9px] font-black font-mono">{Math.round(scale * 100)}%</span>
      </div>

      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <span className="px-2 py-1 bg-black/50 text-white text-[8px] font-bold uppercase tracking-widest backdrop-blur-sm rounded">Original</span>
      </div>
      <div className="absolute top-4 right-4 z-20 pointer-events-none">
        <span className="px-2 py-1 bg-blue-600 text-white text-[8px] font-bold uppercase tracking-widest rounded shadow-lg">Processed</span>
      </div>

      {isProcessing && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex flex-col items-center justify-center z-30">
          <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
          <p className="text-[10px] font-bold uppercase tracking-tighter animate-pulse">Computing Render...</p>
        </div>
      )}
    </div>
  );
}

export default function ProcessorPage() {
  const navigate = useNavigate();
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<ProcessInfo | null>(null);

  const [mode, setMode] = useState<Mode>('original');
  const [scale, setScale] = useState<Scale>('1');
  const [format, setFormat] = useState<Format>('png');
  const [quality, setQuality] = useState(90);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);
  
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(async () => {
    if (!originalFile) return;

    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', originalFile);
    formData.append('mode', mode);
    formData.append('scale', scale);
    formData.append('format', format);
    formData.append('quality', quality.toString());

    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Processing failed');

      const result = await res.json();
      setProcessedUrl(result.data);
      setInfo(result.info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  }, [originalFile, mode, scale, format, quality]);

  useEffect(() => {
    if (!originalFile) return;

    const timer = setTimeout(() => {
      processImage();
    }, 150);

    return () => clearTimeout(timer);
  }, [processImage, originalFile]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }
    setError(null);
    setOriginalFile(file);
    
    const img = new Image();
    img.onload = () => {
      setInfo({
        width: img.width,
        height: img.height,
        format: file.type.split('/')[1] || 'image',
        size: file.size,
        depth: '8-bit',
        space: 'srgb'
      });
    };
    img.src = URL.createObjectURL(file);
    
    setPreviewUrl(URL.createObjectURL(file));
    setProcessedUrl(null);
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  };

  const onDrop = useCallback((e: any) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const onFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const downloadImage = () => {
    if (!processedUrl || !originalFile) return;
    const link = document.createElement('a');
    link.href = processedUrl;
    const originalName = originalFile.name.split('.').slice(0, -1).join('.') || 'processed';
    link.download = `${originalName}-chromabit.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-screen bg-[#F8F8F7] text-[#1A1A1A] font-sans selection:bg-[#E5E5E5] overflow-hidden flex flex-col transition-colors duration-300">
      <header className="border-b border-[#1A1A1A]/10 bg-white/80 backdrop-blur-md z-50 shrink-0">
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
                <Layers size={18} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold tracking-tight text-sm leading-none">CHROMABIT STUDIO</h1>
                <p className="text-[10px] font-medium opacity-40 mt-1 uppercase tracking-wider hidden sm:block">Image Processing Suite</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={cn(
                "p-2 rounded-lg transition-all",
                isSidebarOpen ? "bg-[#1A1A1A] text-white" : "bg-white border border-[#1A1A1A]/10 hover:bg-[#F5F5F4]"
              )}
            >
              <Settings2 size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 transition-all duration-300">
          <div className="max-w-3xl mx-auto min-h-full flex flex-col">
            <AnimatePresence mode="wait">
              {!previewUrl ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex-1 border-2 border-dashed border-[#1A1A1A]/10 rounded-[24px] md:rounded-[32px] flex flex-col items-center justify-center gap-6 hover:border-[#1A1A1A]/20 transition-all cursor-pointer bg-white group p-6 text-center"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 md:w-20 h-16 md:h-20 bg-[#F5F5F4] rounded-2xl md:rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-[#1A1A1A]/5">
                    <Upload size={28} className="text-[#1A1A1A]/40" />
                  </div>
                  <div>
                    <p className="font-bold text-lg md:text-xl tracking-tight">Master Image Upload</p>
                    <p className="text-sm opacity-40 mt-1">Drag and drop or click to ingest file</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-2">
                    {['PNG', 'JPG', 'TIFF'].map(ext => (
                      <span key={ext} className="text-[10px] font-black opacity-20 border border-[#1A1A1A]/10 px-2 py-0.5 rounded">{ext}</span>
                    ))}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={onFileChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col gap-4 md:gap-6"
                >
                  <div className="flex items-center justify-between bg-white px-4 md:px-6 py-3 rounded-xl md:rounded-2xl border border-[#1A1A1A]/5 shadow-sm">
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      <button 
                        onClick={() => {
                          setPreviewUrl(null);
                          setProcessedUrl(null);
                          setOriginalFile(null);
                        }}
                        className="w-9 md:w-10 h-9 md:h-10 rounded-lg md:rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors shrink-0"
                        title="Clear Image"
                      >
                        <Trash2 size={16} md:size={18} />
                      </button>
                      <div className="h-6 md:h-8 w-[1px] bg-[#1A1A1A]/10 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[8px] md:text-[10px] font-black uppercase opacity-30 tracking-widest truncate">Input File</p>
                        <p className="text-[10px] md:text-xs font-bold truncate max-w-[120px] md:max-w-[200px]">{originalFile?.name}</p>
                      </div>
                    </div>
                    
                    {processedUrl && (
                      <button 
                        onClick={downloadImage}
                        className="px-4 h-9 md:h-10 rounded-lg md:rounded-xl bg-[#1A1A1A] text-white text-[10px] md:text-xs font-bold hover:bg-[#2A2A2A] transition-all flex items-center gap-2 shadow-lg shadow-black/10 shrink-0"
                      >
                        <Download size={14} /> <span className="hidden sm:inline">Export Asset</span>
                      </button>
                    )}
                  </div>

                  <div className="flex-1 flex items-center justify-center relative min-h-0 bg-white rounded-2xl md:rounded-[32px] p-4 md:p-8 border border-[#1A1A1A]/5 shadow-sm isolate overflow-hidden">
                    <div className="absolute top-8 left-10 z-10 pointer-events-none">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Analysis Viewport</span>
                        <span className="hidden sm:inline text-[9px] opacity-30 mt-0.5 uppercase tracking-tighter">Swipe horizontally to compare</span>
                      </div>
                    </div>
                    
                    <div className="absolute top-8 right-10 z-10 flex items-center gap-3">
                      {info && (
                        <div className="flex gap-2 md:gap-4 text-[9px] md:text-[10px] font-mono font-bold opacity-30">
                          <span className="bg-[#F5F5F4] px-1.5 py-0.5 rounded">{info.width}×{info.height}</span>
                        </div>
                      )}
                      <button 
                        onClick={() => setIsInfoPanelOpen(!isInfoPanelOpen)}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                          isInfoPanelOpen ? "bg-[#1A1A1A] text-white" : "hover:bg-[#F5F5F4] opacity-40 hover:opacity-100"
                        )}
                      >
                        <Activity size={14} />
                      </button>
                    </div>

                    <div className="w-full h-full flex items-center justify-center relative min-h-[400px]">
                      <ImageSlider 
                        before={previewUrl} 
                        after={processedUrl || previewUrl} 
                        isProcessing={isProcessing} 
                        aspectRatio={info ? info.width / info.height : undefined}
                      />
                    </div>

                    {originalFile && !processedUrl && !isProcessing && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 md:px-6 py-2 md:py-3 bg-[#1A1A1A]/90 backdrop-blur text-white rounded-full shadow-2xl z-40 whitespace-nowrap"
                      >
                        <ImageIcon size={14} className="text-white/60" />
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Awaiting Render Batch</p>
                      </motion.div>
                    )}
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-600 text-[11px] md:text-sm">
                      <AlertCircle size={18} />
                      {error}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] lg:hidden"
              />
              
              <motion.aside 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed lg:relative right-0 top-0 bottom-0 w-[320px] md:w-[400px] bg-white border-l border-[#1A1A1A]/10 shadow-[-20px_0_40px_rgba(0,0,0,0.1)] z-[60] lg:z-40 flex flex-col h-full overflow-hidden"
              >
                <div className="p-6 md:p-8 flex flex-col gap-8 md:gap-10 overflow-y-auto flex-1 custom-scrollbar bg-white">
                  {previewUrl && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <ImageIcon size={16} className="opacity-40" />
                        <h2 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] italic">Original Source</h2>
                      </div>
                      <div className="relative aspect-video rounded-xl md:rounded-2xl overflow-hidden border border-[#1A1A1A]/10 bg-[#F5F5F4] group">
                        <img 
                          src={previewUrl} 
                          alt="Original Thumbnail" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                          <p className="text-[8px] text-white font-mono font-bold truncate">{originalFile?.name}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-4 md:gap-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Settings2 size={16} className="opacity-40" />
                        <h2 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] italic">Color Depth Mode</h2>
                      </div>
                      <div className="group relative">
                        <Info size={14} className="opacity-20 cursor-help hover:opacity-100 transition-opacity" />
                        <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-[#1A1A1A] text-white text-[9px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                          Select color quantization: Grayscale for mono, Indexed for palettes, High Color for deep bit-depth.
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'original', name: 'Original', desc: 'No processing' },
                        { id: 'grayscale', name: 'Grayscale', desc: '8-bit Mono' },
                        { id: 'bw', name: 'Black & White', desc: '1-bit High Contrast' },
                        { id: 'indexed256', name: '256 Indexed', desc: '8-bit Palette' },
                        { id: 'indexed1024', name: '1024 Indexed', desc: 'HQ Palette' },
                        { id: 'highcolor', name: 'High Colour', desc: '16-bit Per Channel' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setMode(m.id as Mode)}
                          className={cn(
                            "w-full text-left p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all relative group overflow-hidden",
                            mode === m.id 
                              ? "bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-xl shadow-black/10" 
                              : "border-[#1A1A1A]/5 hover:border-[#1A1A1A]/10 hover:bg-[#F5F5F4]"
                          )}
                        >
                          <div className="flex justify-between items-start relative z-10">
                            <div className="min-w-0">
                              <p className="text-[11px] md:text-xs font-bold mb-0.5 md:mb-1">{m.name}</p>
                              <p className={cn("text-[9px] md:text-[10px] font-medium opacity-40 truncate", mode === m.id && "text-white/50")}>{m.desc}</p>
                            </div>
                            {mode === m.id && <motion.div layoutId="activeDot" className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] mt-1" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 md:gap-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Maximize size={16} className="opacity-40" />
                        <h2 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] italic">Resolution Scaling</h2>
                      </div>
                    </div>
                    <div className="flex gap-2 p-1 bg-[#F5F5F4] rounded-xl md:rounded-2xl">
                      {['1', '2', '4'].map((s) => {
                        const multiplier = parseInt(s);
                        const targetWidth = info ? info.width * multiplier : 0;
                        const targetHeight = info ? info.height * multiplier : 0;
                        return (
                          <button
                            key={s}
                            onClick={() => setScale(s as Scale)}
                            className={cn(
                              "flex-1 py-1.5 md:py-3 text-[10px] md:text-xs font-black rounded-lg md:rounded-xl transition-all group/scale relative",
                              scale === s 
                                ? "bg-white text-[#1A1A1A] shadow-sm" 
                                : "opacity-40 hover:opacity-100"
                            )}
                          >
                            <span>{s}X</span>
                            {info && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#1A1A1A] text-white text-[8px] rounded opacity-0 group-hover/scale:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                {targetWidth} × {targetHeight}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 md:gap-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ChevronRight size={16} className="opacity-40" />
                        <h2 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] italic">Output Engine</h2>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {['png', 'jpg', 'tiff'].map((f) => (
                        <button
                          key={f}
                          onClick={() => setFormat(f as Format)}
                          className={cn(
                            "py-2 md:py-3 text-[9px] md:text-[10px] font-bold uppercase rounded-lg md:rounded-xl border transition-all",
                            format === f 
                              ? "bg-[#1A1A1A] border-[#1A1A1A] text-white" 
                              : "bg-white border-[#1A1A1A]/10 hover:border-[#1A1A1A]/20"
                          )}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    {format === 'jpg' && (
                      <div className="space-y-3 pt-1">
                        <div className="flex justify-between text-[9px] md:text-[10px] font-black opacity-30">
                          <span>QUALITY TARGET</span>
                          <span className="text-blue-600">{quality}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="10" 
                          max="100" 
                          value={quality}
                          onChange={(e) => setQuality(parseInt(e.target.value))}
                          className="w-full accent-[#1A1A1A] h-1 bg-[#F5F5F4] rounded-full appearance-none cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 md:p-8 border-t border-[#1A1A1A]/5 bg-white shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full", isProcessing ? "bg-blue-500 animate-pulse" : "bg-green-500")} />
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
                        {isProcessing ? 'Batch Processing' : 'Engine Ready'}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono opacity-20 uppercase">v2.4.0-stable</span>
                  </div>

                  <button 
                    disabled={!originalFile || isProcessing}
                    onClick={processImage}
                    className="w-full h-12 md:h-14 bg-[#1A1A1A] text-white rounded-xl md:rounded-2xl font-black text-xs md:text-sm tracking-widest uppercase disabled:opacity-20 flex items-center justify-center gap-3 shadow-xl md:shadow-2xl shadow-black/20 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {isProcessing ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <RefreshCw size={18} />
                    )}
                    <span>{isProcessing ? 'Computing...' : 'Re-Run Render'}</span>
                  </button>
                  
                  <div className="mt-4 flex items-start gap-3 p-3 bg-[#F5F5F4] rounded-xl border border-[#1A1A1A]/5">
                    <Info size={14} className="shrink-0 text-blue-500 mt-0.5" />
                    <p className="text-[10px] font-bold uppercase tracking-tight opacity-40 leading-tight">
                      Press <kbd className="bg-white px-1 py-0.5 rounded border border-black/5 mx-0.5">SPACE</kbd> to toggle Pan mode.
                    </p>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isInfoPanelOpen && info && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInfoPanelOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-[280px] bg-white rounded-[24px] shadow-2xl z-[101] overflow-hidden border border-[#1A1A1A]/10 p-8"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-10 h-10 bg-[#F5F5F4] rounded-full flex items-center justify-center">
                  <Activity size={18} className="text-blue-500" />
                </div>
                
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] italic">Meta Analysis</h3>
                  <p className="text-[8px] opacity-30 font-medium uppercase mt-0.5">Physical Buffer State</p>
                </div>

                <div className="w-full grid grid-cols-1 gap-y-4 pt-4 border-t border-[#1A1A1A]/5">
                  {[
                    { label: 'Resolution', value: `${info.width} × ${info.height}` },
                    { label: 'Format', value: info.format.toUpperCase() },
                    { label: 'Weight', value: info.size ? `${(info.size / 1024).toFixed(1)} KB` : 'UNKN' },
                    { label: 'Depth', value: info.depth || 'UCHAR' }
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col gap-0.5">
                      <span className="text-[7px] font-black uppercase opacity-20 tracking-widest">{item.label}</span>
                      <span className="text-xs font-mono font-bold uppercase tracking-tight">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setIsInfoPanelOpen(false)}
                  className="mt-4 w-full h-10 bg-[#1A1A1A] text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Close Analysis
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-[-1]" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />
    </div>
  );
}
