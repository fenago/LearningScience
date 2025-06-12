import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

interface MigrationResult {
  collection: string;
  migrated: number;
  errors: string[];
}

export async function migrateCollectionsToLsPrefix(): Promise<MigrationResult[]> {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  const client = new MongoClient(MONGODB_URI);
  const results: MigrationResult[] = [];

  try {
    await client.connect();
    const db = client.db();

    // Collections to migrate: old_name -> new_name
    const migrations = [
      { from: 'userProfiles', to: 'ls_userProfiles' },
      { from: 'rateLimits', to: 'ls_rateLimits' },
      { from: 'userQuotas', to: 'ls_userQuotas' },
      { from: 'users', to: 'ls_users' },
      { from: 'leads', to: 'ls_leads' }
    ];

    for (const { from, to } of migrations) {
      const result: MigrationResult = {
        collection: `${from} -> ${to}`,
        migrated: 0,
        errors: []
      };

      try {
        // Check if old collection exists
        const collections = await db.listCollections({ name: from }).toArray();
        if (collections.length === 0) {
          result.errors.push(`Source collection '${from}' does not exist`);
          results.push(result);
          continue;
        }

        // Get all documents from old collection
        const oldCollection = db.collection(from);
        const documents = await oldCollection.find({}).toArray();

        if (documents.length === 0) {
          result.errors.push(`No documents found in '${from}'`);
          results.push(result);
          continue;
        }

        // Insert into new collection
        const newCollection = db.collection(to);
        
        // Check if new collection already has data
        const existingCount = await newCollection.countDocuments();
        if (existingCount > 0) {
          result.errors.push(`Target collection '${to}' already has ${existingCount} documents. Skipping migration.`);
          results.push(result);
          continue;
        }

        // Insert documents
        const insertResult = await newCollection.insertMany(documents);
        result.migrated = insertResult.insertedCount;

        console.log(`✅ Migrated ${result.migrated} documents from ${from} to ${to}`);
      } catch (error: any) {
        result.errors.push(`Migration error: ${error.message}`);
        console.error(`❌ Error migrating ${from} to ${to}:`, error);
      }

      results.push(result);
    }

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await client.close();
  }

  return results;
}

export async function checkMigrationStatus(): Promise<{
  oldCollections: { name: string; count: number }[];
  newCollections: { name: string; count: number }[];
}> {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();

    const oldCollectionNames = ['userProfiles', 'rateLimits', 'userQuotas', 'users', 'leads'];
    const newCollectionNames = ['ls_userProfiles', 'ls_rateLimits', 'ls_userQuotas', 'ls_users', 'ls_leads'];

    const oldCollections = [];
    const newCollections = [];

    for (const name of oldCollectionNames) {
      try {
        const count = await db.collection(name).countDocuments();
        oldCollections.push({ name, count });
      } catch (error) {
        oldCollections.push({ name, count: 0 });
      }
    }

    for (const name of newCollectionNames) {
      try {
        const count = await db.collection(name).countDocuments();
        newCollections.push({ name, count });
      } catch (error) {
        newCollections.push({ name, count: 0 });
      }
    }

    return { oldCollections, newCollections };
  } finally {
    await client.close();
  }
}
