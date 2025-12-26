import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { AppStep, Template } from '../types';
import { Icons, PHOTOS_PER_SESSION } from '../constants';
import { database as db } from '../services/database';

const AboutPage: React.FC = () => {
    const { state, dispatch } = useStore();
    const galleryRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);
    const [templates, setTemplates] = useState<Template[]>([]);

    // Scroll to top on mount & fetch templates
    useEffect(() => {
        window.scrollTo(0, 0);
        const loadDocs = async () => {
            const t = await db.getAllTemplates();
            setTemplates(t);
        };
        loadDocs();
    }, []);

    const handleBack = () => {
        dispatch({ type: 'SET_STEP', payload: AppStep.LANDING });
    };

    const handleBook = () => {
        dispatch({ type: 'SET_STEP', payload: AppStep.TEMPLATE_SELECTION });
    };

    const scrollToGallery = () => {
        galleryRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToContact = () => {
        footerRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="w-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-x-hidden antialiased selection:bg-brand-gold selection:text-white">

            {/* Navigation */}
            <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-background-light/90 dark:bg-background-dark/80 backdrop-blur-md border-b border-black/5 dark:border-white/10">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={handleBack}>
                        <img
                            src="/logo-light.png"
                            alt="The After Hours"
                            className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105" // Logo bigger
                        />
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <button onClick={scrollToGallery} className="text-xs font-medium uppercase tracking-widest hover:text-brand-gold transition-colors cursor-pointer bg-transparent border-none">Gallery</button>
                        <button onClick={scrollToContact} className="text-xs font-medium uppercase tracking-widest hover:text-brand-gold transition-colors cursor-pointer bg-transparent border-none">Contact</button>
                    </nav>
                    <button
                        onClick={handleBook}
                        className="bg-brand-gold hover:bg-brand-goldDim text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all transform hover:scale-105"
                    >
                        Take a Pic
                    </button>
                </div>
            </header>

            <main className="relative w-full pt-20">
                {/* Hero Section */}
                <section className="relative min-h-[90vh] flex flex-col justify-center px-6 md:px-12 max-w-[1440px] mx-auto border-l border-r border-dashed border-black/5 dark:border-white/5">
                    <div className="relative z-10 w-full pt-12 md:pt-0">
                        <p className="font-serif italic text-xl md:text-3xl text-gray-400 mb-4 pl-2">The future of digital memories</p>
                        <h1 className="flex flex-col font-black text-[12vw] leading-[0.8] tracking-tighter uppercase text-slate-900 dark:text-white mix-blend-difference">
                            <span className="block hover:text-brand-gold transition-colors duration-500 cursor-default">The After</span>
                            <span className="block pl-[15vw] md:pl-[20vw] text-outline-stroke opacity-80">Hours /</span>
                            <span className="block text-right pr-[5vw] text-brand-gold">Online Booth</span>
                        </h1>
                    </div>
                    {/* Floating Hero Image */}
                    <div className="absolute right-[5%] bottom-[10%] w-[300px] md:w-[450px] aspect-[4/5] opacity-80 z-0 grayscale hover:grayscale-0 transition-all duration-700 ease-out rotate-2 hover:rotate-0">
                        <div
                            className="w-full h-full bg-cover bg-center rounded-lg shadow-2xl"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBhKYj7FGljwfUxGl8NbKkSzmcpw3IevLVj-Wpxgc3ZFSDXDZwWGxDK1vHk4St3SRYnXgew8hBLLd0dUNfw1Mpgm2bo0INVJ1niEc0On-Mq4J3kIGki1hspG1EoUzarKq6-mbDBXHZ3QKkNhAG0biLYHR5WQ1zjY3VY6KkpuggZjQljTJPEThTB9BzcOYUQKC27HUVqT0a3sNmp8OI0p_HTqoOtHRFLWUAOhTtBKCN_Qn3flkkkVjR3fv3Adpkz4jWhO5KJzKH3Oiv8')" }}
                        >
                        </div>
                    </div>
                    {/* Scroll Indicator */}
                    <div className="absolute bottom-12 left-12 hidden md:flex items-center gap-4 opacity-50">
                        <Icons.ArrowRight className="rotate-90 animate-bounce" />
                        <span className="text-xs font-mono uppercase tracking-widest">Scroll to Explore</span>
                    </div>
                </section>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-white/20 to-transparent my-12"></div>

                {/* Products / Philosophy Section */}
                <section className="relative py-24 px-6 md:px-12 max-w-[1440px] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
                        <div className="md:col-span-3 sticky top-32">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold mb-4 flex items-center gap-2">
                                <span className="w-8 h-px bg-brand-gold"></span>
                                Our Products
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono leading-relaxed">
                                EST. 2024<br />
                                DIGITAL ARTIFACTS<br />
                                GLOBAL
                            </p>
                        </div>
                        <div className="md:col-span-9">
                            <p className="font-serif text-3xl md:text-5xl lg:text-6xl leading-[1.1] text-slate-900 dark:text-gray-100">
                                <span className="ml-12 md:ml-24 block mb-4 text-gray-400 italic">"We don't just take photos."</span>
                                We believe in capturing the raw, <span className="text-brand-gold font-sans font-bold uppercase tracking-tight">unfiltered</span> moments of the digital age. It's a memory preserved in pixels, treated with an <span className="border-b-2 border-brand-gold pb-1">editorial eye</span>.
                            </p>
                            <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-black/10 dark:border-white/10 pt-12">
                                {/* Feature 1: Multi-Platform */}
                                <div className="group">
                                    <div className="text-brand-gold mb-6 group-hover:scale-110 transition-transform origin-left">
                                        <Icons.DeviceMobile size={40} weight="light" />
                                    </div>
                                    <h4 className="text-xl font-bold mb-3">Multi-Platform Use</h4>
                                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                                        Experience seamless access across all your devices. Whether on desktop, tablet, or smartphone, our fluid interface ensures a consistent, premium experience anywhere.
                                    </p>
                                </div>
                                {/* Feature 2: Modern Virtual Props */}
                                <div className="group">
                                    <div className="text-brand-gold mb-6 group-hover:scale-110 transition-transform origin-left">
                                        <Icons.MagicWand size={40} weight="light" />
                                    </div>
                                    <h4 className="text-xl font-bold mb-3">Modern Virtual Props</h4>
                                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                                        A curated collection of digital assets that blend editorial design with playful interactivity. Different from the standard—crafted for the bold.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Gallery Grid Section */}
                <section ref={galleryRef} className="relative py-24 bg-surface-dark w-full overflow-hidden">
                    {/* Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-px bg-white/10"></div>
                    <div className="absolute top-0 left-1/4 w-px h-full bg-white/5"></div>
                    <div className="absolute top-0 right-1/4 w-px h-full bg-white/5"></div>

                    <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
                        <div className="mb-24 text-center">
                            <h2 className="text-[15vw] md:text-[8vw] font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent leading-none select-none pointer-events-none absolute top-0 left-0 right-0 -translate-y-1/2">Gallery</h2>
                            <p className="font-serif italic text-2xl text-brand-gold relative z-10">Curated Templates</p>
                        </div>

                        {templates.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {templates.map((template) => (
                                    <div key={template.id} className="relative group aspect-[3/4] overflow-hidden bg-zinc-900 border border-white/10 rounded-sm">
                                        <img
                                            src={template.imageUrl}
                                            alt={template.name}
                                            className="w-full h-full object-contain p-4 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                                            <span className="text-white text-sm font-bold uppercase tracking-widest">{template.name}</span>
                                            <span className="text-brand-gold text-xs font-mono mt-1">{template.layout.width}x{template.layout.height}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 border border-dashed border-white/10">
                                <Icons.SquaresFour size={48} className="mx-auto text-zinc-600 mb-4" />
                                <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Gallery Loading or Empty</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Features Deep Dive (Keep visual appeal but simplify interactions) */}
                <section className="relative py-24 bg-[#050505] w-full text-white">
                    <div className="max-w-[1440px] mx-auto px-6 md:px-12">
                        {/* Split comparison */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
                            <div className="relative group cursor-pointer overflow-hidden rounded-2xl border border-white/10">
                                <div className="aspect-[3/4] bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-500" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAeH4oClaNFF-fCIF1LwOa8kn-zA-LlMMRBQNnCqE4fQcFt9-f4WexbRrQTYEVdaIRbsSP9Oqs3jgqXRk66C1bvCvEndgcJRSf6dnP5m7yxWyrpTt3JBmUE_L952byyhlN771nxhs7obDc1rjZSgP8uvo5_2mwZ1yz9Wn1TJLk-j1q7YnM6O72WoxMnLBAXS73VQBQRglIM9hKpQgKaMbx_VWyTTR3lMUqwdtdwsbURVXx6KfWhWYFJ6KncUsKzbWaaZ0AxaSv1eaQY')" }}></div>
                                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <h4 className="border-l-2 border-brand-gold pl-4 text-xl font-bold">Custom Branding</h4>
                                    <p className="pl-4 text-gray-300 text-sm mt-2">Your logo, your colors, your fonts.</p>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center">
                                <h3 className="text-4xl md:text-6xl font-serif italic mb-6">"Editorial Standard."</h3>
                                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                                    We don't just apply a filter. Our proprietary processing pipeline enhances lighting, skin tones, and details to deliver studio-quality portraits instantly.
                                </p>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold border border-brand-gold/50">
                                        <Icons.MagicWand size={24} weight="duotone" />
                                    </div>
                                    <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-gray-400">
                                        <Icons.Camera size={24} />
                                    </div>
                                    <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-gray-400">
                                        <Icons.Aperture size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="relative py-32 px-6 border-t border-black/10 dark:border-white/10 bg-background-light dark:bg-background-dark">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl md:text-7xl font-black uppercase mb-8 tracking-tighter">Ready to capture<br /><span className="text-brand-gold italic font-serif lowercase">the moment?</span></h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-lg mx-auto">
                            Join the list of high-end events and brands using The After Hours to elevate their digital presence.
                        </p>
                        <div className="flex flex-col md:flex-row gap-4 justify-center">
                            <button
                                onClick={handleBook}
                                className="bg-brand-gold hover:bg-brand-goldDim text-white px-8 py-4 rounded-lg text-sm font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20"
                            >
                                Take a Pic
                            </button>
                            <a
                                href="https://www.linkedin.com/in/nabilla-zachra"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="border border-slate-900 dark:border-white/30 hover:border-white text-slate-900 dark:text-white px-8 py-4 rounded-lg text-sm font-bold uppercase tracking-widest transition-all inline-block hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                            >
                                Connect With Me
                            </a>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer ref={footerRef} className="bg-[#050505] text-white pt-24 pb-12 border-t border-white/5">
                    <div className="max-w-[1440px] mx-auto px-6 md:px-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-12">
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <img
                                        src="/logo-light.png"
                                        alt="The After Hours"
                                        className="h-14 w-auto object-contain" // Updated size
                                    />
                                </div>
                                <p className="text-gray-500 max-w-xs text-sm leading-relaxed">
                                    A product of editorial design thinking applied to event technology. <br />Based in Jakarta.
                                </p>
                            </div>
                            <a href="mailto:nabillazwork@gmail.com" className="text-3xl md:text-5xl font-serif hover:text-brand-gold transition-colors border-b border-transparent hover:border-brand-gold pb-2 cursor-pointer">
                                nabillazwork@gmail.com
                            </a>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-xs text-gray-600">
                            <p>© 2025 The After Hours Inc. All rights reserved.</p>
                            <div className="flex gap-6 mt-4 md:mt-0">
                                <a href="https://instagram.com/zabchra" target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold transition-colors cursor-pointer flex items-center gap-2">
                                    <Icons.InstagramLogo size={16} /> Instagram
                                </a>
                                <a href="https://www.tiktok.com/@studionab" target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold transition-colors cursor-pointer flex items-center gap-2">
                                    <Icons.TiktokLogo size={16} /> TikTok
                                </a>
                            </div>
                            <p className="font-mono mt-2 md:mt-0">DESIGNED FOR THE BOLD</p>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default AboutPage;
