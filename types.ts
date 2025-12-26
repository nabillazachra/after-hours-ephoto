import React from 'react';

export enum AppStep {
  LANDING = 'LANDING',
  TEMPLATE_SELECTION = 'TEMPLATE_SELECTION',
  PAYMENT_GATE = 'PAYMENT_GATE',
  CAMERA = 'CAMERA',
  PHOTO_SELECTION = 'PHOTO_SELECTION',
  RESULT = 'RESULT',
  ABOUT = 'ABOUT'
}

export interface LayoutSlot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  targetTakeIndex: number; // Default/Fallback index
  rotation?: number;
  layerOrder?: 'bottom' | 'top'; // NEW: Layering control (Default: bottom)
}

export interface TemplateLayout {
  width: number;
  height: number;
  slots: LayoutSlot[];
}

export interface Template {
  id: string;
  name: string;
  imageUrl: string; // The full resolution overlay PNG
  active: boolean;
  backgroundColor?: string; // NEW: Canvas background color
  layout: TemplateLayout;
}

export interface Session {
  id: string;
  templateId: string;
  photos: string[]; // Base64 strings for this demo
  finalUrl?: string; // The composited final image
  createdAt: string;
  isFilesDeleted?: boolean; // NEW: Tracks if files were cleaned up
}

export interface Transaction {
  id: string;
  sessionId: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'FAILED';
  createdAt: string;
}

// Phosphor Icon Mock Type
export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  className?: string;
}