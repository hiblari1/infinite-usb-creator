import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import JSZip from 'jszip';
import { 
  Usb, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Globe, 
  ArrowRight,
  Download,
  Github,
  Twitter
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-m3-primary selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-m3-primary rounded-xl flex items-center justify-center shadow-lg shadow-m3-primary/20">
              <Usb size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">Infinite USB</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#tech" className="hover:text-white transition-colors">Technology</a>
            <a href="#download" className="hover:text-white transition-colors">Download</a>
          </div>

          <Link 
            to="/app" 
            className="bg-white text-black px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-m3-primary hover:text-white transition-all duration-500"
          >
            Launch Web App
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-[12vw] md:text-[8vw] font-black leading-[0.85] tracking-tighter uppercase mb-8">
              The Future of <br />
              <span className="text-m3-primary italic">Hardware</span> Flashing.
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
              <p className="text-xl md:text-2xl text-white/40 leading-relaxed max-w-xl">
                Infinite USB is a high-performance, native-integrated utility for creating bootable drives with surgical precision. Built for Arch Linux, macOS, and Windows.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/app" 
                  className="group bg-m3-primary text-white px-8 py-5 rounded-2xl font-bold text-lg flex items-center gap-3 hover:scale-105 transition-all duration-500 shadow-2xl shadow-m3-primary/40"
                >
                  Get Started Now
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <a 
                  href="#download" 
                  className="bg-white/5 border border-white/10 text-white px-8 py-5 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all duration-500"
                >
                  Download Native
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-m3-primary/10 to-transparent blur-3xl -z-10" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-m3-secondary/10 rounded-full blur-3xl -z-10" />
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 bg-white/2">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <span className="text-m3-primary font-bold uppercase tracking-[0.3em] text-sm">Capabilities</span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mt-4">Engineered for <br />Reliability.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="text-m3-primary" size={32} />}
              title="Turbo Flash"
              description="Optimized block-level writing algorithms that saturate your USB 3.2 bus speeds."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-m3-secondary" size={32} />}
              title="Secure Boot"
              description="Full support for UEFI Secure Boot signing and verification of ISO integrity."
            />
            <FeatureCard 
              icon={<Globe className="text-m3-tertiary" size={32} />}
              title="Multi-Platform"
              description="Native builds for Arch Linux (AppImage), macOS (Universal), and Windows."
            />
          </div>
        </div>
      </section>

      {/* Native Bridge Section */}
      <section id="tech" className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <div>
            <span className="text-m3-secondary font-bold uppercase tracking-[0.3em] text-sm">Architecture</span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mt-4 mb-8">The Native <br />Bridge.</h2>
            <p className="text-xl text-white/40 leading-relaxed mb-8">
              Unlike standard web utilities, Infinite USB uses a high-performance bridge to communicate directly with your system's kernel. This allows for raw block-level access and surgical precision during the flashing process.
            </p>
            <ul className="space-y-4 text-lg font-bold">
              <li className="flex items-center gap-3 text-m3-primary"><ShieldCheck size={20} /> Kernel-level device locking</li>
              <li className="flex items-center gap-3 text-m3-secondary"><Cpu size={20} /> DMA-accelerated data streaming</li>
              <li className="flex items-center gap-3 text-m3-tertiary"><Zap size={20} /> Real-time hardware telemetry</li>
            </ul>
          </div>
          <div className="bg-white/5 rounded-[3rem] p-8 border border-white/10 relative group">
            <div className="aspect-square bg-black rounded-[2rem] overflow-hidden border border-white/5 p-6 font-mono text-xs text-m3-primary/60">
              <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <span className="ml-2 opacity-50 uppercase tracking-widest">native-bridge.log</span>
              </div>
              <div className="space-y-2">
                <p className="text-white/80">{`> systemctl status infinite-usb.service`}</p>
                <p className="text-green-400">{`● infinite-usb.service - Native Hardware Bridge`}</p>
                <p>{`  Loaded: loaded (/usr/lib/systemd/system/...)`}</p>
                <p>{`  Active: active (running) since Wed 2026-03-04`}</p>
                <p className="mt-4 text-white/80">{`> lsblk --output NAME,SIZE,TYPE,MOUNTPOINT`}</p>
                <p>{`  sdb      32G  disk`}</p>
                <p className="text-m3-primary font-bold">{`  └─sdb1   32G  part  /run/media/infinite`}</p>
                <p className="mt-4 text-white/80">{`> dd if=/tmp/arch.iso of=/dev/sdb status=progress`}</p>
                <p className="animate-pulse">{`  14.2 GB / 32.0 GB [==============>      ] 44%`}</p>
              </div>
            </div>
            {/* Decorative Glow */}
            <div className="absolute inset-0 bg-m3-primary/20 blur-[100px] -z-10 group-hover:bg-m3-primary/30 transition-all duration-700" />
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-32 px-6">
        <div className="max-w-7xl mx-auto bg-m3-primary rounded-[3rem] p-12 md:p-24 overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase mb-8 leading-none">
              Ready to <br />Go Native?
            </h2>
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mb-12">
              Download the standalone desktop application or grab the source code to build it yourself on Arch Linux.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
              <DownloadButton 
                platform="Arch Linux" 
                format="AppImage" 
                icon={<Cpu size={20} />}
              />
              <DownloadButton 
                platform="macOS" 
                format="Universal DMG" 
                icon={<AppleIcon />}
              />
              <DownloadButton 
                platform="Windows" 
                format="Setup EXE" 
                icon={<MonitorIcon />}
              />
            </div>

            <div className="bg-black/20 p-8 rounded-[2rem] border border-white/10">
              <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-3">
                <Github size={24} /> Build from Source (Arch Linux)
              </h3>
              <p className="text-white/60 mb-6">
                The AppImage above is a placeholder. To build the real native binary on Arch, follow these steps:
              </p>
              <div className="space-y-4">
                <button 
                  onClick={async () => {
                    const zip = new JSZip();
                    // ... (keeping existing zip logic)
                    zip.file("package.json", JSON.stringify({
                      name: "infinite-usb",
                      version: "1.0.0",
                      type: "module",
                      scripts: {
                        "build": "vite build",
                        "tauri": "tauri",
                        "build:appimage": "tauri build --bundles appimage"
                      },
                      dependencies: {
                        "express": "^4.21.2",
                        "lucide-react": "^0.460.0",
                        "react": "^18.3.1",
                        "react-dom": "^18.3.1"
                      },
                      devDependencies: {
                        "@tauri-apps/cli": "^2.1.0",
                        "vite": "^5.4.10"
                      }
                    }, null, 2));
                    zip.file("src-tauri/tauri.conf.json", JSON.stringify({
                      "build": {
                        "beforeBuildCommand": "npm run build",
                        "beforeDevCommand": "npm run dev",
                        "devPath": "http://localhost:1420",
                        "distDir": "../dist"
                      },
                      "package": {
                        "productName": "infinite-usb",
                        "version": "1.0.0"
                      },
                      "tauri": {
                        "allowlist": { "all": true },
                        "bundle": {
                          "active": true,
                          "targets": ["appimage"],
                          "identifier": "com.infinite.usb",
                          "icon": ["icons/32x32.png"]
                        },
                        "window": [{ "title": "Infinite USB", "width": 800, "height": 600 }]
                      }
                    }, null, 2));
                    zip.file("README.md", "# Infinite USB Source\n\n1. yay -S tauri-cli\n2. npm install\n3. npm run build:appimage");
                    
                    const content = await zip.generateAsync({ type: "blob" });
                    const url = window.URL.createObjectURL(content);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = "infinite-usb-source.zip";
                    a.click();
                  }}
                  className="w-full bg-m3-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
                >
                  <Download size={20} /> Download Source Code (.zip)
                </button>

                <div className="bg-black/40 p-4 rounded-xl font-mono text-sm text-m3-primary">
                  <p className="opacity-50 mb-2"># 1. Install Tauri CLI via AUR</p>
                  <p className="text-white">yay -S tauri-cli</p>
                  <p className="opacity-50 my-2"># 2. Extract ZIP and enter folder</p>
                  <p className="text-white">cd infinite-usb-source</p>
                  <p className="opacity-50 my-2"># 3. Build</p>
                  <p className="text-white">npm install && npm run build:appimage</p>
                </div>
                <p className="text-xs font-bold text-m3-secondary uppercase tracking-widest">
                  🚀 Pro Tip: Installing 'tauri-cli' via yay fixes the "command not found" error permanently.
                </p>
              </div>
            </div>
          </div>

          {/* Abstract Shape */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <Usb size={24} className="text-m3-primary" />
            <span className="text-xl font-black tracking-tighter uppercase">Infinite USB</span>
          </div>
          
          <div className="flex gap-8 text-white/40">
            <a href="#" className="hover:text-white transition-colors"><Github size={20} /></a>
            <a href="#" className="hover:text-white transition-colors"><Twitter size={20} /></a>
          </div>

          <p className="text-sm text-white/20 font-bold uppercase tracking-widest">
            © 2026 INFINITE HARDWARE LABS
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-10 rounded-[2rem] bg-white/5 border border-white/10 hover:border-m3-primary/50 transition-all duration-500 group">
      <div className="mb-8 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-2xl font-black uppercase tracking-tight mb-4">{title}</h3>
      <p className="text-white/40 leading-relaxed">{description}</p>
    </div>
  );
}

