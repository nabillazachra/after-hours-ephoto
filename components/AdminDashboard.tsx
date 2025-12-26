import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { database as db } from '../services/database';
import { AppStep, Session, Template, Transaction } from '../types';
import { Icons } from '../constants';
import TemplateManager from './admin/TemplateManager';

import Modal from './ui/Modal';

// --- MAIN DASHBOARD COMPONENT ---
const AdminDashboard: React.FC = () => {
    const { state, dispatch } = useStore();
    const navigate = useNavigate();

    // Replaced single string PIN with segmented 4-digit logic
    const [pinDigits, setPinDigits] = useState(['', '', '', '']);
    const [isError, setIsError] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [authorized, setAuthorized] = useState(false);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [activeTab, setActiveTab] = useState<'STATS' | 'TEMPLATES' | 'GALLERY' | 'TRANSACTIONS'>('STATS');
    const [isDesigning, setIsDesigning] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Sidebar Toggle
    const [isLoading, setIsLoading] = useState(false);

    // --- MODAL STATE ---
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: '',
        message: '',
        action: () => { },
        confirmText: 'Confirm',
        isDestructive: false
    });

    const openModal = (title: string, message: string, action: () => void, isDestructive = false, confirmText = "Confirm") => {
        setModalConfig({ title, message, action, confirmText, isDestructive });
        setModalOpen(true);
    };

    // Auto-fetch if already authorized (e.g. fast refresh during dev)
    useEffect(() => {
        if (authorized) {
            fetchData();
        }
    }, [authorized]);

    const handleDigitChange = (index: number, value: string) => {
        if (isError) setIsError(false);

        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        // Take the last character if multiple were pasted
        const digit = value.slice(-1);

        const newDigits = [...pinDigits];
        newDigits[index] = digit;
        setPinDigits(newDigits);

        // Auto-advance focus
        if (digit && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (isError) setIsError(false);

        if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
            // Backspace on empty input moves focus back
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    const handleLogin = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const pin = pinDigits.join('');

        if (pin === '1234') {
            setAuthorized(true);
            // fetchData called via useEffect dependency on authorized
        } else {
            setIsError(true);
            setPinDigits(['', '', '', '']);
            inputRefs.current[0]?.focus();
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [s, t, tx] = await Promise.all([
                db.getSessions(),
                db.getAllTemplates(), // Get all, including inactive
                db.getTransactions()
            ]);
            setSessions(s);
            setTemplates(t);
            setTransactions(tx);
        } catch (err) {
            console.error("Failed to fetch admin data", err);
        } finally {
            setIsLoading(false);
        }
    }

    const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation(); // CRITICAL: Stop propagation so we don't trigger container clicks
        openModal(
            "Delete Session",
            "Are you sure you want to delete this session? This action is irreversible.",
            async () => {
                await db.deleteSession(sessionId);
                // Optimistic update
                setSessions(prev => prev.filter(s => s.id !== sessionId));
            },
            true,
            "Delete"
        );
    };

    const handleEditTemplate = (e: React.MouseEvent, template: Template) => {
        e.stopPropagation();
        setEditingTemplate(template);
        setIsDesigning(true);
    };

    const handleDeleteTemplate = async (e: React.MouseEvent, template: Template) => {
        e.stopPropagation(); // CRITICAL: Stop propagation

        console.log("Requesting delete for:", template.id, "Active:", template.active);

        // LOGIC: If active -> Deactivate (Soft Delete). If inactive -> Permanent Delete (Hard Delete).
        if (template.active) {
            openModal(
                "Deactivate Template",
                "This template will be hidden from the client selection screen.",
                async () => {
                    console.log("Deactivating template...");
                    await db.updateTemplate(template.id, { active: false });
                    console.log("Template deactivated. Refreshing...");
                    await fetchData();
                },
                true,
                "Deactivate"
            );
        } else {
            openModal(
                "Permanently Delete",
                "PERMANENTLY DELETE this template? This cannot be undone.",
                async () => {
                    console.log("Permissions check? Deleting template permanently:", template.id);
                    try {
                        await db.deleteTemplate(template.id);
                        console.log("Delete successful. Refreshing...");
                        await fetchData();
                    } catch (err) {
                        console.error("Delete Action Failed:", err);
                        alert("Delete failed. Check console for details.");
                    }
                },
                true,
                "Delete Forever"
            );
        }
    };

    const handleRunCleanup = async () => {
        openModal(
            "Run Retention Cleanup",
            "Run retention cleanup manually? This will delete files for sessions older than 24 hours.",
            async () => {
                setIsLoading(true);
                try {
                    const count = await db.cleanupOldSessions();
                    alert(`Cleanup Complete. ${count} sessions were processed.`);
                    fetchData();
                } catch (e) {
                    console.error(e);
                    alert("Cleanup failed.");
                } finally {
                    setIsLoading(false);
                }
            },
            false,
            "Run Cleanup"
        );
    };

    if (!authorized) {
        const logoSrc = state.isDarkMode
            ? "/logo-light.png" // Dark Mode Asset (White Text)
            : "/logo-dark.png"; // Light Mode Asset (Black Text)

        return (
            <div className="flex h-full min-h-screen flex-col relative overflow-hidden bg-zinc-50 dark:bg-[#050505] text-brand-black dark:text-white font-sans selection:bg-brand-blue selection:text-white transition-colors duration-500">

                {/* CSS for Shake */}
                <style>{`
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            .animate-shake {
                animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
            }
        `}</style>

                {/* Noise Overlay */}
                <div
                    className="fixed inset-0 pointer-events-none z-0 opacity-[0.05]"
                    style={{ backgroundImage: `url(https://lh3.googleusercontent.com/aida-public/AB6AXuCZ6QwBwtpj9_5Mdq_zfLyGLWh56wxef748P9x3tjDO0SF8vge6e2iN2QT5l3zRF1fybjm5G483DHDmdUwIkR0v82Xj8tvqRvKnHEZ5owmYvspKd-1kTPA6zbXu0oFDU9IBIIJKHNyy-ymkJZIejJVHs-PUFoNvhPzArbWpro_FPFjdTH6mAIBpeth2venSNchnztZF0HG2z1wzzUB2LBWt-O7pGvBc49fEx573DPARjvbQBLApPTuFKao4McggtmtOBkGWvAhZYZQe)` }}
                />

                {/* Header */}
                <header className="absolute top-0 left-0 w-full p-8 z-20 flex justify-between items-start">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <img
                            src={logoSrc}
                            alt="After Hours Logo"
                            className="h-24 w-auto object-contain drop-shadow-sm"
                        />
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
                        className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-brand-black dark:text-white"
                        aria-label="Toggle Theme"
                    >
                        {state.isDarkMode ? <Icons.Sun size={20} /> : <Icons.Moon size={20} />}
                    </button>
                </header>

                {/* Main Content */}
                <main className="flex-grow flex flex-col items-center justify-center relative z-10 w-full px-6 animate-fade-in-up">
                    <div className="w-full max-w-lg flex flex-col gap-12 sm:gap-16">

                        {/* Headline */}
                        <div className="text-center">
                            <h2 className="text-zinc-500 dark:text-zinc-400 text-xs font-bold tracking-[0.4em] uppercase mb-2">Restricted Access</h2>
                            <h3 className="text-brand-black dark:text-white text-3xl sm:text-4xl font-black tracking-tight">ENTER PIN</h3>
                        </div>

                        {/* PIN Inputs */}
                        <div className="flex justify-center w-full relative">
                            <fieldset className={`flex gap-2 sm:gap-4 group ${isError ? 'animate-shake' : ''}`}>
                                {pinDigits.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        ref={(el) => { inputRefs.current[idx] = el; }}
                                        type="password" // MASKED PIN
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        autoFocus={idx === 0}
                                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(idx, e)}
                                        className={`
                                    flex h-16 w-12 sm:h-24 sm:w-16 bg-transparent text-center focus:outline-none focus:ring-0 border-b-2 
                                    text-3xl sm:text-5xl font-mono transition-all duration-300 placeholder-transparent
                                    ${isError
                                                ? 'border-red-500 text-red-500 placeholder-red-500 animate-pulse'
                                                : 'border-zinc-300 dark:border-zinc-800 focus:border-brand-blue dark:focus:border-brand-gold text-brand-black dark:text-white'
                                            }
                                `}
                                        placeholder="0"
                                    />
                                ))}
                            </fieldset>
                        </div>

                        {/* Error Message */}
                        <div className={`h-6 text-center -mt-6 transition-opacity duration-300 ${isError ? 'opacity-100' : 'opacity-0'}`}>
                            <p className="text-red-500 font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2">
                                <Icons.X size={14} weight="bold" /> Access Denied
                            </p>
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={() => handleLogin()}
                                className="group relative overflow-hidden rounded-lg bg-brand-black dark:bg-white text-white dark:text-black h-14 w-full sm:w-64 px-8 text-sm font-black tracking-[0.15em] leading-normal uppercase transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Unlock Portal
                                    <Icons.ArrowUpRight className="text-lg transition-transform duration-300 group-hover:translate-x-1" weight="bold" />
                                </span>
                                {/* Hover Gradient Effect */}
                                <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                            </button>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="absolute bottom-0 w-full p-8 z-20 flex justify-between items-end pointer-events-none">
                    <div className="hidden sm:block">
                        <div className="h-px w-12 bg-zinc-300 dark:bg-zinc-700 mb-2"></div>
                        <div className="h-px w-6 bg-zinc-300 dark:bg-zinc-700"></div>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-right">
                        <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 mb-1">
                            <Icons.Lock size={14} />
                            <span className="text-[10px] font-mono tracking-widest uppercase">Secure Environment</span>
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-600 text-[10px] font-bold tracking-widest uppercase">Admin V.1.0 // System Active</p>
                    </div>
                </footer>

            </div>
        );
    }

    const totalRevenue = transactions
        .filter(t => t.status === 'PAID')
        .reduce((sum, t) => sum + t.amount, 0);

    if (isDesigning) {
        return (
            <div className="h-full w-full absolute inset-0 z-50">
                <TemplateManager
                    initialTemplate={editingTemplate}
                    onCancel={() => {
                        setIsDesigning(false);
                        setEditingTemplate(null);
                    }}
                    onSaveSuccess={() => {
                        setIsDesigning(false);
                        setEditingTemplate(null);
                        fetchData();
                    }}
                />
            </div>
        )
    }

    // --- NEW DASHBOARD LAYOUT (Authorized) ---
    return (
        <div className="flex h-screen w-full bg-[#050505] text-white overflow-hidden font-sans selection:bg-white selection:text-black relative">

            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm animate-fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
            fixed inset-y-0 left-0 z-50 w-72 h-full border-r border-white/10 bg-[#050505] flex flex-col transition-transform duration-300 ease-in-out
            lg:relative lg:translate-x-0 
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
                <div className="p-8 pb-12 flex justify-between items-start lg:block">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white uppercase">THE AFTER HOURS</h1>
                        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] mt-2">Admin Console</p>
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden text-zinc-500 hover:text-white transition-colors"
                    >
                        <Icons.X size={24} />
                    </button>
                </div>
                <nav className="flex-1 flex flex-col gap-2 px-6">
                    {[
                        { id: 'STATS', label: 'Dashboard', icon: Icons.Aperture },
                        { id: 'TEMPLATES', label: 'Templates', icon: Icons.Faders },
                        { id: 'GALLERY', label: 'Gallery', icon: Icons.Camera },
                        { id: 'TRANSACTIONS', label: 'Transactions', icon: Icons.Envelope },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id as any);
                                setIsSidebarOpen(false); // Close on selection for mobile
                            }}
                            className={`group flex items-center gap-4 px-4 py-3 rounded-sm transition-all text-left ${activeTab === item.id
                                ? 'bg-white/10 border border-white/5 text-white'
                                : 'hover:bg-white/5 border border-transparent hover:border-white/5 text-zinc-500 hover:text-white'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 transition-colors ${activeTab === item.id ? 'text-white' : 'text-zinc-500 group-hover:text-white'}`} weight={activeTab === item.id ? 'fill' : 'regular'} />
                            <span className="text-sm font-medium tracking-wide">{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-6 mt-auto border-t border-white/5">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-red-500/50 hover:bg-red-500/10 group transition-all duration-300"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                                <Icons.Lock size={14} className="text-zinc-400 group-hover:text-red-500 transition-colors" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-xs font-bold text-white group-hover:text-red-100">ADMIN ACCESS</span>
                                <span className="text-[10px] text-zinc-500 group-hover:text-red-400">Tap to Logout</span>
                            </div>
                        </div>
                        <Icons.SignOut size={18} className="text-zinc-600 group-hover:text-red-500 transition-colors" />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-y-auto relative bg-[#050505]">
                <div className="flex-1 max-w-[1600px] w-full mx-auto p-6 md:p-12 lg:p-16 flex flex-col gap-12">

                    {/* Header */}
                    <header className="flex flex-col gap-6 pb-6 border-b border-white/10">
                        {/* Top Row for Mobile Toggle + Content */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="flex items-start gap-4">
                                {/* Hamburger Menu Trigger */}
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="lg:hidden mt-1 text-zinc-400 hover:text-white transition-colors"
                                >
                                    <Icons.List size={32} />
                                </button>

                                <div className="flex flex-col gap-2">
                                    <p className="text-zinc-500 uppercase tracking-[0.15em] text-xs font-medium">Analytics & Performance</p>
                                    <h2 className="text-3xl md:text-5xl font-light text-white tracking-tight">
                                        {activeTab === 'STATS' && "Stats Overview"}
                                        {activeTab === 'TEMPLATES' && "Template Management"}
                                        {activeTab === 'GALLERY' && "Session Gallery"}
                                        {activeTab === 'TRANSACTIONS' && "Transaction History"}
                                    </h2>
                                </div>
                            </div>

                            {/* Refresh & Tools */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleRunCleanup}
                                    className="flex items-center gap-2 px-4 py-2 border border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 text-xs font-bold uppercase tracking-widest rounded-sm transition-all"
                                    title="Run 24h retention cleanup"
                                >
                                    <Icons.Lightning /> Cleanup
                                </button>
                                <button
                                    onClick={fetchData}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-4 py-2 border border-zinc-700 hover:bg-zinc-800 hover:text-white text-zinc-400 text-xs font-bold uppercase tracking-widest rounded-sm transition-all"
                                >
                                    {isLoading ? <Icons.Aperture className="animate-spin" /> : <Icons.Aperture />}
                                    {isLoading ? "Refreshing..." : "Refresh Data"}
                                </button>

                                <div className="relative w-full md:w-auto min-w-[200px] hidden md:block">
                                    <div className="relative group">
                                        <select className="appearance-none bg-transparent text-white pl-0 pr-8 py-2 border-b border-white/20 hover:border-white/50 focus:border-white focus:outline-none w-full text-sm font-medium tracking-wide cursor-pointer transition-colors rounded-none">
                                            <option className="bg-[#050505]">October 2023</option>
                                            <option className="bg-[#050505]">Year to Date</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-zinc-500 group-hover:text-white transition-colors">
                                            <Icons.CaretLeft className="-rotate-90" size={14} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* --- STATS VIEW (Dashboard) --- */}
                    {activeTab === 'STATS' && (
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10 overflow-hidden rounded-sm">
                            {/* Metric 1: Total Sessions */}
                            <div className="relative bg-[#050505] p-8 md:p-12 group hover:bg-white/[0.02] transition-colors duration-500">
                                <div className="flex flex-col h-full justify-between gap-8 min-h-[280px]">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-zinc-500 uppercase tracking-[0.15em] text-xs font-medium">Total Sessions</h3>
                                        <div className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-sm">
                                            <Icons.ArrowUpRight size={12} weight="bold" />
                                            <span className="text-xs font-medium tracking-wide">12%</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-7xl md:text-8xl lg:text-9xl font-light text-white tracking-tighter leading-none">{sessions.length}</span>
                                        <p className="text-zinc-500 text-sm mt-4 font-light tracking-wide">vs. {Math.round(sessions.length * 0.8)} last month</p>
                                    </div>
                                    {/* Decorative Bar Sparkline */}
                                    <div className="h-12 w-full flex items-end gap-1 opacity-40 group-hover:opacity-60 transition-opacity">
                                        {[20, 35, 50, 45, 60, 80, 70, 90].map((h, i) => (
                                            <div
                                                key={i}
                                                className={`w-full rounded-sm ${i === 7 ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'bg-white/20'}`}
                                                style={{ height: `${h}%` }}
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Metric 2: Estimated Revenue */}
                            <div className="relative bg-[#050505] p-8 md:p-12 group hover:bg-white/[0.02] transition-colors duration-500">
                                <div className="flex flex-col h-full justify-between gap-8 min-h-[280px]">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-zinc-500 uppercase tracking-[0.15em] text-xs font-medium">Estimated Revenue</h3>
                                        <div className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-sm">
                                            <Icons.ArrowUpRight size={12} weight="bold" />
                                            <span className="text-xs font-medium tracking-wide">8%</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-7xl md:text-8xl lg:text-9xl font-light text-white tracking-tighter leading-none">
                                            ${(totalRevenue / 1000).toFixed(1)}k
                                        </span>
                                        <p className="text-zinc-500 text-sm mt-4 font-light tracking-wide">vs. ${(totalRevenue * 0.9 / 1000).toFixed(1)}k last month</p>
                                    </div>
                                    {/* Decorative Line Graph */}
                                    <div className="h-12 w-full opacity-40 group-hover:opacity-60 transition-opacity">
                                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 200 50">
                                            <defs>
                                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 0.2 }} />
                                                    <stop offset="100%" style={{ stopColor: 'white', stopOpacity: 0.8 }} />
                                                </linearGradient>
                                            </defs>
                                            <path d="M0,45 C20,40 40,48 60,35 C80,22 100,40 120,25 C140,10 160,20 200,5" fill="none" stroke="url(#gradient)" strokeWidth="1.5" />
                                            <circle cx="200" cy="5" fill="white" r="2" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* --- TEMPLATES VIEW --- */}
                    {activeTab === 'TEMPLATES' && (
                        <div className="space-y-8">
                            <div
                                onClick={() => {
                                    setEditingTemplate(null);
                                    setIsDesigning(true);
                                }}
                                className="border border-dashed border-zinc-700 p-8 flex flex-col items-center justify-center text-zinc-500 hover:border-white hover:text-white transition-all cursor-pointer group bg-[#050505]"
                            >
                                <div className="p-4 rounded-full mb-4 bg-zinc-900 group-hover:bg-white group-hover:text-black transition-colors">
                                    <Icons.Download className="rotate-180" size={24} />
                                </div>
                                <span className="font-bold tracking-widest text-sm">CREATE NEW TEMPLATE</span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {templates.map(t => (
                                    <div key={t.id} className={`group relative bg-zinc-900 border ${t.active ? 'border-zinc-800' : 'border-red-900/50'} overflow-hidden transition-all hover:border-zinc-600`}>
                                        {!t.active && (
                                            <div className="absolute top-2 right-2 z-30 bg-red-900/80 text-white text-[9px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">Inactive</div>
                                        )}
                                        <div className="aspect-[3/4] relative bg-black/50 p-6">
                                            <img src={t.imageUrl} className={`w-full h-full object-contain relative z-10 transition-opacity ${!t.active ? 'opacity-40 grayscale' : 'opacity-90'}`} alt={t.name} />
                                        </div>

                                        {/* Action Overlay */}
                                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity z-40 flex flex-col items-center justify-center gap-3">
                                            <button
                                                onClick={(e) => handleEditTemplate(e, t)}
                                                className="px-4 py-2 bg-white text-black text-xs font-bold tracking-widest uppercase hover:bg-zinc-200"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteTemplate(e, t)}
                                                className="px-4 py-2 border border-red-500 text-red-500 text-xs font-bold tracking-widest uppercase hover:bg-red-500 hover:text-white"
                                            >
                                                {t.active ? "Deactivate" : "Delete"}
                                            </button>
                                        </div>

                                        <div className="p-4 border-t border-zinc-800 bg-[#080808]">
                                            <p className="text-sm font-medium text-white truncate">{t.name}</p>
                                            <p className="text-[10px] text-zinc-500 font-mono mt-1">{t.layout.width}x{t.layout.height}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- GALLERY VIEW --- */}
                    {activeTab === 'GALLERY' && (
                        <div className="space-y-4">
                            {sessions.length === 0 ? (
                                <div className="p-12 text-center border border-dashed border-zinc-800 rounded-sm">
                                    <Icons.Camera className="mx-auto text-zinc-600 mb-4" size={48} />
                                    <p className="text-zinc-500">No sessions recorded yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {sessions.map(s => {
                                        // CHECK RETENTION STATUS
                                        if (s.isFilesDeleted) {
                                            return (
                                                <div key={s.id} className="relative bg-zinc-950 border border-zinc-800 aspect-[3/4] overflow-hidden flex flex-col items-center justify-center p-4">
                                                    <div className="text-zinc-700 mb-2">
                                                        <Icons.X size={32} />
                                                    </div>
                                                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center">Expired</span>
                                                    <span className="text-[9px] text-zinc-700 font-mono mt-2">{new Date(s.createdAt).toLocaleDateString()}</span>

                                                    <div className="absolute top-2 right-2">
                                                        <button
                                                            onClick={(e) => handleDeleteSession(e, s.id)}
                                                            className="text-zinc-700 hover:text-red-500"
                                                        >
                                                            <Icons.X size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // Determine fallback image source if finalUrl is missing
                                        const imgSrc = s.finalUrl && s.finalUrl.length > 5
                                            ? s.finalUrl
                                            : (s.photos && s.photos.length > 0 ? s.photos[0] : null);

                                        return (
                                            <div key={s.id} className="relative group bg-zinc-900 border border-zinc-800 aspect-[3/4] overflow-hidden flex items-center justify-center">
                                                {imgSrc ? (
                                                    <img
                                                        src={imgSrc}
                                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity"
                                                        alt="Session"
                                                        onError={(e) => {
                                                            // Fallback on error
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.parentElement?.classList.add('bg-red-900/20');
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center text-zinc-600 gap-2">
                                                        <Icons.Camera size={24} />
                                                        <span className="text-[9px] uppercase tracking-widest">No Image</span>
                                                    </div>
                                                )}

                                                <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-[1px]">
                                                    <div className="flex justify-end">
                                                        <button
                                                            onClick={(e) => handleDeleteSession(e, s.id)}
                                                            className="p-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-colors rounded-sm"
                                                        >
                                                            <Icons.X size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[10px] text-zinc-400 font-mono mb-3">{new Date(s.createdAt).toLocaleString()}</p>
                                                        {imgSrc && (
                                                            <a
                                                                href={imgSrc}
                                                                download={`Session_${s.id}.jpg`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-200"
                                                            >
                                                                Download
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- TRANSACTIONS VIEW --- */}
                    {activeTab === 'TRANSACTIONS' && (
                        <div className="border border-white/10 rounded-sm overflow-hidden overflow-x-auto">
                            <table className="w-full text-left text-sm min-w-[600px]">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/10">
                                        <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-zinc-500">Transaction ID</th>
                                        <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-zinc-500">Date</th>
                                        <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-zinc-500">Session ID</th>
                                        <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-zinc-500">Amount</th>
                                        <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-zinc-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 bg-[#050505]">
                                    {transactions.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-600 font-mono text-xs">No transactions recorded.</td></tr>
                                    ) : (
                                        transactions.map(tx => (
                                            <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-white/70">{tx.id}</td>
                                                <td className="px-6 py-4 text-zinc-400">{new Date(tx.createdAt).toLocaleString()}</td>
                                                <td className="px-6 py-4 font-mono text-xs text-zinc-600">{tx.sessionId}</td>
                                                <td className="px-6 py-4 font-medium text-white">IDR {tx.amount.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-sm text-[10px] uppercase font-bold tracking-wide ${tx.status === 'PAID' ? 'bg-green-500/10 text-green-400' :
                                                        tx.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400' :
                                                            'bg-red-500/10 text-red-400'
                                                        }`}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </main>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalConfig.title}
                confirmText={modalConfig.confirmText}
                onConfirm={modalConfig.action}
                isDestructive={modalConfig.isDestructive}
            >
                {modalConfig.message}
            </Modal>
        </div>
    );
};

export default AdminDashboard;