import React, { useEffect, useState, useRef } from 'react';
import { StoreProvider, useStore } from './store';
import { AppStep } from './types';

// Components
import TemplateSelector from './components/TemplateSelector';
import PaymentGate from './components/PaymentGate';
import CameraBooth from './components/CameraBooth';
import PhotoSelector from './components/PhotoSelector';
import ResultView from './components/ResultView';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import { Icons } from './constants';

const MainLayout: React.FC = () => {
  const { state, dispatch } = useStore();
  
  // Parallax & Scroll Logic
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        setScrollY(scrollRef.current.scrollTop);
      }
    };
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', handleScroll);
    return () => {
        if (el) el.removeEventListener('scroll', handleScroll);
    };
  }, [state.step]);

  // Smooth Scroll to Footer Function
  const scrollToFooter = () => {
    const footer = document.getElementById('footer-section');
    if (footer) {
        footer.scrollIntoView({ behavior: 'smooth' });
    } else {
        // Fallback for internal container scroll if ID not found immediately
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }
  };

  // Logo Logic - Updated URLs
  const logoSrc = state.isDarkMode
    ? "https://drive.google.com/thumbnail?id=1cfqrsPfg36_zhVZIhpPkVa5uU5zE7pvI&sz=w1000" // Dark Mode Asset
    : "https://drive.google.com/thumbnail?id=1sEUZYhZI4--wzXqkKv0NmsT1pGUM6RrN&sz=w1000"; // Light Mode Asset

  const renderStep = () => {
    switch (state.step) {
      case AppStep.LANDING:
        return (
          // Main Scroll Container
          <div ref={scrollRef} className="relative w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth bg-zinc-50 dark:bg-[#050505] perspective-1000 transition-colors duration-700 ease-out">
            
            {/* HERO SECTION - Fixed/Sticky feel via Transform */}
            <div className="relative h-screen w-full flex flex-col group/design-root overflow-hidden bg-zinc-50 dark:bg-[#050505] transition-colors duration-700 ease-out">
                
                {/* Background Parallax Layer (Dark Mode) */}
                <div 
                    className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out will-change-transform ${state.isDarkMode ? 'opacity-100' : 'opacity-0'}`}
                    style={{ 
                        transform: `translate3d(0, ${scrollY * 0.5}px, 0) scale(${1 + scrollY * 0.0005})`,
                        filter: `blur(${Math.min(20, scrollY * 0.02)}px) brightness(${Math.max(0.4, 1 - scrollY * 0.001)})`
                    }}
                >
                    <div className="relative w-full h-full">
                        <img 
                            alt="Dark mode aesthetic background" 
                            className="w-full h-full object-cover grayscale object-center opacity-60" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDorzkD2Peml4bRK6djAy4Fyv6st-0IQOlzWzGE-VWur41RlXqpfVdH2Dt6IchZIQzD3AJDn84qsrAS9hKAUCvbuKGc0dCLvINmNx4DHFDLxro_gpahpuwHWckpp4cJsJhGHAfnpqKpGidAUAvrlMohHLQqdUHx0HPQIluxSkYcuqKqNFyx5Px3LdXdqU2xiaazY7Em8KERI2xiefBrYbmZJY65Jtoc69TqSY4cB0SDLTO6NgRaaXU7HWTYSd8lCCJ05zbKLV9b7SnG"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-[#050505]/20 mix-blend-multiply"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-transparent to-[#050505]/80"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] luxury-glow opacity-50 mix-blend-screen pointer-events-none"></div>
                    </div>
                </div>
                
                {/* Background Parallax Layer (Light Mode) */}
                <div 
                    className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out will-change-transform ${!state.isDarkMode ? 'opacity-100' : 'opacity-0'} pointer-events-none`}
                    style={{ 
                        transform: `translate3d(0, ${scrollY * 0.5}px, 0) scale(${1 + scrollY * 0.0005})`,
                        filter: `blur(${Math.min(20, scrollY * 0.02)}px) brightness(${Math.max(0.8, 1 - scrollY * 0.0005)})`
                    }}
                >
                     <div className="relative w-full h-full">
                         {/* High-Key Fashion Image */}
                        <img 
                            alt="Light mode aesthetic background" 
                            className="w-full h-full object-cover object-center opacity-100" 
                            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop" 
                        />
                        {/* Light overlays to ensure text readability */}
                        <div className="absolute inset-0 bg-white/70"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white/80"></div>
                     </div>
                </div>
                
                {/* Grain Texture (Static) */}
                <div className="absolute inset-0 z-[5] hero-grain opacity-40 pointer-events-none mix-blend-overlay"></div>

                {/* Nav Bar */}
                <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 text-brand-black dark:text-white transition-all duration-500">
                    <div className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => dispatch({type: 'SET_STEP', payload: AppStep.LANDING})}>
                             {/* UPDATED LOGO IMAGE SIZE */}
                             <img 
                                src={logoSrc}
                                alt="After Hours Logo" 
                                className="h-36 w-auto object-contain drop-shadow-md transition-all duration-500" 
                             />
                        </div>
                    </div>
                    <div className="flex items-center gap-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="hidden md:flex items-center gap-8 text-brand-black dark:text-white">
                            <button 
                                onClick={scrollToFooter}
                                className="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-brand-blue dark:hover:text-brand-gold transition-colors cursor-pointer relative group"
                            >
                                Contact
                                <span className="absolute -bottom-2 left-0 w-0 h-px bg-brand-blue dark:bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
                            </button>
                            <span 
                                onClick={() => dispatch({ type: 'SET_STEP', payload: AppStep.TEMPLATE_SELECTION })}
                                className="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-brand-blue dark:hover:text-brand-gold transition-colors cursor-pointer relative group"
                            >
                                Templates
                                <span className="absolute -bottom-2 left-0 w-0 h-px bg-brand-blue dark:bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
                            </span>
                        </div>
                        
                        {/* Theme Toggle */}
                        <button 
                            onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
                            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-brand-black dark:text-white"
                            aria-label="Toggle Theme"
                        >
                            {state.isDarkMode ? <Icons.Sun size={20} /> : <Icons.Moon size={20} />}
                        </button>

                        <button 
                            onClick={() => dispatch({ type: 'SET_STEP', payload: AppStep.ADMIN })}
                            className="flex items-center justify-center size-10 rounded-full border border-brand-black/10 dark:border-white/10 text-brand-black/50 dark:text-white/50 hover:text-brand-black dark:hover:text-white hover:border-brand-black/40 dark:hover:border-white/40 hover:bg-black/5 dark:hover:bg-white/5 transition-all backdrop-blur-sm"
                            aria-label="Admin Access"
                        >
                            <Icons.Lock size={14} />
                        </button>
                    </div>
                </nav>

                {/* Main Content Layer - Parallax Effect Reverse/Fade */}
                <div 
                    className="relative z-10 w-full h-full flex flex-col justify-center items-center pointer-events-none"
                    style={{ 
                        opacity: Math.max(0, 1 - scrollY / 600),
                        transform: `translate3d(0, -${scrollY * 0.2}px, 0)`
                    }}
                >
                    {/* Massive Typography - Dark Blue in Light Mode for contrast */}
                    <div className="relative flex flex-col items-center justify-center w-full leading-[0.85] select-none opacity-90">
                        <h1 className="text-[18vw] font-black tracking-[-0.05em] text-brand-blue dark:text-white whitespace-nowrap text-center blur-[1px] animate-fade-in-up mix-blend-multiply dark:mix-blend-overlay" style={{ animationDelay: '0.3s' }}>
                            AFTER
                        </h1>
                        <h1 className="text-[18vw] font-black tracking-[-0.05em] text-brand-blue dark:text-white whitespace-nowrap text-center -mt-[2vw] blur-[1px] animate-fade-in-up mix-blend-multiply dark:mix-blend-overlay" style={{ animationDelay: '0.5s' }}>
                            HOURS
                        </h1>
                    </div>

                    {/* Left Side Technical Stats (Desktop Only) */}
                    <div className="absolute top-1/2 left-8 md:left-16 -translate-y-1/2 flex flex-col gap-12 text-brand-blue/60 dark:text-white/40 hidden md:flex animate-fade-in-slow" style={{ animationDelay: '0.8s' }}>
                        <div className="flex flex-col gap-3 items-center group">
                            {/* Replaced Icon here too for consistency */}
                            <Icons.Aperture className="text-xl group-hover:text-brand-blue dark:group-hover:text-white transition-colors duration-500" />
                            <p className="text-[10px] uppercase tracking-widest font-mono writing-vertical-rl rotate-180 opacity-60 group-hover:opacity-100 transition-opacity">ISO 3200</p>
                        </div>
                        <div className="w-px h-24 bg-gradient-to-b from-transparent via-brand-blue/30 dark:via-white/20 to-transparent"></div>
                        <div className="flex flex-col gap-3 items-center group">
                            <Icons.Faders className="text-xl group-hover:text-brand-blue dark:group-hover:text-white transition-colors duration-500" />
                            <p className="text-[10px] uppercase tracking-widest font-mono writing-vertical-rl rotate-180 opacity-60 group-hover:opacity-100 transition-opacity">+2 EV</p>
                        </div>
                    </div>

                    {/* Floating CTA - Interactive Pointer Events Re-enabled */}
                    <div className="absolute bottom-[15%] md:bottom-[20%] right-[10%] md:right-[15%] z-20 flex flex-col items-end gap-3 pointer-events-auto animate-fade-in-up" style={{ animationDelay: '1s' }}>
                        <button 
                            onClick={() => dispatch({ type: 'SET_STEP', payload: AppStep.TEMPLATE_SELECTION })}
                            className="group relative flex items-center justify-between gap-6 h-14 pl-8 pr-2 bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-brand-blue/10 dark:border-white/10 hover:border-brand-blue/30 dark:hover:border-white/30 hover:bg-white dark:hover:bg-white/10 text-brand-blue dark:text-brand-gold hover:text-brand-blue dark:hover:text-white text-sm font-bold uppercase tracking-widest transition-all duration-500 shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden drop-shadow-md"
                        >
                            {/* Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-blue/10 dark:via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                            
                            <span className="relative z-10 group-hover:tracking-[0.2em] transition-all duration-300">Take a Picture</span>
                            
                            <div className="size-10 bg-brand-blue dark:bg-white text-white dark:text-black flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-110">
                                <Icons.ArrowUpRight className="text-lg group-hover:rotate-45 transition-transform duration-300" />
                            </div>
                        </button>
                        <span className="text-[10px] text-brand-blue/60 dark:text-white/40 tracking-[0.3em] uppercase text-right block max-w-[200px] border-t border-brand-blue/20 dark:border-white/10 pt-3 mt-1 font-semibold">
                            Luxury Editorial Experience
                        </span>
                    </div>

                    {/* Bottom Left Location/Playing */}
                    <div className="absolute bottom-12 md:bottom-16 left-8 md:left-12 flex items-end gap-5 text-brand-black dark:text-white animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
                        <div className="size-14 border border-brand-black/10 dark:border-white/10 bg-white/5 backdrop-blur-md rounded-none flex items-center justify-center shadow-lg group">
                            <div className="animate-spin-slow group-hover:scale-110 transition-transform duration-700">
                                <Icons.Disc weight="fill" size={28} className="text-brand-blue/80 dark:text-white/80" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 pb-1">
                            <span className="text-[9px] uppercase tracking-[0.3em] text-brand-blue/80 dark:text-brand-gold font-bold">Location</span>
                            <span className="text-xs font-bold uppercase tracking-widest text-brand-black dark:text-white/90">Jakarta, Indonesia</span>
                        </div>
                    </div>

                    {/* Bottom Center Scroll Indicator */}
                    <div 
                        onClick={scrollToFooter}
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-brand-black/50 dark:text-white/30 animate-pulse pb-8 cursor-pointer hover:text-brand-blue dark:hover:text-white transition-colors z-30 pointer-events-auto"
                    >
                        <span className="text-[9px] uppercase tracking-[0.3em] font-semibold">Scroll</span>
                        <div className="h-16 w-px bg-gradient-to-b from-transparent via-brand-black/40 dark:via-white/40 to-transparent"></div>
                    </div>
                </div>
            </div>
            
            {/* New Footer - Z-index to cover hero for effect */}
            <div className="relative z-20 bg-white dark:bg-brand-black shadow-[0_-20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_-20px_60px_rgba(0,0,0,1)] transition-colors duration-500">
                <Footer />
            </div>
          </div>
        );
      case AppStep.TEMPLATE_SELECTION:
        return <TemplateSelector />;
      case AppStep.PAYMENT_GATE:
        return <PaymentGate />;
      case AppStep.CAMERA:
        return <CameraBooth />;
      case AppStep.PHOTO_SELECTION:
        return <PhotoSelector />;
      case AppStep.RESULT:
        return <ResultView />;
      case AppStep.ADMIN:
        return <AdminDashboard />;
      default:
        return <div>Error: Unknown Step</div>;
    }
  };

  return (
    <div className={`${state.isDarkMode ? 'dark' : ''}`}>
        <div className="bg-zinc-50 dark:bg-brand-black min-h-screen text-brand-black dark:text-brand-white font-sans selection:bg-brand-blue dark:selection:bg-brand-gold selection:text-white dark:selection:text-black overflow-hidden flex flex-col transition-colors duration-500">
          {/* Top Bar (Only visible inside flows, NOT on Landing/Admin) */}
          {state.step !== AppStep.LANDING && state.step !== AppStep.ADMIN && (
             <div className="h-24 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-900 z-10 bg-white/80 dark:bg-black/50 backdrop-blur-md transition-all duration-300">
                <button onClick={() => dispatch({type: 'SET_STEP', payload: AppStep.LANDING})} className="font-bold tracking-tighter text-xl text-brand-blue dark:text-white hover:text-brand-gold dark:hover:text-brand-gold transition-colors flex items-center gap-2 hover:opacity-80 transition-opacity">
                    {/* UPDATED LOGO IMAGE SIZE */}
                    <img 
                        src={logoSrc}
                        alt="After Hours Logo" 
                        className="h-36 w-auto object-contain drop-shadow-sm" 
                    />
                </button>
                <div className="flex gap-4 items-center">
                   <button 
                        onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
                        className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-brand-black dark:text-white"
                   >
                        {state.isDarkMode ? <Icons.Sun size={16} /> : <Icons.Moon size={16} />}
                   </button>
                   <div className="flex gap-1 items-center">
                       <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                       <span className="text-xs font-mono text-zinc-500">REC</span>
                   </div>
                </div>
             </div>
          )}
    
          {/* Main Content Area */}
          <main className="flex-1 relative overflow-hidden">
            {renderStep()}
          </main>
          
          {/* Global Branding Footer (Hidden on Landing now as it has its own) */}
          {state.step !== AppStep.LANDING && (
            <footer className="fixed bottom-4 left-0 w-full text-center pointer-events-none opacity-20 z-0">
                <p className="text-[10px] font-mono text-zinc-500 tracking-widest">AFTER HOURS SYSTEM v1.0</p>
            </footer>
          )}
        </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
};

export default App;