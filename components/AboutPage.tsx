import React, { useEffect } from 'react';
import { useStore } from '../store';
import { AppStep } from '../types';

const AboutPage: React.FC = () => {
    const { state, dispatch } = useStore();

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleBack = () => {
        dispatch({ type: 'SET_STEP', payload: AppStep.LANDING });
    };

    const handleBook = () => {
        dispatch({ type: 'SET_STEP', payload: AppStep.TEMPLATE_SELECTION });
    };

    return (
        <div className="w-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-x-hidden antialiased selection:bg-brand-gold selection:text-white">

            {/* Navigation */}
            <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-background-light/90 dark:bg-background-dark/80 backdrop-blur-md border-b border-black/5 dark:border-white/10">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={handleBack}>
                        <img
                            src="https://drive.google.com/thumbnail?id=1cfqrsPfg36_zhVZIhpPkVa5uU5zE7pvI&sz=w1000"
                            alt="The After Hours"
                            className="h-12 w-auto object-contain"
                        />
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <a className="text-xs font-medium uppercase tracking-widest hover:text-brand-gold transition-colors cursor-pointer">Gallery</a>
                        <a className="text-xs font-medium uppercase tracking-widest hover:text-brand-gold transition-colors cursor-pointer">Contact</a>
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
                {/* Hero Section: Editorial Typography */}
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
                        <span className="material-symbols-outlined animate-bounce">arrow_downward</span>
                        <span className="text-xs font-mono uppercase tracking-widest">Scroll to Explore</span>
                    </div>
                </section>

                {/* Divider */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-white/20 to-transparent my-12"></div>

                {/* Philosophy Section */}
                <section className="relative py-24 px-6 md:px-12 max-w-[1440px] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
                        <div className="md:col-span-3 sticky top-32">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold mb-4 flex items-center gap-2">
                                <span className="w-8 h-px bg-brand-gold"></span>
                                Philosophy
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
                                We believe in capturing the raw, <span className="text-brand-gold font-sans font-bold uppercase tracking-tight">unfiltered</span> moments of the digital age. It's a memory preserved in pixels, treated with an <span className="border-b-2 border-brand-gold pb-1">editorial eye</span> and refined for the modern connoisseur.
                            </p>
                            <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-black/10 dark:border-white/10 pt-12">
                                <div>
                                    <span className="material-symbols-outlined text-4xl mb-4 text-brand-gold">blur_on</span>
                                    <h4 className="text-xl font-bold mb-3">High-Fidelity Grain</h4>
                                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Engineered noise patterns that mimic high-ISO film photography, bringing tactile warmth to digital screens.</p>
                                </div>
                                <div>
                                    <span className="material-symbols-outlined text-4xl mb-4 text-brand-gold">auto_awesome_mosaic</span>
                                    <h4 className="text-xl font-bold mb-3">Adaptive Layouts</h4>
                                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Intelligent composition algorithms that treat every session like a magazine spread layout.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Experimental Gallery Layout */}
                <section className="relative py-24 bg-surface-dark w-full overflow-hidden">
                    {/* Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-px bg-white/10"></div>
                    <div className="absolute top-0 left-1/4 w-px h-full bg-white/5"></div>
                    <div className="absolute top-0 right-1/4 w-px h-full bg-white/5"></div>

                    <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
                        <div className="mb-24 text-center">
                            <h2 className="text-[15vw] md:text-[8vw] font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent leading-none select-none pointer-events-none absolute top-0 left-0 right-0 -translate-y-1/2">Features</h2>
                            <p className="font-serif italic text-2xl text-brand-gold relative z-10">The Experience</p>
                        </div>

                        {/* Asymmetrical Grid */}
                        <div className="flex flex-col gap-32">
                            {/* Feature 1: Overlapping, Left aligned */}
                            <div className="flex flex-col md:flex-row items-center relative">
                                <div className="w-full md:w-7/12 aspect-[16/10] bg-zinc-800 rounded-lg overflow-hidden shadow-2xl relative grayscale hover:grayscale-0 transition-all duration-700 group">
                                    <div className="absolute inset-0 bg-cover bg-center transform group-hover:scale-105 transition-transform duration-1000" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuANX7sEYWP89GycPzQEDqHCUunVFxowIKNPsIpJF2-y0-AfWS-mqGJZ14QoVYLeVY5_u1dtbAxFw-6kgu6w2dqayW65MY1LIUKTz1C2WgtBOBcF_DzIVwTxnOhJ17ReECFjVmgYyEpCRdaGaiscllgT8OJllvj4Cn0FoP4WxUHBLjFWS6HIEgj01uAjtvG18orVPgW0gtt5ZJ66NuUA6WdQZly3zmZlnDas_CueiDyUbjBkBNTZlzfskSddzlsnzWpaH3q6iz_8hY9G')" }}></div>
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                </div>
                                <div className="w-full md:w-5/12 md:-ml-24 mt-8 md:mt-0 relative z-20 bg-background-light dark:bg-background-dark p-8 md:p-12 rounded-xl border border-black/5 dark:border-white/10 shadow-xl">
                                    <div className="flex items-center gap-3 mb-4 text-brand-gold">
                                        <span className="material-symbols-outlined">view_in_ar</span>
                                        <span className="text-xs font-bold uppercase tracking-widest">Immersion</span>
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">Virtual Props & Environment</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">Forget static stickers. Our booth integrates 3D-rendered assets that map to your environment in real-time.</p>
                                    <a className="inline-flex items-center gap-2 text-sm font-bold border-b border-brand-gold pb-1 hover:text-brand-gold transition-colors cursor-pointer">
                                        See Props Library <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                    </a>
                                </div>
                            </div>

                            {/* Feature 2: Overlapping, Right aligned */}
                            <div className="flex flex-col md:flex-row-reverse items-center relative">
                                <div className="w-full md:w-6/12 aspect-square md:aspect-[4/3] bg-zinc-800 rounded-lg overflow-hidden shadow-2xl relative grayscale hover:grayscale-0 transition-all duration-700 group">
                                    <div className="absolute inset-0 bg-cover bg-center transform group-hover:scale-105 transition-transform duration-1000" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBxAEV-ynoLVNcV2YNp8S6ymsE4ZO5iXsd4v7_7pECUqORtK3RWoZ6Mx4QdpFp9fdJ1MejIjHmUxtrEmZwOLfxBjG8JqNYFErB3RdUnV-to13IyWS8lLICebXi6epLyGNZwl0-ZtRD2zVX0oHJSn_sDSreSBCEgnQ9Z8p-l56QGdrxlPBvTTYA5MqlCcs_H907Yh-L09xehywhJFaw7lh2mbm1VWicB55BQ64-L_0jwRPzrTVAZSRsrITfJnookAMnZRrb-RaaYPFy8')" }}></div>
                                </div>
                                <div className="w-full md:w-5/12 md:-mr-16 mt-8 md:mt-0 relative z-20 bg-background-light dark:bg-background-dark p-8 md:p-12 rounded-xl border border-black/5 dark:border-white/10 shadow-xl text-right">
                                    <div className="flex items-center justify-end gap-3 mb-4 text-brand-gold">
                                        <span className="text-xs font-bold uppercase tracking-widest">Connectivity</span>
                                        <span className="material-symbols-outlined">share</span>
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">Instant Social Integration</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">Seamless sharing directly to Instagram Stories and TikTok with custom-generated meta tags and branding.</p>
                                    <button className="px-6 py-3 border border-slate-900 dark:border-white rounded-lg hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-sm font-bold uppercase tracking-wider">
                                        View Demo
                                    </button>
                                </div>
                            </div>

                            {/* Feature 3: Split comparison */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12">
                                <div className="relative group cursor-pointer overflow-hidden rounded-2xl">
                                    <div className="aspect-[3/4] bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-500" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAeH4oClaNFF-fCIF1LwOa8kn-zA-LlMMRBQNnCqE4fQcFt9-f4WexbRrQTYEVdaIRbsSP9Oqs3jgqXRk66C1bvCvEndgcJRSf6dnP5m7yxWyrpTt3JBmUE_L952byyhlN771nxhs7obDc1rjZSgP8uvo5_2mwZ1yz9Wn1TJLk-j1q7YnM6O72WoxMnLBAXS73VQBQRglIM9hKpQgKaMbx_VWyTTR3lMUqwdtdwsbURVXx6KfWhWYFJ6KncUsKzbWaaZ0AxaSv1eaQY')" }}></div>
                                    <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <h4 class="text-white font-bold text-xl">Custom Branding</h4>
                                        <p className="text-gray-300 text-sm mt-2">Your logo, your colors, your fonts.</p>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center px-4 md:px-12">
                                    <h3 className="text-4xl md:text-6xl font-serif italic mb-6">"Make it yours."</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-8">
                                        The interface is a white-label canvas. We strip away our identity so yours can shine. From button border-radius to loading animations, every pixel is configurable.
                                    </p>
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center text-white">
                                            <span className="material-symbols-outlined">palette</span>
                                        </div>
                                        <div className="w-12 h-12 rounded-full border border-gray-600 flex items-center justify-center text-gray-400">
                                            <span className="material-symbols-outlined">code</span>
                                        </div>
                                        <div className="w-12 h-12 rounded-full border border-gray-600 flex items-center justify-center text-gray-400">
                                            <span className="material-symbols-outlined">rocket_launch</span>
                                        </div>
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
                                Book a Consultation
                            </button>
                            <button className="border border-slate-900 dark:border-white/30 hover:border-white text-slate-900 dark:text-white px-8 py-4 rounded-lg text-sm font-bold uppercase tracking-widest transition-all">
                                Download Media Kit
                            </button>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-[#050505] text-white pt-24 pb-12 border-t border-white/5">
                    <div className="max-w-[1440px] mx-auto px-6 md:px-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-12">
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="material-symbols-outlined text-brand-gold">shutter_speed</span>
                                    <span className="font-bold tracking-[0.2em] uppercase">The After Hours</span>
                                </div>
                                <p className="text-gray-500 max-w-xs text-sm leading-relaxed">
                                    A product of editorial design thinking applied to event technology. <br />Based in Jakarta.
                                </p>
                            </div>
                            <a className="text-3xl md:text-5xl font-serif hover:text-brand-gold transition-colors border-b border-transparent hover:border-brand-gold pb-2" href="mailto:hello@theafterhours.com">
                                hello@theafterhours.com
                            </a>
                        </div>
                        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-xs text-gray-600">
                            <p>© 2025 The After Hours Inc. All rights reserved.</p>
                            <p className="font-mono mt-2 md:mt-0">DESIGNED FOR THE BOLD</p>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default AboutPage;
