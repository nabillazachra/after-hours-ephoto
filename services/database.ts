import { supabase } from '../lib/supabase';
import { Template, Session, Transaction, TemplateLayout } from '../types';
import { emailService } from './emailService';

let transactions: Transaction[] = [];

// --- HELPERS ---
const base64ToBlob = async (base64: string): Promise<Blob> => {
    const res = await fetch(base64);
    return await res.blob();
};

const handleSupabaseError = (error: any, context: string) => {
    // Safely extract error message
    const message = error.message || error.error_description || (typeof error === 'string' ? error : JSON.stringify(error));
    const code = error.code || error.statusCode;

    console.error(`Supabase Error [${context}]: ${message}`, error);

    // Specific Handling
    if (typeof message === 'string' && (message.includes('row-level security') || code === '42501')) {
        alert(`Database Permission Error (RLS) in [${context}]:\n\nThe app cannot access the database. Please run the 'supabase_setup.sql' script in your Supabase SQL Editor to enable permissions.`);
    } else if (typeof message === 'string' && message.includes('Bucket not found')) {
        alert(`Storage Error: Bucket Missing.\n\nPlease run the 'supabase_setup.sql' script to create the required storage buckets ('photobooth' and 'photos').`);
    } else {
        // Log to console but don't always alert for minor things, unless critical
        console.warn(`System Warning [${context}]: ${message}`);
    }
    
    // We re-throw or return null depending on needs, but here we let the caller handle empty states
    return null;
};

