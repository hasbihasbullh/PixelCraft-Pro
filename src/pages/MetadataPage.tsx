import { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  Trash2, 
  Image as ImageIcon, 
  Info,
  Loader2,
  AlertCircle,
  Activity,
  ArrowLeft,
  Camera,
  MapPin,
  Calendar,
  Zap,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MetadataResponse {
  basic: {
    format: string;
    width: number;
    height: number;
    space: string;
    channels: number;
    depth: string;
    density: number;
    hasProfile: boolean;
    hasAlpha: boolean;
    size: number;
  };
  exif: any;
}

export default function MetadataPage() {
  const navigate = useNavigate();
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<MetadataResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractMetadata = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/metadata', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to extract metadata');
      }

      const result = await res.json();
      setMetadata(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }
    setError(null);
    setOriginalFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    extractMetadata(file);
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

  const renderMetadataSection = (title: string, icon: any, data: Record<string, any>) => {
    if (!data || Object.keys(data).length === 0) return null;
    
    return (
      <div className="bg-white rounded-2xl border border-[#1A1A1A]/5 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#F5F5F4] rounded-xl text-blue-600">
            {icon}
          </div>
          <h3 className="font-black uppercase tracking-widest text-[10px] italic">{title}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          {Object.entries(data).map(([key, value]) => {
            if (value === null || value === undefined || typeof value === 'object') return null;
            return (
              <div key={key} className="flex flex-col gap-0.5">
                <span className="text-[8px] font-black uppercase opacity-20 tracking-wider truncate">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="text-xs font-mono font-bold truncate" title={String(value)}>
                  {String(value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F8F7] text-[#1A1A1A] font-sans selection:bg-[#E5E5E5] flex flex-col transition-colors duration-300">
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
                <Zap size={18} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold tracking-tight text-sm leading-none">META INSPECTOR</h1>
                <p className="text-[10px] font-medium opacity-40 mt-1 uppercase tracking-wider hidden sm:block">EXIF & Forensic Tool</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-16">
        <div className="max-w-4xl mx-auto flex flex-col gap-8 md:gap-12">
          {!originalFile ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-video min-h-[300px] md:min-h-[400px] border-2 border-dashed border-[#1A1A1A]/10 rounded-[32px] flex flex-col items-center justify-center gap-6 hover:border-[#1A1A1A]/20 transition-all cursor-pointer bg-white group p-10 text-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-20 h-20 bg-[#F5F5F4] rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-[#1A1A1A]/5">
                <Upload size={32} className="text-[#1A1A1A]/40" />
              </div>
              <div>
                <h2 className="font-black text-2xl tracking-tighter uppercase italic">Ingest Forensic Sample</h2>
                <p className="text-sm opacity-40 mt-2 font-medium">Extract EXIF, GPS, and technical headers safely</p>
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
            <div className="flex flex-col gap-8 md:gap-12">
              {/* Sample Header */}
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/3 aspect-square rounded-3xl overflow-hidden bg-white border border-[#1A1A1A]/5 shadow-xl">
                  <img src={previewUrl!} alt="Sample" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col gap-6 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 italic">Target File</span>
                      <h2 className="text-xl md:text-2xl font-black truncate max-w-[300px]">{originalFile.name}</h2>
                    </div>
                    <button 
                      onClick={() => {
                        setOriginalFile(null);
                        setMetadata(null);
                      }}
                      className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded-2xl border border-[#1A1A1A]/5">
                      <span className="text-[8px] font-black opacity-20 uppercase tracking-widest">Weight</span>
                      <p className="font-mono font-bold">{(originalFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-[#1A1A1A]/5">
                      <span className="text-[8px] font-black opacity-20 uppercase tracking-widest">Format</span>
                      <p className="font-mono font-bold uppercase">{originalFile.type.split('/')[1]}</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-[#1A1A1A]/5 col-span-2 sm:col-span-1">
                      <span className="text-[8px] font-black opacity-20 uppercase tracking-widest">Resolution</span>
                      <p className="font-mono font-bold">{metadata?.basic.width || '?'} × {metadata?.basic.height || '?'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loader */}
              {isProcessing && (
                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                  <Loader2 className="animate-spin text-blue-600" size={40} />
                  <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Running Deep Analysis...</p>
                </div>
              )}

              {error && (
                <div className="p-6 bg-red-50 border border-red-100 rounded-[24px] flex gap-4 text-red-600 items-start">
                  <AlertCircle className="shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-sm uppercase">Forensic Failure</h4>
                    <p className="text-xs opacity-80 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Metadata Display */}
              {metadata && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-6 md:gap-8"
                >
                  {renderMetadataSection('Global Headers', <Activity size={18} />, metadata.basic)}
                  
                  {metadata.exif && (
                    <>
                      {renderMetadataSection('Image Data', <ImageIcon size={18} />, metadata.exif.image || {})}
                      {renderMetadataSection('Camera Settings', <Camera size={18} />, metadata.exif.exif || {})}
                      {renderMetadataSection('Digital Capture', <Calendar size={18} />, {
                        CreateDate: metadata.exif.exif?.DateTimeOriginal || metadata.exif.image?.ModifyDate,
                        Software: metadata.exif.image?.Software
                      })}
                      {renderMetadataSection('Geo Location', <MapPin size={18} />, metadata.exif.gps || {})}
                      {renderMetadataSection('Interoperability', <Globe size={18} />, metadata.exif.interoperability || {})}
                    </>
                  )}
                  
                  {!metadata.exif && !isProcessing && (
                    <div className="p-10 bg-[#F5F5F4] rounded-[32px] border border-[#1A1A1A]/5 text-center flex flex-col items-center">
                      <Info size={32} className="opacity-10 mb-4" />
                      <h4 className="font-black uppercase italic tracking-widest opacity-30 text-sm">No EXIF Record Found</h4>
                      <p className="text-[10px] font-bold opacity-20 mt-2 max-w-[200px]">The file might have been stripped of metadata or does not contain forensic headers.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.01] z-[-1]" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />
    </div>
  );
}
