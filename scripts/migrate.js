const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Manually load .env file
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  } catch (error) {
    console.error('Could not load .env file:', error.message);
  }
}

loadEnvFile();
const MONGODB_URI = process.env.MONGODB_URI;

async function migrateCollections() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  console.log('🚀 Starting migration...');
  console.log('📋 Migrating collections to ls_ prefix...');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();

    // Collections to migrate
    const migrations = [
      { from: 'userProfiles', to: 'ls_userProfiles' },
      { from: 'rateLimits', to: 'ls_rateLimits' },
      { from: 'userQuotas', to: 'ls_userQuotas' },
      { from: 'users', to: 'ls_users' },
      { from: 'leads', to: 'ls_leads' }
    ];

    let totalMigrated = 0;

    for (const { from, to } of migrations) {
      console.log(`\n📦 Processing ${from} -> ${to}...`);

      try {
        // Check if old collection exists
        const collections = await db.listCollections({ name: from }).toArray();
        if (collections.length === 0) {
          console.log(`   ⚠️  Source collection '${from}' does not exist - skipping`);
          continue;
        }

        // Get document count from old collection
        const oldCollection = db.collection(from);
        const documentCount = await oldCollection.countDocuments();

        if (documentCount === 0) {
          console.log(`   ⚠️  No documents found in '${from}' - skipping`);
          continue;
        }

        // Check if new collection already has data
        const newCollection = db.collection(to);
        const existingCount = await newCollection.countDocuments();
        
        if (existingCount > 0) {
          console.log(`   ⚠️  Target collection '${to}' already has ${existingCount} documents - skipping`);
          continue;
        }

        // Get all documents from old collection
        const documents = await oldCollection.find({}).toArray();

        // Insert into new collection
        const insertResult = await newCollection.insertMany(documents);
        totalMigrated += insertResult.insertedCount;

        console.log(`   ✅ Successfully migrated ${insertResult.insertedCount} documents`);
      } catch (error) {
        console.error(`   ❌ Error migrating ${from} to ${to}:`, error.message);
      }
    }

    console.log(`\n🎉 Migration completed! Total documents migrated: ${totalMigrated}`);
    
    // Show final status
    console.log('\n📊 Final status:');
    for (const { from, to } of migrations) {
      try {
        const oldCount = await db.collection(from).countDocuments();
        const newCount = await db.collection(to).countDocuments();
        console.log(`   ${from}: ${oldCount} documents`);
        console.log(`   ${to}: ${newCount} documents`);
      } catch (error) {
        console.log(`   Error checking ${from}/${to}:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

migrateCollections();
