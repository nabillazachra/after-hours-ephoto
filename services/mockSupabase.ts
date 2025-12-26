import { Template, Session, Transaction, TemplateLayout } from '../types';
import { emailService } from './emailService';

// --- HELPERS TO GENERATE DYNAMIC TEMPLATES ---

// 1. Classic Strip: HD Vertical (1080x1920)
const createStripTemplate = (): Template => {
    // Canvas: 1080 x 1920 (9:16 HD)
    const width = 1080;
    const height = 1920;
    
    // Scale standard slots to this resolution
    // Slots approx 800px wide
    const slotW = 800;
    const slotH = 500;
    const startX = (width - slotW) / 2;
    
    const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <path fill="#050505" fill-rule="evenodd" d="
            M0,0 H${width} V${height} H0 Z 
            M${startX},250 V${250+slotH} H${startX+slotW} V250 Z 
            M${startX},800 V${800+slotH} H${startX+slotW} V800 Z 
            M${startX},1350 V${1350+slotH} H${startX+slotW} V1350 Z" 
        />
        <text x="50%" y="150" dominant-baseline="middle" text-anchor="middle" fill="#D4AF37" font-family="sans-serif" font-weight="bold" font-size="60" letter-spacing="10">AFTER HOURS</text>
        <rect x="${startX}" y="250" width="${slotW}" height="${slotH}" fill="none" stroke="#D4AF37" stroke-width="4"/>
        <rect x="${startX}" y="800" width="${slotW}" height="${slotH}" fill="none" stroke="#D4AF37" stroke-width="4"/>
        <rect x="${startX}" y="1350" width="${slotW}" height="${slotH}" fill="none" stroke="#D4AF37" stroke-width="4"/>
        <text x="50%" y="1880" dominant-baseline="middle" text-anchor="middle" fill="#666" font-family="monospace" font-size="30" letter-spacing="5">CLASSIC STRIP HD</text>
    </svg>`;

    return {
        id: 't_strip_hd',
        name: 'Classic Strip HD',
        imageUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
        active: true,
        layout: {
            width,
            height,
            slots: [
                { id: 's1', x: startX, y: 250, width: slotW, height: slotH, targetTakeIndex: 0 },
                { id: 's2', x: startX, y: 800, width: slotW, height: slotH, targetTakeIndex: 1 },
                { id: 's3', x: startX, y: 1350, width: slotW, height: slotH, targetTakeIndex: 2 },
            ]
        }
    };
}

// 2. Magazine Cover: 4K Portrait
const createMagazineTemplate = (): Template => {
    // Let's go with a high res vertical: 1200x1800
    const width = 1200;
    const height = 1800;
    
    const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
         <path fill="#050505" fill-rule="evenodd" d="M0,0 H${width} V${height} H0 Z M100,250 V1550 H1100 V250 Z" />
         <text x="600" y="180" text-anchor="middle" fill="#FFF" font-family="serif" font-weight="bold" font-size="140">VOGUE</text>
         <text x="600" y="1650" text-anchor="middle" fill="#D4AF37" font-family="sans-serif" font-size="50" letter-spacing="2">THE NIGHTLIFE ISSUE</text>
         <rect x="950" y="1600" width="150" height="60" fill="white"/>
    </svg>`;

    return {
        id: 't_mag_hq',
        name: 'Magazine Cover HQ',
        imageUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
        active: true,
        layout: {
            width,
            height,
            slots: [
                { id: 'main', x: 100, y: 250, width: 1000, height: 1300, targetTakeIndex: 1 }
            ]
        }
    };
}

// 3. Collage: Square High Res (2000x2000)
const createCollageTemplate = (): Template => {
    const width = 2000;
    const height = 2000;
    
    const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <path fill="#1a1a1a" fill-rule="evenodd" d="M0,0 H${width} V${height} H0 Z 
            M100,100 V1100 H1100 V100 Z 
            M1200,100 V800 H1900 V100 Z 
            M1200,900 V1900 H1900 V900 Z
            M100,1200 V1900 H1100 V1200 Z" 
        />
        <text x="600" y="1550" text-anchor="middle" fill="white" font-family="sans-serif" font-weight="bold" font-size="100">COLLAGE</text>
    </svg>`;

    return {
        id: 't_collage_4k',
        name: 'Collage 4K',
        imageUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
        active: true,
        layout: {
            width,
            height,
            slots: [
                { id: 'big_left', x: 100, y: 100, width: 1000, height: 1000, targetTakeIndex: 0 },
                { id: 'top_right', x: 1200, y: 100, width: 700, height: 700, targetTakeIndex: 1 },
                { id: 'bot_right', x: 1200, y: 900, width: 700, height: 1000, targetTakeIndex: 2 }
            ]
        }
    };
}

// 4. Newspaper: Custom Background + Bottom Layering
const createNewspaperTemplate = (): Template => {
    const width = 1200;
    const height = 1800;
    
    const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
         <text x="600" y="150" text-anchor="middle" fill="#111" font-family="serif" font-weight="bold" font-size="120">THE DAILY NEWS</text>
         <rect x="50" y="200" width="1100" height="5" fill="#111" />
         <text x="600" y="1600" text-anchor="middle" fill="#111" font-family="serif" font-size="40">Vol. 1 - Late Night Edition</text>
         <!-- Frame for photo 1 -->
         <rect x="100" y="300" width="1000" height="800" fill="none" stroke="#111" stroke-width="5"/>
         <!-- Frame for photo 2 -->
         <rect x="100" y="1150" width="480" height="350" fill="none" stroke="#111" stroke-width="3"/>
         <rect x="620" y="1150" width="480" height="350" fill="none" stroke="#111" stroke-width="3"/>
    </svg>`;

    return {
        id: 't_newspaper',
        name: 'The Daily News',
        imageUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
        active: true,
        backgroundColor: '#F4F1EA', // Newsprint color
        layout: {
            width,
            height,
            slots: [
                { id: 'main_pic', x: 105, y: 305, width: 990, height: 790, targetTakeIndex: 0, layerOrder: 'bottom' },
                { id: 'sub_pic_1', x: 105, y: 1155, width: 470, height: 340, targetTakeIndex: 1, layerOrder: 'bottom' },
                { id: 'sub_pic_2', x: 625, y: 1155, width: 470, height: 340, targetTakeIndex: 2, layerOrder: 'bottom' }
            ]
        }
    };
}


