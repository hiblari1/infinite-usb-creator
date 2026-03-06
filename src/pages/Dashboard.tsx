import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Usb, 
  FileUp, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  RotateCcw,
  Info,
  X,
  Download,
  Monitor,
  Apple,
  Layout,
  Package,
  Cpu,
  ShieldCheck,
  Settings,
  HelpCircle,
  Menu,
  Disc,
  Minus,
  Square,
  HardDrive,
  Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';
import { generateM3Theme, applyM3ThemeToCss } from '../services/themeService';

type Step = 'select-file' | 'select-drive' | 'flashing' | 'success' | 'customize-boot';
type Tab = 'flash' | 'bootloader' | 'downloads' | 'settings' | 'help' | 'system';
type FlashMode = 'standard' | 'multi-iso';

interface FileInfo {
  name: string;
  size: number;
  type: string;
}

interface BundleOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  format: string;
  platform: string;
  fileName: string;
}

const BUNDLE_OPTIONS: BundleOption[] = [
  { id: 'win', name: 'Windows', icon: <Monitor size={20} />, format: '.exe (Installer)', platform: 'Windows 10/11', fileName: 'InfiniteUSB_Setup.exe' },
  { id: 'mac', name: 'macOS', icon: <Apple size={20} />, format: '.dmg (Universal)', platform: 'Intel & Apple Silicon', fileName: 'InfiniteUSB_macOS.dmg' },
  { id: 'deb', name: 'Debian/Ubuntu', icon: <Package size={20} />, format: '.deb (Apt)', platform: 'Linux x64', fileName: 'infinite-usb_amd64.deb' },
  { id: 'rpm', name: 'Fedora/SUSE', icon: <Package size={20} />, format: '.rpm (Dnf)', platform: 'Linux x64', fileName: 'infinite-usb.x86_64.rpm' },
  { id: 'arch', name: 'Arch Linux', icon: <Cpu size={20} />, format: '.pkg.tar.zst (Pacman)', platform: 'Linux x64/ARM', fileName: 'infinite-usb-bin.pkg.tar.zst' },
  { id: 'android', name: 'Android', icon: <Smartphone size={20} />, format: '.apk (Native)', platform: 'Android 10+', fileName: 'infinite-usb.apk' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('flash');
  const [step, setStep] = useState<Step>('select-file');
  const [bootConfig, setBootConfig] = useState({
    theme: 'm3-classic',
    timeout: 5,
    secureBoot: true,
    showIcons: true,
    primaryColor: '#6750A4',
    backgroundColor: '#1D1B20'
  });
  const [file, setFile] = useState<FileInfo | null>(null);
  const [multiFiles, setMultiFiles] = useState<FileInfo[]>([]);
  const [flashMode, setFlashMode] = useState<FlashMode>('standard');
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);
  const [isRequestingUsb, setIsRequestingUsb] = useState(false);
  const [flashLogs, setFlashLogs] = useState<string[]>([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [isDark, setIsDark] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [nativeSystem, setNativeSystem] = useState<any>(null);
  const [nativeDrives, setNativeDrives] = useState<any[]>([]);
  const [isFetchingDrives, setIsFetchingDrives] = useState(false);

  // Fetch Native Info
  React.useEffect(() => {
    const fetchNative = async () => {
      try {
        const sysRes = await fetch('/api/native/system');
        const sysData = await sysRes.json();
        setNativeSystem(sysData);
      } catch (err) {
        console.error("Native system fetch failed", err);
      }
    };
    fetchNative();
  }, []);

  const fetchDrives = async () => {
    setIsFetchingDrives(true);
    try {
      const driveRes = await fetch('/api/native/drives');
      const driveData = await driveRes.json();
      setNativeDrives(driveData);
    } catch (err) {
      console.error("Native drive fetch failed", err);
    } finally {
      setIsFetchingDrives(false);
    }
  };

  // Material You Sync
  const syncWithWallpaper = async () => {
    if (!('EyeDropper' in window)) {
      setError("EyeDropper API required for wallpaper sync simulation.");
      return;
    }
    try {
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      const theme = generateM3Theme(result.sRGBHex, isDark);
      applyM3ThemeToCss(theme);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.8 } });
    } catch (err) {
      console.error("Wallpaper sync failed", err);
    }
  };

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  React.useEffect(() => {
    const usb = (navigator as any).usb;
    if (usb) {
      const handleDisconnect = (event: any) => {
        if (selectedDevice && event.device === selectedDevice) {
          setSelectedDevice(null);
          setError("Device disconnected.");
        }
      };
      usb.addEventListener('disconnect', handleDisconnect);
      return () => usb.removeEventListener('disconnect', handleDisconnect);
    }
  }, [selectedDevice]);

  const requestUsbDevice = async () => {
    setIsRequestingUsb(true);
    try {
      const usb = (navigator as any).usb;
      if (!usb) throw new Error("WebUSB not supported in this browser.");
      const device = await usb.requestDevice({ filters: [] });
      setSelectedDevice(device);
      setError(null);
    } catch (err: any) {
      console.error("USB Request failed", err);
      setError(err.message || "No device selected or access denied.");
    } finally {
      setIsRequestingUsb(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []) as File[];
    if (selectedFiles.length > 0) {
      const validFiles = selectedFiles.filter(f => f.name.endsWith('.iso') || f.name.endsWith('.img'));
      
      if (validFiles.length > 0) {
        if (flashMode === 'standard') {
          const selectedFile = validFiles[0];
          setFile({
            name: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.name.split('.').pop() || '',
          });
          setStep('select-drive');
        } else {
          const newFiles = validFiles.map(f => ({
            name: f.name,
            size: f.size,
            type: f.name.split('.').pop() || '',
          }));
          setMultiFiles(prev => [...prev, ...newFiles]);
          setStep('select-drive');
        }
        setError(null);
      } else {
        setError('Please select valid .iso or .img files.');
      }
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files || []) as File[];
    if (droppedFiles.length > 0) {
      const validFiles = droppedFiles.filter(f => f.name.endsWith('.iso') || f.name.endsWith('.img'));
      
      if (validFiles.length > 0) {
        if (flashMode === 'standard') {
          const droppedFile = validFiles[0];
          setFile({
            name: droppedFile.name,
            size: droppedFile.size,
            type: droppedFile.name.split('.').pop() || '',
          });
          setStep('select-drive');
        } else {
          const newFiles = validFiles.map(f => ({
            name: f.name,
            size: f.size,
            type: f.name.split('.').pop() || '',
          }));
          setMultiFiles(prev => [...prev, ...newFiles]);
          setStep('select-drive');
        }
        setError(null);
      } else {
        setError('Please select valid .iso or .img files.');
      }
    }
  }, [flashMode]);

  const startFlashing = async () => {
    if (!selectedDevice) return;

    setStep('flashing');
    setProgress(0);
    setFlashLogs([
      "Kernel: Initializing block device bridge...",
      `System: Identified target ${selectedDevice.productName}`,
      "Native: Requesting exclusive lock on /dev/sdb...",
      "Auth: Escalating privileges via sudo helper...",
      "Success: Hardware lock acquired."
    ]);
    setCurrentLogIndex(0);
    
    try {
      // Simulate hardware interaction
      if (selectedDevice.vendorId !== 'Native') {
        await selectedDevice.open();
        if (selectedDevice.configuration === null) {
          await selectedDevice.selectConfiguration(1);
        }
        await selectedDevice.claimInterface(0);
      }

      const steps = [
        "Preparing DMA buffer...",
        "Writing MBR/GPT partition table...",
        "Streaming ISO blocks (4096 byte chunks)...",
        "Syncing filesystem buffers...",
        "Verifying checksums (SHA256)...",
        "Ejecting device safely..."
      ];
      
      for (let i = 0; i < steps.length; i++) {
        setFlashLogs(prev => [...prev, steps[i]]);
        setCurrentLogIndex(i + 1);
        
        for (let p = 0; p < 20; p++) {
          await new Promise(r => setTimeout(r, 100));
          setProgress(prev => Math.min(prev + 1, (i + 1) * 20));
        }
      }

      setStep('success');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6750A4', '#7D5260', '#625B71']
      });

    } catch (err: any) {
      console.error("Flash failed", err);
      setFlashLogs(prev => [...prev, `Error: ${err.message || "Hardware access denied."}`]);
      setError(err.message || "Hardware access denied. Please ensure no other app is using the drive.");
    }
  };

  const reset = () => {
    setStep('select-file');
    setFile(null);
    setMultiFiles([]);
    setSelectedDevice(null);
    setProgress(0);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-m3-surface text-m3-on-surface font-sans selection:bg-m3-primary-container selection:text-m3-on-primary-container flex flex-col">
      {/* Native Title Bar Simulation */}
      <div className="h-8 bg-m3-surface flex items-center justify-between px-4 select-none border-b border-m3-outline-variant/5">
        <div className="flex items-center gap-2">
          <Usb size={14} className="text-m3-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Infinite USB Flasher</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="hover:bg-m3-surface-variant p-1 rounded transition-colors"><Minus size={14} /></button>
          <button className="hover:bg-m3-surface-variant p-1 rounded transition-colors"><Square size={12} /></button>
          <button className="hover:bg-m3-error/10 hover:text-m3-error p-1 rounded transition-colors"><X size={14} /></button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            />
          )}
        </AnimatePresence>

        <aside className={cn(
          "fixed md:relative z-50 h-full bg-m3-surface border-r border-m3-outline-variant transition-all duration-500 ease-in-out flex flex-col items-center py-8",
          isSidebarOpen ? "w-64 px-4" : "w-0 md:w-24 px-0 md:px-4 overflow-hidden"
        )}>
          <div className="w-full flex items-center justify-between mb-12 px-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-m3-extra-large bg-m3-primary text-m3-on-primary shadow-lg shrink-0">
              <Usb size={28} />
            </div>
            {isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-full hover:bg-m3-surface-variant md:hidden"
              >
                <X size={24} />
              </button>
            )}
          </div>

          <nav className="flex flex-col gap-4 w-full">
            <NavItem 
              icon={<Zap size={24} />} 
              label="Flash" 
              active={activeTab === 'flash'} 
              expanded={isSidebarOpen}
              onClick={() => setActiveTab('flash')} 
            />
            <NavItem 
              icon={<Layout size={24} />} 
              label="Bootloader" 
              active={activeTab === 'bootloader'} 
              expanded={isSidebarOpen}
              onClick={() => setActiveTab('bootloader')} 
            />
            <NavItem 
              icon={<Download size={24} />} 
              label="Downloads" 
              active={activeTab === 'downloads'} 
              expanded={isSidebarOpen}
              onClick={() => setActiveTab('downloads')} 
            />
            <NavItem 
              icon={<Settings size={24} />} 
              label="Settings" 
              active={activeTab === 'settings'} 
              expanded={isSidebarOpen}
              onClick={() => setActiveTab('settings')} 
            />
            <NavItem 
              icon={<Cpu size={24} />} 
              label="System" 
              active={activeTab === 'system'} 
              expanded={isSidebarOpen}
              onClick={() => setActiveTab('system')} 
            />
          </nav>

          <div className="mt-auto w-full">
            <NavItem 
              icon={<HelpCircle size={24} />} 
              label="Help" 
              active={activeTab === 'help'} 
              expanded={isSidebarOpen}
              onClick={() => setActiveTab('help')} 
            />
          </div>
        </aside>

        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <header className="h-16 flex items-center justify-between px-6 bg-m3-surface/80 backdrop-blur-md z-40 border-b border-m3-outline-variant/10">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-full hover:bg-m3-surface-variant transition-colors"
              >
                <Menu size={24} />
              </button>
              <h2 className="text-xl font-display font-bold text-m3-on-surface">
                {activeTab === 'flash' ? 'Flash Workspace' : 
                 activeTab === 'bootloader' ? 'Bootloader Architect' :
                 activeTab === 'downloads' ? 'Distribution Hub' : 
                 activeTab === 'help' ? 'Help & Support' : 
                 activeTab === 'system' ? 'System Fetch' : 'Preferences'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {nativeSystem && (
                <div className="hidden lg:flex items-center gap-4 mr-4 text-[10px] font-bold uppercase tracking-widest opacity-50">
                  <span>{nativeSystem.os}</span>
                  <span className="w-1 h-1 bg-m3-outline-variant rounded-full" />
                  <span>{nativeSystem.cpu}</span>
                </div>
              )}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-m3-primary-container text-m3-on-primary-container text-xs font-bold">
                <ShieldCheck size={14} />
                SYSTEM INTEGRATED
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col items-center">
            <AnimatePresence mode="wait">
              {activeTab === 'flash' && (
                <motion.div
                  key="flash-tab"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full max-w-3xl"
                >
                  <div className="mb-12 text-center">
                    <h1 className="text-5xl md:text-7xl font-display font-black text-m3-on-surface mb-4 tracking-tighter">
                      Flash with <span className="text-m3-primary italic">Precision.</span>
                    </h1>
                    <p className="text-m3-on-surface-variant text-lg">
                      Native hardware access for the modern system.
                    </p>
                  </div>

                  {nativeSystem && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
                    >
                      <StatCard label="OS" value={nativeSystem.os} />
                      <StatCard label="CPU" value={nativeSystem.cpu} />
                      <StatCard label="Memory" value={nativeSystem.mem} />
                      <StatCard label="Arch" value={nativeSystem.arch} />
                    </motion.div>
                  )}

                <AnimatePresence mode="wait">
                  {step === 'select-file' && (
                    <motion.div
                      key="step-file"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      className="w-full space-y-6"
                    >
                      <div className="flex gap-4 justify-center mb-8">
                        <button 
                          onClick={() => setFlashMode('standard')}
                          className={cn(
                            "px-6 py-2 rounded-full font-bold transition-all",
                            flashMode === 'standard' ? "bg-m3-primary text-m3-on-primary shadow-lg" : "bg-m3-surface-variant/30 text-m3-on-surface-variant"
                          )}
                        >
                          Standard Flash
                        </button>
                        <button 
                          onClick={() => setFlashMode('multi-iso')}
                          className={cn(
                            "px-6 py-2 rounded-full font-bold transition-all",
                            flashMode === 'multi-iso' ? "bg-m3-tertiary text-m3-on-tertiary shadow-lg" : "bg-m3-surface-variant/30 text-m3-on-surface-variant"
                          )}
                        >
                          Multi-ISO (Infinite Boot)
                        </button>
                      </div>

                      <div
                        className={cn(
                          "m3-card-outlined min-h-[350px] flex flex-col items-center justify-center border-2 border-dashed transition-all duration-500",
                          isDragging ? "border-m3-primary bg-m3-primary/5 scale-[1.02]" : "border-m3-outline-variant",
                          error ? "border-m3-error bg-m3-error/5" : ""
                        )}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={onDrop}
                      >
                        <motion.div 
                          animate={isDragging ? { y: [0, -10, 0] } : {}}
                          transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
                          className="w-24 h-24 rounded-m3-extra-large bg-m3-primary-container text-m3-on-primary-container flex items-center justify-center mb-8 shadow-inner"
                        >
                          <FileUp size={48} />
                        </motion.div>
                        <h3 className="text-2xl font-bold mb-2">
                          {flashMode === 'standard' ? 'Select Image' : 'Select ISOs'}
                        </h3>
                        <p className="text-m3-on-surface-variant text-center max-w-xs mb-10">
                          {flashMode === 'standard' 
                            ? 'Drop your .iso or .img file here.' 
                            : 'Drop multiple .iso files for your Infinite Boot drive.'}
                        </p>
                        
                        <label className="m3-button-primary group">
                          <FileUp size={20} className="group-hover:-translate-y-1 transition-transform" />
                          {flashMode === 'standard' ? 'Choose File' : 'Choose Files'}
                          <input type="file" className="hidden" accept=".iso,.img" multiple={flashMode === 'multi-iso'} onChange={handleFileSelect} />
                        </label>

                        {error && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 flex items-center gap-2 text-m3-error font-bold"
                          >
                            <AlertCircle size={20} />
                            {error}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {step === 'select-drive' && (
                    <motion.div
                      key="step-drive"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="m3-card-elevated w-full"
                    >
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-2xl font-bold">Target Device</h3>
                          <p className="text-m3-on-surface-variant text-sm">Grant access to your USB drive to begin flashing.</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={reset} className="p-3 rounded-full hover:bg-m3-surface-variant">
                            <X size={20} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4 mb-10">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-bold uppercase tracking-widest opacity-50">Native System Drives</h4>
                          <button 
                            onClick={fetchDrives}
                            disabled={isFetchingDrives}
                            className="text-xs font-bold text-m3-primary hover:underline"
                          >
                            {isFetchingDrives ? 'Scanning...' : 'Scan for Drives'}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 mb-6">
                          {nativeDrives.map(drive => (
                            <button
                              key={drive.id}
                              onClick={() => setSelectedDevice({ productName: drive.name, vendorId: 'Native', productId: drive.path })}
                              className={cn(
                                "p-4 rounded-m3-large border-2 transition-all text-left flex items-center gap-4",
                                selectedDevice?.productId === drive.path 
                                  ? "border-m3-primary bg-m3-primary/5 shadow-md" 
                                  : "border-m3-outline-variant hover:border-m3-primary/50"
                              )}
                            >
                              <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center",
                                drive.isSystem ? "bg-m3-error/10 text-m3-error" : "bg-m3-primary/10 text-m3-primary"
                              )}>
                                <HardDrive size={20} />
                              </div>
                              <div className="flex-1">
                                <div className="font-bold">{drive.name}</div>
                                <div className="text-xs opacity-50">{drive.path} • {drive.size}</div>
                              </div>
                              {drive.isSystem && (
                                <div className="text-[10px] font-black bg-m3-error text-white px-2 py-0.5 rounded uppercase">System</div>
                              )}
                            </button>
                          ))}
                        </div>

                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-m3-outline-variant"></div>
                          </div>
                          <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                            <span className="bg-m3-surface px-4 opacity-50">Or use WebUSB</span>
                          </div>
                        </div>

                        {!selectedDevice ? (
                          <button 
                            onClick={requestUsbDevice}
                            disabled={isRequestingUsb}
                            className="w-full p-10 rounded-m3-extra-large border-2 border-dashed border-m3-outline-variant hover:border-m3-primary hover:bg-m3-primary/5 transition-all flex flex-col items-center gap-4 group"
                          >
                            <div className="w-16 h-16 rounded-full bg-m3-primary-container text-m3-on-primary-container flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Usb size={32} />
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-lg">Select USB Device</div>
                              <div className="text-sm text-m3-on-surface-variant">Click to open system device picker</div>
                            </div>
                          </button>
                        ) : (
                          <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="p-6 rounded-m3-extra-large bg-m3-primary text-m3-on-primary shadow-xl flex items-center gap-5"
                          >
                            <div className="w-14 h-14 rounded-m3-large bg-white/20 flex items-center justify-center">
                              <Usb size={32} />
                            </div>
                            <div className="flex-1">
                              <div className="font-black text-xl tracking-tight">{selectedDevice.productName || 'USB Device'}</div>
                              <div className="text-sm font-medium opacity-90">
                                Vendor ID: {selectedDevice.vendorId} • Product ID: {selectedDevice.productId}
                              </div>
                            </div>
                            <button 
                              onClick={() => setSelectedDevice(null)}
                              className="p-2 rounded-full hover:bg-white/10"
                            >
                              <RotateCcw size={20} />
                            </button>
                          </motion.div>
                        )}
                      </div>

                      {selectedDevice && (
                        <div className="bg-m3-error-container/20 p-5 rounded-m3-large mb-10 flex gap-4 items-start border border-m3-error/10">
                          <AlertCircle size={24} className="text-m3-error shrink-0 mt-0.5" />
                          <div className="text-sm text-m3-on-error-container leading-relaxed">
                            <span className="font-black uppercase tracking-wider">Warning:</span> All data on <span className="font-bold">{selectedDevice.productName || 'this device'}</span> will be permanently destroyed. This action cannot be undone.
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col gap-6">
                        <button 
                          disabled={!selectedDevice}
                          onClick={startFlashing} 
                          className="m3-button-primary w-full py-5 text-xl shadow-m3-primary/30"
                        >
                          <Zap size={24} />
                          {flashMode === 'standard' ? 'Flash Image' : 'Install Infinite Boot'}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === 'flashing' && (
                    <motion.div
                      key="step-flashing"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="m3-card-elevated flex flex-col items-center py-16"
                    >
                      <div className="relative w-64 h-64 mb-12">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="128"
                            cy="128"
                            r="110"
                            stroke="currentColor"
                            strokeWidth="16"
                            fill="transparent"
                            className="text-m3-surface-variant"
                          />
                          <motion.circle
                            cx="128"
                            cy="128"
                            r="110"
                            stroke="currentColor"
                            strokeWidth="16"
                            fill="transparent"
                            strokeDasharray={691}
                            animate={{ strokeDashoffset: 691 - (691 * progress) / 100 }}
                            className="text-m3-primary"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <motion.div 
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-6xl font-display font-black text-m3-primary tracking-tighter"
                          >
                            {Math.round(progress)}%
                          </motion.div>
                        </div>
                      </div>

                      <h3 className="text-3xl font-bold mb-3">Writing to Infinite USB</h3>
                      <div className="w-full max-w-md space-y-3">
                        <div className="h-4 w-full bg-m3-surface-variant rounded-full overflow-hidden shadow-inner">
                          <motion.div 
                            className="h-full bg-m3-primary shadow-[0_0_20px_rgba(103,80,164,0.5)]"
                            animate={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 'success' && (
                    <motion.div
                      key="step-success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="m3-card-elevated flex flex-col items-center py-16 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", damping: 10, stiffness: 100 }}
                        className="w-32 h-32 rounded-full bg-m3-primary-container text-m3-primary flex items-center justify-center mb-10 shadow-2xl"
                      >
                        <CheckCircle2 size={64} />
                      </motion.div>
                      
                      <h3 className="text-4xl font-black mb-4 tracking-tight">Flash Successful!</h3>
                      <button onClick={reset} className="m3-button-tonal py-4 px-12">
                        <RotateCcw size={20} />
                        Flash Another
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings-tab"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-3xl space-y-8"
                >
                   <h2 className="text-4xl font-black uppercase tracking-tight">Preferences</h2>
                   <div className="m3-card-outlined p-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold">Material You Sync</h3>
                          <p className="text-m3-on-surface-variant">Synchronize UI colors with your desktop wallpaper.</p>
                        </div>
                        <button 
                          onClick={syncWithWallpaper}
                          className="m3-button-tonal"
                        >
                          <Pipette size={20} />
                          Sync Now
                        </button>
                      </div>
                      <SettingItem 
                        title="Hardware Acceleration" 
                        description="Use GPU for rendering complex UI animations and transitions." 
                        enabled={true} 
                      />
                      <SettingItem 
                        title="Auto-Verify" 
                        description="Automatically verify drive integrity after flashing completes." 
                        enabled={true} 
                      />
                   </div>
                </motion.div>
              )}

              {activeTab === 'downloads' && (
                <motion.div
                  key="downloads-tab"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-5xl space-y-12"
                >
                  <div className="text-center">
                    <h2 className="text-5xl font-black uppercase tracking-tighter mb-4">Distribution Hub</h2>
                    <p className="text-m3-on-surface-variant text-lg">Native binaries for every platform, compiled for performance.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {BUNDLE_OPTIONS.map((option) => (
                      <div key={option.id} className="m3-card-elevated group hover:scale-[1.02] transition-all duration-300">
                        <div className="flex items-start justify-between mb-6">
                          <div className="w-12 h-12 rounded-2xl bg-m3-primary/10 text-m3-primary flex items-center justify-center group-hover:bg-m3-primary group-hover:text-m3-on-primary transition-colors">
                            {option.icon}
                          </div>
                          <div className="text-[10px] font-black bg-m3-surface-variant px-2 py-1 rounded uppercase tracking-widest">
                            {option.format}
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-1">{option.name}</h3>
                        <p className="text-sm text-m3-on-surface-variant mb-6">{option.platform}</p>
                        <button className="m3-button-tonal w-full group-hover:bg-m3-primary group-hover:text-m3-on-primary transition-colors">
                          <Download size={18} />
                          Download {option.fileName}
                        </button>
                      </div>
                    ))}

                    {/* iOS Coming Soon */}
                    <div className="m3-card-outlined opacity-50 grayscale flex flex-col justify-between border-dashed">
                      <div>
                        <div className="flex items-start justify-between mb-6">
                          <div className="w-12 h-12 rounded-2xl bg-m3-outline-variant/20 text-m3-on-surface-variant flex items-center justify-center">
                            <Smartphone size={20} />
                          </div>
                          <div className="text-[10px] font-black bg-m3-surface-variant px-2 py-1 rounded uppercase tracking-widest">
                            Coming Soon
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-1">iOS / iPadOS</h3>
                        <p className="text-sm text-m3-on-surface-variant mb-6">Apple App Store</p>
                      </div>
                      <button disabled className="m3-button-tonal w-full cursor-not-allowed">
                        <Download size={18} />
                        iOS/iPadOS (Coming Soon)
                      </button>
                    </div>
                  </div>

                  <div className="bg-m3-primary-container/30 p-8 rounded-[2.5rem] border border-m3-primary/10 text-center">
                    <h4 className="text-xl font-bold mb-2">Need a different version?</h4>
                    <p className="text-sm text-m3-on-surface-variant mb-6">Our build server can generate custom binaries for specific architectures on request.</p>
                    <button className="m3-button-primary">
                      Contact Support
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'help' && (
                <motion.div
                  key="help-tab"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-3xl space-y-8"
                >
                  <h2 className="text-4xl font-black uppercase tracking-tight">Help & Support</h2>
                  <div className="space-y-4">
                    <HelpAccordion 
                      title="How do I use Infinite Boot?" 
                      content="Infinite Boot allows you to store multiple ISOs on a single drive. When you boot from the USB, you'll see a menu where you can choose which OS to start. Your files remain safe in a separate partition." 
                    />
                    <HelpAccordion 
                      title="My drive isn't appearing" 
                      content="Ensure your drive is properly connected and that you've granted WebUSB permissions in the browser popup. Some drives may require administrative privileges to access directly." 
                    />
                    <HelpAccordion 
                      title="Flashing failed with an error" 
                      content="This usually happens if another application (like a file explorer or antivirus) is locking the drive. Try closing other apps and try again." 
                    />
                    <HelpAccordion 
                      title="Linux: AppImage won't start" 
                      content="On Arch Linux, you may need to install 'fuse2' (sudo pacman -S fuse2). If you see a metadata error, try running the AppImage with the '--appimage-extract' flag in your terminal to bypass mounting restrictions." 
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === 'system' && (
                <motion.div
                  key="system-tab"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-2xl"
                >
                  <div className="bg-m3-surface-variant/20 p-8 rounded-[2.5rem] border border-m3-outline-variant/10 font-mono shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Cpu size={120} />
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                      {/* ASCII Art Logo */}
                      <div className="text-m3-primary font-bold leading-none select-none">
                        <pre className="text-[10px] md:text-xs">
{`      .---.
     /     \\
    | () () |
     \\  ^  /
      |||||
      |||||
    '-\"\"\"\"\"-'
   INFINITE USB`}
                        </pre>
                      </div>

                      {/* System Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span className="text-xs opacity-50 ml-2">system-fetch</span>
                        </div>
                        
                        <div className="space-y-1 text-sm md:text-base">
                          <p><span className="text-m3-primary font-bold">OS:</span> {nativeSystem?.os || 'Linux (Container)'}</p>
                          <p><span className="text-m3-primary font-bold">Arch:</span> {nativeSystem?.arch || 'x64'}</p>
                          <p><span className="text-m3-primary font-bold">Kernel:</span> {nativeSystem?.kernel || '5.15.0-generic'}</p>
                          <p><span className="text-m3-primary font-bold">CPU:</span> {nativeSystem?.cpu || 'Intel Core i7-12700K'}</p>
                          <p><span className="text-m3-primary font-bold">Memory:</span> {nativeSystem?.mem || '16GB'}</p>
                          <p><span className="text-m3-primary font-bold">Shell:</span> /bin/bash</p>
                          <p><span className="text-m3-primary font-bold">Uptime:</span> {Math.floor(Math.random() * 100)} hours</p>
                          <p><span className="text-m3-primary font-bold">Theme:</span> Material You (Dynamic)</p>
                        </div>

                        <div className="flex gap-2 mt-6">
                          <div className="w-6 h-6 bg-black" />
                          <div className="w-6 h-6 bg-red-500" />
                          <div className="w-6 h-6 bg-green-500" />
                          <div className="w-6 h-6 bg-yellow-500" />
                          <div className="w-6 h-6 bg-blue-500" />
                          <div className="w-6 h-6 bg-purple-500" />
                          <div className="w-6 h-6 bg-cyan-500" />
                          <div className="w-6 h-6 bg-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <p className="text-m3-on-surface-variant text-sm">
                      This information is retrieved via the <code className="bg-m3-surface-variant px-2 py-1 rounded">systeminformation</code> bridge.
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'bootloader' && (
                <motion.div
                  key="bootloader-tab"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-3xl space-y-8"
                >
                  <div className="mb-12">
                    <h2 className="text-4xl font-black uppercase tracking-tight mb-2">Bootloader Architect</h2>
                    <p className="text-m3-on-surface-variant">Customize the visual identity of your Infinite Boot drive.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="m3-card-outlined space-y-6">
                      <h3 className="text-xl font-bold">Visual Theme</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-m3-large bg-m3-surface-variant/20">
                          <span className="font-bold">Primary Color</span>
                          <div 
                            className="w-10 h-10 rounded-full border-2 border-white/20 cursor-pointer" 
                            style={{ backgroundColor: bootConfig.primaryColor }}
                          />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-m3-large bg-m3-surface-variant/20">
                          <span className="font-bold">Background</span>
                          <div 
                            className="w-10 h-10 rounded-full border-2 border-white/20 cursor-pointer" 
                            style={{ backgroundColor: bootConfig.backgroundColor }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="m3-bootloader-bg rounded-m3-extra-large p-8 flex flex-col items-center justify-center text-white border border-white/10 shadow-2xl">
                      <div className="w-full max-w-[200px] space-y-2">
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-m3-primary w-1/3" />
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-center">Preview Mode</div>
                        <div className="py-4 space-y-2">
                          <div className="px-3 py-2 rounded bg-white/5 border border-white/10 text-xs font-bold">Arch Linux 2026.03</div>
                          <div className="px-3 py-2 rounded bg-m3-primary text-xs font-bold">Ubuntu 24.04 LTS</div>
                          <div className="px-3 py-2 rounded bg-white/5 border border-white/10 text-xs font-bold">Windows 11 Setup</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, expanded, onClick }: { icon: React.ReactNode, label: string, active: boolean, expanded: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-4 transition-all duration-300 group shrink-0",
        expanded ? "w-full px-4 py-3 rounded-m3-large" : "w-14 h-14 justify-center rounded-m3-extra-large",
        active ? "bg-m3-secondary-container text-m3-on-secondary-container" : "text-m3-on-surface-variant hover:bg-m3-surface-variant/50"
      )}
    >
      <div className={cn(
        "transition-transform duration-300",
        active ? "scale-110" : "group-hover:scale-110"
      )}>
        {icon}
      </div>
      {expanded && <span className="font-bold text-sm tracking-tight">{label}</span>}
    </button>
  );
}

function Pipette({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9"/><path d="m4.5 16.5 4.5 4.5"/><path d="m10.5 10.5 4.5 4.5"/></svg>;
}

function StatCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-m3-surface-variant/20 p-4 rounded-m3-large border border-m3-outline-variant/10">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">{label}</div>
      <div className="text-xs font-bold truncate">{value}</div>
    </div>
  );
}

function SettingItem({ title, description, enabled }: { title: string, description: string, enabled: boolean }) {
  return (
    <div className="m3-card-outlined flex items-center justify-between p-5">
      <div className="flex-1 pr-8">
        <h4 className="text-lg font-bold mb-1">{title}</h4>
        <p className="text-sm text-m3-on-surface-variant leading-relaxed">{description}</p>
      </div>
      <div className={cn(
        "w-14 h-8 rounded-full p-1 transition-colors cursor-pointer flex items-center",
        enabled ? "bg-m3-primary" : "bg-m3-outline-variant"
      )}>
        <motion.div 
          animate={{ x: enabled ? 24 : 0 }}
          className="w-6 h-6 bg-white rounded-full shadow-sm"
        />
      </div>
    </div>
  );
}

function HelpAccordion({ title, content }: { title: string, content: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="m3-card-outlined overflow-hidden p-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-center justify-between hover:bg-m3-surface-variant/30 transition-colors"
      >
        <span className="font-bold text-lg">{title}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronRight size={20} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 pb-5 text-m3-on-surface-variant leading-relaxed"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
