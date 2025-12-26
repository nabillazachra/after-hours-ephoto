import { NextResponse } from 'next/server';
import { database } from '../../../../../services/database';

/**
 * CRON JOB HANDLER
 * This route is designed to be called by Vercel Cron or a similar scheduler.
 * Frequency: Every hour or Every 24 hours.
 */
export async function GET(request: Request) {
  try {
    // Optional: Add a secret key check to prevent unauthorized triggers
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new NextResponse('Unauthorized', { status: 401 });
    // }

    console.log('[Cron] Starting 24h retention cleanup...');
    
    // Execute the cleanup logic defined in the shared database service
    const deletedCount = await database.cleanupOldSessions();
    
    return NextResponse.json({ 
      success: true, 
      message: `Cleanup successful. Processed ${deletedCount} expired sessions.` 
    });
  } catch (error: any) {
    console.error('[Cron] Cleanup Failed:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}