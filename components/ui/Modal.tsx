import React from 'react';
import { Icons } from '../../constants';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    confirmText?: string;
    onConfirm?: () => void;
    isDestructive?: boolean;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    confirmText,
    onConfirm,
    isDestructive = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Modal Card */}
            <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-md p-6 shadow-2xl animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white uppercase tracking-wide">{title}</h3>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <Icons.X size={20} />
                    </button>
                </div>

                <div className="text-zinc-300 text-sm mb-8">
                    {children}
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    {onConfirm && (
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors ${isDestructive
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-brand-blue hover:bg-blue-700'
                                }`}
                        >
                            {confirmText || 'Confirm'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;
