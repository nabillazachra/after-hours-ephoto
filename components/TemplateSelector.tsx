import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { database as db } from '../services/database';
import { Template, AppStep } from '../types';
import { Icons } from '../constants';

// Curated list of high-end, editorial style placeholder images for the "After Hours" aesthetic
const AESTHETIC_PLACEHOLDERS = [
    'https://images.unsplash.com/photo-1617388939638-349f43c3f9a7?auto=format&fit=crop&q=80&w=800', // Flash B&W
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800', // Classic Portrait
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800', // Emotional
    'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?auto=format&fit=crop&q=80&w=800', // Party Flash
    'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&q=80&w=800', // Fashion
    'https://images.unsplash.com/photo-1620553330116-251f4c26415a?auto=format&fit=crop&q=80&w=800', // Blur
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800', // Fashion 2
    'https://images.unsplash.com/photo-1611558709796-ca5687958892?auto=format&fit=crop&q=80&w=800', // Editorial
];

const ImageWithLoader: React.FC<{ src: string, alt: string, className?: string, imgClassName?: string }> = ({ src, alt, className, imgClassName }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    return (
        <div className={`relative overflow-hidden ${className}`}>
            {!isLoaded && (
                 <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-800 animate-pulse flex items-center justify-center z-20">
                    <div className="relative">
                        <Icons.Aperture className="text-zinc-300 dark:text-zinc-700 animate-spin-slow opacity-20" size={32} />
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-brand-blue/10 dark:via-brand-gold/10 to-transparent animate-pulse"></div>
                    </div>
                 </div>
            )}
            <img 
                src={src} 
                alt={alt} 
                className={`transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'} w-full h-full object-cover ${imgClassName || ''}`}
                onLoad={() => setIsLoaded(true)}
            />
        </div>
    );
};

const TemplateSelector: React.FC = () => {
  const { dispatch } = useStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    db.getTemplates().then((data) => {
      setTemplates(data);
      setLoading(false);
    });
  }, []);

  const handleSelect = (template: Template) => {
    setSelectedId(template.id);
    // Flash effect delay before transition
    setTimeout(() => {
        dispatch({ type: 'SET_TEMPLATE', payload: template });
        dispatch({ type: 'SET_STEP', payload: AppStep.PAYMENT_GATE }); 
    }, 400);
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full max-w-6xl mx-auto p-6 animate-fade-in relative z-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div className="group cursor-default">
            <h2 className="text-3xl font-extrabold text-brand-blue dark:text-brand-white tracking-tighter relative inline-block pb-1">
                SELECT FRAME
                <span className="absolute left-0 bottom-0 w-0 h-1 bg-brand-gold transition-all duration-500 ease-out group-hover:w-full"></span>
            </h2>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
             {/* Search Input */}
            <div className="relative w-full md:w-64 group">
                <input 
                    type="text" 
                    placeholder="Search templates..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-2 pl-0 pr-8 text-sm focus:outline-none focus:border-brand-blue dark:focus:border-brand-gold transition-colors text-brand-black dark:text-white placeholder-zinc-400 font-medium"
                />
                <div className="absolute right-0 top-2 text-zinc-400 group-focus-within:text-brand-blue dark:group-focus-within:text-brand-gold transition-colors">
                    <Icons.Aperture size={16} />
                </div>
            </div>

            <button 
                onClick={() => dispatch({ type: 'SET_STEP', payload: AppStep.LANDING })}
                className="text-zinc-400 hover:text-brand-blue dark:text-zinc-500 dark:hover:text-white transition-colors"
            >
                <Icons.X size={32} />
            </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 min-h-[400px]">
           {/* BRANDED LOADING ANIMATION */}
          <div className="relative w-20 h-20 flex items-center justify-center">
             <div className="absolute inset-0 bg-brand-blue/10 dark:bg-white/5 rounded-full blur-xl animate-pulse"></div>
             <Icons.Aperture 
                size={64} 
                className="text-brand-blue dark:text-white animate-spin-slow opacity-80" 
                weight="fill"
             />
             <div className="absolute inset-0 border-2 border-brand-blue/20 dark:border-brand-gold/20 rounded-full animate-ping"></div>
          </div>
          <p className="text-xs font-mono tracking-[0.3em] text-brand-blue dark:text-brand-gold font-bold animate-pulse">LOADING COLLECTION...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-y-auto pb-20 scrollbar-hide px-2">
          {filteredTemplates.map((template, idx) => (
            <div 
              key={template.id}
              onClick={() => handleSelect(template)}
              className={`
                group relative aspect-[3/4] cursor-pointer 
                bg-zinc-100 dark:bg-zinc-900 
                border border-zinc-200 dark:border-zinc-800 
                hover:border-brand-blue dark:hover:border-brand-gold 
                transition-all duration-500 ease-out
                hover:scale-[1.02] hover:shadow-2xl dark:hover:shadow-[0_0_30px_rgba(212,175,55,0.1)]
                overflow-hidden
                ${selectedId === template.id ? 'ring-4 ring-brand-blue dark:ring-brand-gold scale-[0.98]' : ''}
              `}
            >
              {/* Flash Overlay Effect */}
              <div className={`absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-300 ease-out ${selectedId === template.id ? 'opacity-100' : 'opacity-0'}`}></div>

              {/* Template Preview - Dynamic Editorial Placeholders */}
              <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-800">
                  <ImageWithLoader 
                    src={AESTHETIC_PLACEHOLDERS[idx % AESTHETIC_PLACEHOLDERS.length]}
                    alt="Preview Background"
                    className="w-full h-full grayscale opacity-60 group-hover:opacity-80 transition-all duration-1000 ease-in-out"
                    imgClassName="group-hover:scale-110 transition-transform duration-1000 ease-in-out"
                  />
                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* The Actual Template Overlay */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                 {/* Use contain to ensure the whole template is visible without cutting off text */}
                 <ImageWithLoader src={template.imageUrl} alt={template.name} className="w-full h-full" imgClassName="object-contain p-4" />
              </div>
              
              {/* Card Footer Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex justify-between items-end translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                <div>
                    <p className="text-white/60 text-[10px] tracking-widest uppercase mb-1 font-mono">{template.layout.width} x {template.layout.height}</p>
                    <p className="text-xl font-black text-white italic tracking-tight">{template.name}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-brand-blue dark:bg-brand-gold text-white dark:text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-8 group-hover:translate-x-0">
                    <Icons.ArrowUpRight weight="bold" size={20} />
                </div>
              </div>
            </div>
          ))}

          {filteredTemplates.length === 0 && (
              <div className="col-span-full py-20 text-center flex flex-col items-center text-zinc-400">
                  <Icons.Aperture size={48} className="mb-4 opacity-20" />
                  <p className="font-bold">NO TEMPLATES FOUND</p>
                  <p className="text-sm">Try a different search term.</p>
              </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;