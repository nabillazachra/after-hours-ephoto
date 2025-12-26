import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../store';
import { AppStep } from '../types';

// Components
import TemplateSelector from './TemplateSelector';
import PaymentGate from './PaymentGate';
import CameraBooth from './CameraBooth';
import PhotoSelector from './PhotoSelector';
import ResultView from './ResultView';
import AboutPage from './AboutPage';
import Footer from './Footer';
import { Icons } from '../constants';

const ClientApp: React.FC = () => {
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

    // Logo Logic - Updated URLs
    const logoSrc = state.isDarkMode
        ? "/logo-light.png" // Dark Mode Asset (White Text)
        : "/logo-dark.png"; // Light Mode Asset (Black Text)

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

                            {/* Hero Content */}
                            <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center pt-20">
                                <div className="mb-8 mix-blend-difference">
                                    <span className="inline-block py-1 px-3 border border-brand-black/20 dark:border-white/20 rounded-full text-[10px] uppercase tracking-[0.2em] font-medium text-brand-black dark:text-white backdrop-blur-sm">
                                        The Phygital Experience
                                    </span>
                                </div>

                                <h1 className="font-display font-black text-6xl md:text-8xl lg:text-9xl uppercase tracking-tighter leading-[0.85] text-brand-black dark:text-white mb-8 mix-blend-difference select-none">
                                    After<br />
                                    <span className="italic font-serif font-light text-brand-blue dark:text-brand-gold">Hours</span>
                                </h1>

                                <p className="max-w-md mx-auto text-sm md:text-base font-light text-brand-black/80 dark:text-white/80 leading-relaxed mb-12 mix-blend-difference">
                                    Merging high-fidelity studio aesthetics with instant digital gratification.
                                    <span className="hidden md:inline"> A new standard for event photography.</span>
                                </p>

                                <button
                                    onClick={() => dispatch({ type: 'SET_STEP', payload: AppStep.TEMPLATE_SELECTION })}
                                    className="group relative px-8 py-4 bg-brand-black dark:bg-white text-white dark:text-black overflow-hidden transform transition-all hover:scale-105 active:scale-95 duration-500 ease-out"
                                >
                                    <span className="relative z-10 font-bold text-xs tracking-[0.2em] uppercase flex items-center gap-3">
                                        Start Session
                                        <Icons.ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
                                    </span>
                                    <div className="absolute inset-0 bg-brand-blue dark:bg-brand-gold transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                                </button>
                            </div>
                        </div>

                        <Footer />
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
            case AppStep.ABOUT:
                return <AboutPage />;
            default:
                // Fallback for Admin or invalid step - though Admin should be handled by Route now
                // If state is accidentally existing ADMIN step, we redirect or show null
                return null;
        }
    };

    return (
        <div className={`${state.isDarkMode ? 'dark' : ''}`}>
            <div className="bg-zinc-50 dark:bg-brand-black min-h-screen text-brand-black dark:text-brand-white font-sans selection:bg-brand-blue dark:selection:bg-brand-gold selection:text-white dark:selection:text-black overflow-hidden flex flex-col transition-colors duration-500">
                {/* Top Bar (Only visible inside flows, NOT on Landing/Admin) */}
                {state.step !== AppStep.LANDING && state.step !== AppStep.ADMIN && state.step !== AppStep.ABOUT && (
                    <div className="h-24 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-900 z-10 bg-white/80 dark:bg-black/50 backdrop-blur-md transition-all duration-300">
                        <button onClick={() => dispatch({ type: 'SET_STEP', payload: AppStep.LANDING })} className="font-bold tracking-tighter text-xl text-brand-blue dark:text-white hover:text-brand-gold dark:hover:text-brand-gold transition-colors flex items-center gap-2 hover:opacity-80 transition-opacity">
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
                {state.step !== AppStep.LANDING && state.step !== AppStep.ABOUT && (
                    <footer className="fixed bottom-4 left-0 w-full text-center pointer-events-none opacity-20 z-0">
                        <p className="text-[10px] font-mono text-zinc-500 tracking-widest">AFTER HOURS SYSTEM v1.0</p>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default ClientApp;