// Initial Mock Data
let MOCK_TEMPLATES: Template[] = [
  createStripTemplate(),
  createMagazineTemplate(),
  createCollageTemplate(),
  createNewspaperTemplate()
];

let sessions: Session[] = [];
let transactions: Transaction[] = [];

// Simulate Async DB calls
export const db = {
  getTemplates: async (): Promise<Template[]> => {
    return new Promise((resolve) => {
      // Return only active templates to user, but logic handled in UI mostly
      const activeTemplates = MOCK_TEMPLATES.filter(t => t.active);
      setTimeout(() => resolve(activeTemplates), 500);
    });
  },

  // Admin: Get all templates including inactive
  getAllTemplates: async (): Promise<Template[]> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve([...MOCK_TEMPLATES]), 500);
    });
  },

  createTransaction: async (amount: number): Promise<Transaction> => {
    return new Promise((resolve) => {
      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        sessionId: `sess_${Date.now()}`, // Pre-generate session ID
        amount,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };
      transactions.push(newTx);
      // Simulate network latency
      setTimeout(() => resolve(newTx), 800);
    });
  },

  checkTransactionStatus: async (transactionId: string): Promise<'PENDING' | 'PAID' | 'FAILED'> => {
      return new Promise((resolve) => {
          // In a real app, this hits the DB to see if the webhook updated the row
          const tx = transactions.find(t => t.id === transactionId);
          setTimeout(() => {
              resolve(tx ? tx.status : 'FAILED');
          }, 300); // Fast poll response
      });
  },

  verifyPayment: async (transactionId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const tx = transactions.find(t => t.id === transactionId);
        if (tx) {
            tx.status = 'PAID';
            // Trigger Email Notification (Server-side logic simulation)
            await emailService.sendTransactionNotification(tx);
        }
        resolve(true);
      }, 1500);
    });
  },

  getTransactions: async (): Promise<Transaction[]> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve([...transactions]), 500);
    });
  },

  // Simulate uploading a base64 string to a bucket and getting a public URL back
  uploadPhotoToStorage: async (base64Data: string): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // In a real app, this returns: 'https://supabase.co/storage/v1/object/public/photos/xyz.jpg'
            // For now, we return the base64, but treating it as a "URL" for the data flow.
            resolve(base64Data); 
        }, 500);
    });
  },

  saveSession: async (templateId: string, photoUrls: string[], finalUrl?: string): Promise<Session> => {
    return new Promise((resolve) => {
      const newSession: Session = {
        id: `sess_${Date.now()}`,
        templateId,
        photos: photoUrls,
        finalUrl: finalUrl, // Store composite
        createdAt: new Date().toISOString()
      };
      sessions.push(newSession);
      setTimeout(() => resolve(newSession), 500);
    });
  },

  // Delete session (used after download or by admin)
  deleteSession: async (sessionId: string): Promise<void> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              sessions = sessions.filter(s => s.id !== sessionId);
              resolve();
          }, 500);
      });
  },

  getSessions: async (): Promise<Session[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            // Return all for admin
            resolve([...sessions]);
        }, 500);
    });
  },
  
  uploadTemplate: async (file: File, layout: any, backgroundColor?: string): Promise<Template> => {
      // Mock upload
      return new Promise(resolve => {
          setTimeout(async () => {
            const newT: Template = {
                id: `t_${Date.now()}`,
                name: file.name.replace(/\.[^/.]+$/, ""),
                imageUrl: URL.createObjectURL(file), // Local blob for demo
                active: true,
                backgroundColor,
                layout: layout // Save the passed layout
            };
            MOCK_TEMPLATES.push(newT);
            
            // Trigger Email Notification for Admin
            await emailService.sendTemplateNotification(newT);

            resolve(newT);
          }, 1000)
      })
  },

  updateTemplate: async (id: string, updates: Partial<Template>): Promise<void> => {
      return new Promise(resolve => {
          setTimeout(() => {
              MOCK_TEMPLATES = MOCK_TEMPLATES.map(t => t.id === id ? { ...t, ...updates } : t);
              resolve();
          }, 500);
      });
  },

  deleteTemplate: async (id: string): Promise<void> => {
      return new Promise(resolve => {
          setTimeout(() => {
              // HARD DELETE for mock purposes, to ensure it disappears when requested
              MOCK_TEMPLATES = MOCK_TEMPLATES.filter(t => t.id !== id);
              resolve();
          }, 500);
      });
  }
};