function DownloadButton({ platform, format, icon }: { platform: string, format: string, icon: React.ReactNode }) {
  const [showTooltip, setShowTooltip] = React.useState(false);

  const handleDownload = () => {
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 5000);
    
    // Still trigger the placeholder download so they see the file structure
    const dummyContent = "# Infinite USB Native Prototype\n# To build the real binary, run: npm run build:appimage\n\nThis is a placeholder for the compiled native artifact.";
    const blob = new Blob([dummyContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = platform.includes("Arch") ? "infinite-usb.AppImage" : "infinite-usb.exe";
    a.click();
  };

  return (
    <div className="relative">
      <button 
        onClick={handleDownload}
        className="w-full flex items-center gap-4 bg-black/20 hover:bg-black/40 p-6 rounded-2xl transition-all duration-300 text-left border border-white/5 hover:border-white/20 active:scale-95"
      >
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest opacity-50">{format}</div>
          <div className="text-lg font-black uppercase tracking-tight">{platform}</div>
        </div>
      </button>
      
      <AnimatePresence>
        {showTooltip && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-full left-0 right-0 mb-4 p-4 bg-white text-black rounded-xl text-xs font-bold shadow-2xl z-50"
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5"><Zap size={14} /></div>
              <p>This is a web preview. To get the real {format}, build the source code locally using: <code className="bg-black/10 px-1 rounded">npm run build:appimage</code></p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 256 315" fill="currentColor">
      <path d="M213.803 167.03c.442 47.58 41.74 63.413 42.147 63.615-.338 1.116-6.591 22.563-21.69 44.613-13.042 19.056-26.56 38.016-47.88 38.407-21.013.396-27.786-12.416-51.825-12.416-24.033 0-31.545 12.015-51.43 12.811-20.264.79-35.83-20.645-48.96-39.59-26.86-38.743-47.377-109.465-19.745-157.433 13.728-23.82 38.25-38.917 64.698-39.305 20.264-.396 39.37 13.625 51.825 13.625s35.404-16.815 59.83-14.34c10.21.425 38.917 4.135 57.35 31.188-1.488.925-34.21 19.95-33.82 59.035zM154.003 44.14c11.057-13.39 18.5-32.003 16.46-50.625-15.987.645-35.33 10.65-46.78 23.99-10.25 11.83-19.22 30.73-16.82 48.95 17.84 1.38 36.08-8.92 47.14-22.315z" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}
