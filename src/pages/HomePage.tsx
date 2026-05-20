import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, 
  ArrowRight, 
  Cpu, 
  FastForward, 
  ShieldCheck, 
  Maximize,
  Sparkles,
  Zap,
  Palette
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F8F7] text-[#1A1A1A] font-sans selection:bg-[#E5E5E5] overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#1A1A1A]/5">
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-[#1A1A1A] rounded flex items-center justify-center shadow-lg shadow-black/10">
              <Layers size={20} className="text-white" />
            </div>
            <span className="font-black tracking-tighter text-lg md:text-xl uppercase italic">PixelCraft Pro</span>
          </div>
          
          <div className="hidden sm:flex items-center gap-4">
            <button 
              onClick={() => navigate('/process')}
              className="px-6 py-2.5 border border-[#1A1A1A]/10 text-[#1A1A1A] rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#F5F5F4] transition-all flex items-center gap-2"
            >
              <Layers size={14} /> Image Studio
            </button>
            <button 
              onClick={() => navigate('/analyzer')}
              className="px-6 py-2.5 border border-[#1A1A1A]/10 text-[#1A1A1A] rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#F5F5F4] transition-all flex items-center gap-2"
            >
              <Palette size={14} /> Color Profiler
            </button>
            <button 
              onClick={() => navigate('/metadata')}
              className="px-6 py-2.5 bg-[#1A1A1A] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 flex items-center gap-2"
            >
              <Zap size={14} /> Meta Inspector
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-40 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100 mb-8"
            >
              <Sparkles size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Next-Gen Image Engine 2.4.0</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.9] mb-8"
            >
              Precision <br />
              <span className="text-blue-600">Graphics</span> <br />
              Processing.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-2xl text-lg md:text-xl opacity-40 font-medium mb-12 leading-tight"
            >
              Professional-grade image processing, scale-up, and format conversion powered by high-performance Lanczos3 kernels. Zero artifacts. Absolute control.
            </motion.p>
            
          </div>
        </div>

        {/* Floating background elements */}
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 -z-10" />
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-[#1A1A1A]/5 rounded-full blur-3xl -z-10" />
      </section>

      {/* Feature Grid */}
      <section className="px-6 py-20 bg-white border-y border-[#1A1A1A]/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onClick={() => navigate('/process')}
              className="group cursor-pointer flex flex-col gap-6 p-8 rounded-[32px] bg-[#F8F8F7] border border-[#1A1A1A]/5 hover:border-blue-500/20 hover:bg-blue-50/30 transition-all"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Layers className="text-blue-600" size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-2 italic flex items-center gap-2">Image Studio <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" /></h3>
                <p className="opacity-40 font-medium leading-tight">Advanced rendering suite for grayscale, upscaling, and forensic color depth processing.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              onClick={() => navigate('/analyzer')}
              className="group cursor-pointer flex flex-col gap-6 p-8 rounded-[32px] bg-[#F8F8F7] border border-[#1A1A1A]/5 hover:border-blue-500/20 hover:bg-blue-50/30 transition-all"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Palette className="text-blue-600" size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-2 italic flex items-center gap-2">Color Profiler <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" /></h3>
                <p className="opacity-40 font-medium leading-tight">AI-driven chromatic clustering. Analysis of dominant tones, HEX, RGB, HSV, LCH, and CIELAB space.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              onClick={() => navigate('/metadata')}
              className="group cursor-pointer flex flex-col gap-6 p-8 rounded-[32px] bg-[#F8F8F7] border border-[#1A1A1A]/5 hover:border-blue-500/20 hover:bg-blue-50/30 transition-all"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Zap className="text-blue-600" size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-2 italic flex items-center gap-2">Meta Inspector <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" /></h3>
                <p className="opacity-40 font-medium leading-tight">Extract hidden EXIF headers, GPS coordinates, and camera forensics from any image sample.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social / Stats */}
      <section className="px-6 py-20 md:py-40">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase italic mb-8">Trusted by Digital Artisans.</h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-30 mt-12">
            <div className="flex flex-col">
              <span className="text-3xl md:text-4xl font-black tracking-tighter">50K+</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Renders</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl md:text-4xl font-black tracking-tighter">0.3s</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Latency</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl md:text-4xl font-black tracking-tighter">100%</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Privacy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 md:py-20 border-t border-[#1A1A1A]/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 grayscale opacity-40">
            <Layers size={20} />
            <span className="font-black tracking-tighter text-xl uppercase italic">PixelCraft Pro</span>
          </div>
          <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest opacity-20">
            <a href="#" className="hover:opacity-100 transition-opacity">Privacy</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Terms</a>
            <a href="#" className="hover:opacity-100 transition-opacity">GitHub</a>
          </div>
          <p className="text-[10px] font-mono opacity-20 uppercase tracking-widest">© 2026 PixelCraft Pro. Ver 2.4.0</p>
        </div>
      </footer>

      {/* Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.01] z-[-1]" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />
    </div>
  );
}
