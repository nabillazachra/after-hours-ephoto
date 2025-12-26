import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../store';
import { AppStep, Transaction } from '../types';
import { SESSION_LIMIT_FREE, SESSION_PRICE, Icons } from '../constants';
import { database as db } from '../services/database';

const PaymentGate: React.FC = () => {
  const { state, dispatch } = useStore();
  const [currentTx, setCurrentTx] = useState<Transaction | null>(null);
  const [isPooling, setIsPooling] = useState(false);
  const isFreeTier = state.sessionCount < SESSION_LIMIT_FREE;
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1. Handle Free Tier Bypass
  useEffect(() => {
    if (isFreeTier) {
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_STEP', payload: AppStep.CAMERA });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isFreeTier, dispatch]);

  // 2. Initialize Transaction for Paid Tier
  useEffect(() => {
    const initTransaction = async () => {
      if (!isFreeTier && !currentTx) {
        setIsPooling(true);
        const tx = await db.createTransaction(SESSION_PRICE);
        setCurrentTx(tx);
      }
    };
    initTransaction();
  }, [isFreeTier, currentTx]);

  // 3. Polling Logic (The heartbeat of payment confirmation)
  useEffect(() => {
    if (!currentTx || currentTx.status === 'PAID') return;

    pollInterval.current = setInterval(async () => {
      const status = await db.checkTransactionStatus(currentTx.id);
      
      if (status === 'PAID') {
        if (pollInterval.current) clearInterval(pollInterval.current);
        setIsPooling(false);
        // Payment confirmed, move to camera
        dispatch({ type: 'SET_STEP', payload: AppStep.CAMERA });
      }
    }, 3000); // Poll every 3 seconds

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [currentTx, dispatch]);

  const handleSimulatePayment = async () => {
    if (!currentTx) return;
    dispatch({ type: 'SET_PROCESSING_PAYMENT', payload: true });
    
    // In a real app, this button wouldn't exist for the user.
    // Here, we manually trigger the "webhook" on the server side.
    // The polling interval (useEffect above) will catch the status change.
    await db.verifyPayment(currentTx.id);
    
    dispatch({ type: 'SET_PROCESSING_PAYMENT', payload: false });
  };

  if (isFreeTier) {
    return (
      <div className="flex flex-col items-center justify-center h-full animate-pulse">
        <Icons.Lightning size={64} className="text-brand-blue dark:text-brand-gold mb-6" weight="fill" />
        <h2 className="text-4xl font-extrabold text-brand-black dark:text-white text-center">ACCESS GRANTED</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-mono">FREE SESSION APPLIED ({state.sessionCount + 1}/{SESSION_LIMIT_FREE})</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full items-center justify-center max-w-md mx-auto p-6 text-center animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 w-full shadow-2xl relative overflow-hidden transition-colors">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-blue dark:bg-brand-gold"></div>
        
        <h3 className="text-2xl font-bold text-brand-black dark:text-white mb-2">UNLOCK BOOTH</h3>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-sm">You have used your free sessions.</p>

        <div className="bg-zinc-100 dark:bg-white p-4 mx-auto mb-6 w-48 h-48 flex items-center justify-center relative">
           {/* Placeholder QRIS */}
           {currentTx ? (
             <img 
               src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=AH-PAY-${currentTx.id}`}
               alt="QRIS Code" 
               className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
             />
           ) : (
             <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full"></div>
           )}
           
           {/* Scan Overlay Effect */}
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-blue/20 dark:via-brand-gold/20 to-transparent h-8 w-full animate-scan pointer-events-none"></div>
        </div>

        <div className="text-4xl font-extrabold text-brand-blue dark:text-brand-gold mb-8">
          IDR {SESSION_PRICE.toLocaleString()}
        </div>

        {state.isProcessingPayment ? (
           <div className="flex items-center justify-center gap-2 text-zinc-400 font-mono">
             <div className="w-4 h-4 border-2 border-brand-blue dark:border-brand-gold border-t-transparent rounded-full animate-spin"></div>
             CONFIRMING...
           </div>
        ) : (
          <div className="space-y-4">
             <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 uppercase tracking-widest animate-pulse">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Awaiting Payment
             </div>
             
             {/* Dev Mode Button - Now triggers the server update, relying on polling to transition */}
             <button 
               onClick={handleSimulatePayment}
               disabled={!currentTx}
               className="w-full py-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-brand-black dark:text-white font-bold tracking-wider transition-all border border-zinc-300 dark:border-zinc-700 hover:border-brand-blue dark:hover:border-brand-white disabled:opacity-50 disabled:cursor-not-allowed"
             >
               (DEV) SIMULATE PAYMENT
             </button>
          </div>
        )}
      </div>
      
      <button 
        onClick={() => dispatch({ type: 'SET_STEP', payload: AppStep.LANDING })}
        className="mt-8 text-zinc-500 hover:text-brand-black dark:hover:text-white flex items-center gap-2"
      >
        <Icons.CaretLeft /> CANCEL SESSION
      </button>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default PaymentGate;