export const database = {
  // --- TEMPLATES (SUPABASE) ---

  getTemplates: async (): Promise<Template[]> => {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) {
      handleSupabaseError(error, 'Get Active Templates');
      return [];
    }

    return data.map((t: any) => ({
      id: t.id,
      name: t.name,
      imageUrl: t.image_url,
      active: t.active,
      backgroundColor: t.background_color,
      layout: t.layout_config // Maps JSONB to TemplateLayout
    }));
  },

  getAllTemplates: async (): Promise<Template[]> => {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
        handleSupabaseError(error, 'Get All Templates');
        return [];
    }

    return data.map((t: any) => ({
      id: t.id,
      name: t.name,
      imageUrl: t.image_url,
      active: t.active,
      backgroundColor: t.background_color,
      layout: t.layout_config
    }));
  },

  // Upload PNG frame and create template record
  uploadTemplate: async (file: File, layout: TemplateLayout, backgroundColor: string = '#ffffff'): Promise<void> => {
      // 1. Upload Image to 'photobooth' bucket
      // Sanitize filename to avoid issues
      const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '');
      const fileName = `template_${Date.now()}_${cleanName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
          .from('photobooth')
          .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
          });

      if (uploadError) {
          handleSupabaseError(uploadError, 'Upload Template Image');
          throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
          .from('photobooth')
          .getPublicUrl(fileName);

      // 2. Insert Record
      const { error: insertError } = await supabase
          .from('templates')
          .insert({
              name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
              image_url: publicUrl,
              width: layout.width,
              height: layout.height,
              layout_config: layout,
              background_color: backgroundColor,
              active: true
          });

      if (insertError) {
          handleSupabaseError(insertError, 'Insert Template Record');
          throw insertError;
      }
      
      // Notify Admin
      await emailService.sendTemplateNotification({
          id: 'new',
          name: file.name,
          imageUrl: publicUrl,
          active: true,
          layout
      });
  },

  updateTemplate: async (id: string, updates: Partial<Template>): Promise<void> => {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.active !== undefined) dbUpdates.active = updates.active;
      if (updates.backgroundColor) dbUpdates.background_color = updates.backgroundColor;
      if (updates.layout) {
          dbUpdates.layout_config = updates.layout;
          dbUpdates.width = updates.layout.width;
          dbUpdates.height = updates.layout.height;
      }

      const { error } = await supabase
          .from('templates')
          .update(dbUpdates)
          .eq('id', id);

      if (error) handleSupabaseError(error, 'Update Template');
  },

  deleteTemplate: async (id: string): Promise<void> => {
      // Fetch to get image path for cleanup (optional but good practice)
      const { data: tmpl } = await supabase.from('templates').select('image_url').eq('id', id).single();
      
      const { error } = await supabase
          .from('templates')
          .delete()
          .eq('id', id);

      if (error) handleSupabaseError(error, 'Delete Template');

      // Cleanup storage if needed
      if (tmpl && tmpl.image_url) {
           const path = tmpl.image_url.split('/photobooth/')[1];
           if (path) {
               await supabase.storage.from('photobooth').remove([path]);
           }
      }
  },

  // --- TRANSACTIONS (Mock/Simulated for now, or could migrate to Supabase) ---

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

  // --- SESSIONS & PHOTOS (SUPABASE) ---

  uploadPhotoToStorage: async (base64Data: string): Promise<string> => {
      const blob = await base64ToBlob(base64Data);
      const fileName = `photo_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

      const { data, error } = await supabase.storage
          .from('photos')
          .upload(fileName, blob, { 
              contentType: 'image/jpeg',
              cacheControl: '3600',
              upsert: false
          });

      if (error) {
          handleSupabaseError(error, 'Upload Photo');
          // Fallback empty string if upload fails, though usually we want to stop
          return "";
      }

      const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(fileName);
          
      return publicUrl;
  },

  saveSession: async (templateId: string, photoUrls: string[], finalUrl?: string): Promise<Session> => {
    // Sanitize data
    const safePhotoUrls = photoUrls.filter(url => url && url.length > 0);
    
    // NOTE: Using 'final_result_url' to match database column
    const sessionData = {
        template_id: templateId,
        photos: safePhotoUrls,
        final_result_url: finalUrl || null,
        created_at: new Date().toISOString(),
        is_files_deleted: false
    };

    console.log("Saving Session to Supabase:", sessionData);

    const { data, error } = await supabase
        .from('sessions')
        .insert(sessionData)
        .select()
        .single();

    if (error) {
        handleSupabaseError(error, 'Save Session Record');
        throw error;
    }

    console.log("Session Saved Successfully:", data);

    return {
        id: data.id,
        templateId: data.template_id,
        photos: data.photos,
        finalUrl: data.final_result_url,
        createdAt: data.created_at,
        isFilesDeleted: data.is_files_deleted
    };
  },

  deleteSession: async (sessionId: string): Promise<void> => {
      // 1. Fetch session to get URLs
      const { data: session, error: fetchError } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

      if (fetchError || !session) {
          console.error("Session not found for deletion or error fetching:", fetchError);
          return;
      }

      // 2. Extract Paths from URLs
      const extractPath = (url: string | null) => {
          if (!url) return null;
          // Assuming URL format: https://.../storage/v1/object/public/photos/FILENAME
          const parts = url.split('/photos/');
          return parts.length > 1 ? parts[1] : null;
      };

      const pathsToDelete: string[] = [];
      if (session.photos && Array.isArray(session.photos)) {
          session.photos.forEach((url: string) => {
              const p = extractPath(url);
              if (p) pathsToDelete.push(p);
          });
      }
      // Note: Use final_result_url
      const finalPath = extractPath(session.final_result_url);
      if (finalPath) pathsToDelete.push(finalPath);

      // 3. Delete from Storage
      if (pathsToDelete.length > 0) {
          const { error: storageError } = await supabase.storage
              .from('photos')
              .remove(pathsToDelete);
          
          if (storageError) console.error("Error deleting from storage:", storageError);
      }

      // 4. Delete from Database
      const { error: deleteError } = await supabase
          .from('sessions')
          .delete()
          .eq('id', sessionId);

      if (deleteError) handleSupabaseError(deleteError, 'Delete Session');
  },

  getSessions: async (): Promise<Session[]> => {
      const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .order('created_at', { ascending: false });

      if (error) {
          handleSupabaseError(error, 'Get Sessions');
          return [];
      }
      
      // Log count to help debugging
      console.log(`Fetched ${data?.length || 0} sessions from database.`);

      return data.map((s: any) => ({
          id: s.id,
          templateId: s.template_id,
          photos: s.photos || [],
          finalUrl: s.final_result_url, // Mapped from DB 'final_result_url' to 'finalUrl'
          createdAt: s.created_at,
          isFilesDeleted: s.is_files_deleted || false
      }));
  },

  // --- RETENTION POLICY CLEANUP ---
  cleanupOldSessions: async (): Promise<number> => {
      // 1. Calculate Cutoff (24 Hours Ago)
      const retentionPeriodMs = 24 * 60 * 60 * 1000;
      const cutOffDate = new Date(Date.now() - retentionPeriodMs).toISOString();

      console.log(`[Cleanup] Identifying sessions older than ${cutOffDate}`);

      // 2. Find expired sessions where files are NOT yet deleted
      const { data: expiredSessions, error: fetchError } = await supabase
          .from('sessions')
          .select('*')
          .lt('created_at', cutOffDate)
          .eq('is_files_deleted', false);

      if (fetchError || !expiredSessions || expiredSessions.length === 0) {
          if (fetchError) handleSupabaseError(fetchError, 'Fetch Expired Sessions');
          else console.log("[Cleanup] No expired sessions found.");
          return 0;
      }

      console.log(`[Cleanup] Found ${expiredSessions.length} sessions to clean.`);

      // 3. Collect all file paths to delete in bulk
      const extractPath = (url: string | null) => {
          if (!url) return null;
          const parts = url.split('/photos/');
          return parts.length > 1 ? parts[1] : null;
      };

      const pathsToDelete: string[] = [];
      const sessionIdsToUpdate: string[] = [];

      expiredSessions.forEach((session: any) => {
          sessionIdsToUpdate.push(session.id);
          
          // Collect photos
          if (session.photos && Array.isArray(session.photos)) {
              session.photos.forEach((url: string) => {
                  const p = extractPath(url);
                  if (p) pathsToDelete.push(p);
              });
          }
          // Collect final result
          const finalP = extractPath(session.final_result_url);
          if (finalP) pathsToDelete.push(finalP);
      });

      // 4. Delete from Storage
      if (pathsToDelete.length > 0) {
          const { error: storageError } = await supabase.storage
              .from('photos')
              .remove(pathsToDelete);
          
          if (storageError) {
              handleSupabaseError(storageError, 'Cleanup Storage');
              return 0;
          }
          console.log(`[Cleanup] Deleted ${pathsToDelete.length} files from storage.`);
      }

      // 5. Update Database Records (Mark as deleted, clear URLs)
      // Note: We use a loop or bulk update. Supabase bulk update requires careful structure or multiple calls.
      // For simplicity/safety, we update all identified IDs.
      const { error: updateError } = await supabase
          .from('sessions')
          .update({ 
              is_files_deleted: true, 
              final_result_url: null, // Note: DB column name
              photos: [] // Clear raw photos array
          })
          .in('id', sessionIdsToUpdate);

      if (updateError) {
          handleSupabaseError(updateError, 'Update Expired Sessions');
      } else {
          console.log(`[Cleanup] Marked ${sessionIdsToUpdate.length} sessions as expired.`);
      }

      return sessionIdsToUpdate.length;
  }
};