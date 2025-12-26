import React from 'react';
import { useStore } from '../store';
import { AppStep } from '../types';
import { Icons } from '../constants';

const Footer: React.FC = () => {
  const { dispatch } = useStore();

  const handleNavClick = () => {
    dispatch({ type: 'SET_STEP', payload: AppStep.TEMPLATE_SELECTION });
  };

  return (
    <footer id="footer-section" className="w-full bg-white dark:bg-brand-black text-brand-black dark:text-white border-t border-zinc-200 dark:border-white/10 relative transition-colors duration-500">
      <div className="w-full px-6 py-24 md:px-16 md:py-32 lg:px-32 lg:py-48 flex flex-col min-h-[500px] justify-between relative max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 w-full h-full flex-grow">
          {/* Left Column: Navigation */}
          <div className="md:col-span-5 flex flex-col justify-start pt-10 md:pt-0">
            <nav className="flex flex-col gap-8 md:gap-10 items-start">
              <button
                onClick={() => dispatch({ type: 'SET_STEP', payload: AppStep.ABOUT })}
                className="group relative inline-block text-sm md:text-base font-bold tracking-[0.15em] text-zinc-500 dark:text-zinc-400 hover:text-brand-blue dark:hover:text-white transition-colors duration-500 ease-out"
              >
                <span className="relative z-10">ABOUT</span>
                <span className="absolute left-0 -bottom-2 w-0 h-[1px] bg-brand-blue dark:bg-white transition-all duration-700 ease-out group-hover:w-full opacity-50"></span>
              </button>
              <button
                onClick={handleNavClick}
                className="group relative inline-block text-sm md:text-base font-bold tracking-[0.15em] text-zinc-500 dark:text-zinc-400 hover:text-brand-blue dark:hover:text-white transition-colors duration-500 ease-out md:ml-12 lg:ml-16"
              >
                <span className="relative z-10">TEMPLATE</span>
                <span className="absolute left-0 -bottom-2 w-0 h-[1px] bg-brand-blue dark:bg-white transition-all duration-700 ease-out group-hover:w-full opacity-50"></span>
              </button>
              <button
                onClick={handleNavClick}
                className="group relative inline-block text-sm md:text-base font-bold tracking-[0.15em] text-zinc-500 dark:text-zinc-400 hover:text-brand-blue dark:hover:text-white transition-colors duration-500 ease-out md:ml-12 lg:ml-16"
              >
                <span className="relative z-10">TAKE NOW</span>
                <span className="absolute left-0 -bottom-2 w-0 h-[1px] bg-brand-blue dark:bg-white transition-all duration-700 ease-out group-hover:w-full opacity-50"></span>
              </button>
            </nav>
          </div>

          {/* Center Column: Divider */}
          <div className="hidden md:block md:col-span-4 relative">
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-zinc-200 dark:bg-white/5"></div>
          </div>

          {/* Right Column: Icons & Decorative */}
          <div className="md:col-span-3 flex flex-col justify-between h-full min-h-[200px] md:items-end">
            <div className="flex gap-8 items-center md:justify-end">
              <a
                href="https://www.linkedin.com/in/nabilla-zachra"
                target="_blank"
                rel="noopener noreferrer"
                className="group text-zinc-400 dark:text-zinc-500 hover:text-brand-blue dark:hover:text-white transition-colors duration-500"
              >
                <Icons.LinkedIn className="w-7 h-7 group-hover:scale-110 transition-transform duration-500" weight="light" />
              </a>
              <a
                href="mailto:nabillazachra14@gmail.com"
                className="group text-zinc-400 dark:text-zinc-500 hover:text-brand-blue dark:hover:text-white transition-colors duration-500"
              >
                <Icons.Envelope className="w-7 h-7 group-hover:scale-110 transition-transform duration-500" weight="light" />
              </a>
            </div>

            {/* Decorative Gradient Line */}
            <div className="hidden md:flex flex-grow flex-col items-end justify-center py-12 opacity-20">
              <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-brand-blue dark:via-white to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between w-full mt-24 pt-8 border-t border-zinc-200 dark:border-white/5">
          <div className="mb-6 md:mb-0 order-2 md:order-1">
            <span className="font-display font-medium text-[10px] tracking-[0.3em] text-zinc-400 dark:text-zinc-500 uppercase block mb-1">
              Photobooth Collective
            </span>
            <span className="font-display font-semibold text-xs tracking-[0.2em] text-brand-blue dark:text-white uppercase">
              After Hours
            </span>
          </div>
          <p className="text-zinc-400 dark:text-zinc-600 text-[10px] md:text-xs font-light tracking-wide order-1 md:order-2 mb-6 md:mb-0">
            © 2024 After Hours. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;