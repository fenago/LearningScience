import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/libs/roleMiddleware';
import { migrateCollectionsToLsPrefix, checkMigrationStatus } from '@/libs/migration';

// GET migration status (Admin only)
export const GET = requireAdmin(async (req: NextRequest, userProfile: any) => {
  try {
    const status = await checkMigrationStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('Failed to check migration status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST run migration (Admin only)
export const POST = requireAdmin(async (req: NextRequest, userProfile: any) => {
  try {
    console.log('Starting collection migration...');
    const results = await migrateCollectionsToLsPrefix();
    
    const summary = {
      totalCollections: results.length,
      successful: results.filter(r => r.errors.length === 0).length,
      failed: results.filter(r => r.errors.length > 0).length,
      totalMigrated: results.reduce((sum, r) => sum + r.migrated, 0),
      results
    };

    console.log('Migration completed:', summary);
    
    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      summary
    });
  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});
