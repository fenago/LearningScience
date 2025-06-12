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

async function completeMigration() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  console.log('🚀 Starting COMPLETE migration verification and data transfer...');
  console.log('📋 Ensuring ALL data is properly migrated to ls_ prefixed collections...');

  const client = new MongoClient(MONGODB_URI);
  let totalMigrated = 0;
  let migrationReport = [];

  try {
    await client.connect();
    const db = client.db();

    // Collections to migrate with validation
    const migrations = [
      { from: 'userProfiles', to: 'ls_userProfiles', type: 'user_data' },
      { from: 'rateLimits', to: 'ls_rateLimits', type: 'rate_limiting' },
      { from: 'userQuotas', to: 'ls_userQuotas', type: 'rate_limiting' },
      { from: 'users', to: 'ls_users', type: 'mongoose_model' },
      { from: 'leads', to: 'ls_leads', type: 'mongoose_model' }
    ];

    for (const { from, to, type } of migrations) {
      console.log(`\n📦 Processing ${from} -> ${to} (${type})...`);
      
      const report = {
        from,
        to,
        type,
        oldCount: 0,
        newCount: 0,
        migrated: 0,
        status: 'unknown',
        issues: []
      };

      try {
        // Check if old collection exists
        const collections = await db.listCollections({ name: from }).toArray();
        if (collections.length === 0) {
          console.log(`   ⚠️  Source collection '${from}' does not exist`);
          report.status = 'no_source';
          migrationReport.push(report);
          continue;
        }

        // Get counts
        const oldCollection = db.collection(from);
        const newCollection = db.collection(to);
        
        report.oldCount = await oldCollection.countDocuments();
        report.newCount = await newCollection.countDocuments();

        console.log(`   📊 Source: ${report.oldCount} documents, Target: ${report.newCount} documents`);

        if (report.oldCount === 0) {
          console.log(`   ✅ No data to migrate from '${from}'`);
          report.status = 'empty_source';
          migrationReport.push(report);
          continue;
        }

        // For userProfiles, we need special handling due to data quality issues
        if (from === 'userProfiles') {
          // Get valid documents only (with proper email and role)
          const validDocs = await oldCollection.find({
            email: { $exists: true, $ne: null, $ne: '' },
            role: { $exists: true, $ne: null, $ne: '' }
          }).toArray();

          console.log(`   🔍 Found ${validDocs.length} valid documents out of ${report.oldCount} total`);

          // For each valid document, ensure it exists in the new collection
          for (const doc of validDocs) {
            const existing = await newCollection.findOne({ userId: doc.userId });
            
            if (!existing) {
              // Insert missing document
              await newCollection.insertOne(doc);
              report.migrated++;
              console.log(`   ➕ Migrated user: ${doc.email} (${doc.role})`);
            } else {
              // Verify data integrity and update if needed
              if (existing.role !== doc.role || existing.email !== doc.email) {
                await newCollection.updateOne(
                  { userId: doc.userId },
                  { 
                    $set: { 
                      role: doc.role,
                      email: doc.email,
                      updatedAt: new Date()
                    } 
                  }
                );
                console.log(`   🔄 Updated user: ${doc.email} (role: ${existing.role} -> ${doc.role})`);
              }
            }
          }

          report.newCount = await newCollection.countDocuments();
          report.status = 'completed_with_validation';
        } else {
          // For other collections, do standard migration
          if (report.newCount === 0 && report.oldCount > 0) {
            const documents = await oldCollection.find({}).toArray();
            if (documents.length > 0) {
              await newCollection.insertMany(documents);
              report.migrated = documents.length;
              totalMigrated += documents.length;
              console.log(`   ✅ Migrated ${documents.length} documents`);
              report.status = 'migrated';
            }
          } else if (report.newCount > 0) {
            console.log(`   ✅ Data already exists in target collection`);
            report.status = 'already_migrated';
          }
        }

        // Final count after migration
        report.newCount = await newCollection.countDocuments();

      } catch (error) {
        console.error(`   ❌ Error processing ${from} -> ${to}:`, error.message);
        report.status = 'error';
        report.issues.push(error.message);
      }

      migrationReport.push(report);
    }

    // Generate comprehensive report
    console.log('\n📋 COMPREHENSIVE MIGRATION REPORT');
    console.log('=====================================');
    
    migrationReport.forEach(report => {
      console.log(`\n📦 ${report.from} -> ${report.to}`);
      console.log(`   Type: ${report.type}`);
      console.log(`   Status: ${report.status}`);
      console.log(`   Old Count: ${report.oldCount}`);
      console.log(`   New Count: ${report.newCount}`);
      console.log(`   Migrated: ${report.migrated}`);
      if (report.issues.length > 0) {
        console.log(`   Issues: ${report.issues.join(', ')}`);
      }
    });

    console.log(`\n🎉 Total documents migrated in this run: ${totalMigrated}`);

    // Verify all new collections have the expected data
    console.log('\n🔍 FINAL VERIFICATION');
    console.log('====================');
    
    const newCollections = ['ls_userProfiles', 'ls_rateLimits', 'ls_userQuotas', 'ls_users', 'ls_leads'];
    for (const collName of newCollections) {
      try {
        const count = await db.collection(collName).countDocuments();
        console.log(`✅ ${collName}: ${count} documents`);
        
        if (collName === 'ls_userProfiles' && count > 0) {
          const users = await db.collection(collName).find({}).toArray();
          users.forEach(user => {
            console.log(`   👤 User: ${user.email} (${user.role}) - ID: ${user.userId}`);
          });
        }
      } catch (error) {
        console.log(`❌ ${collName}: Error checking - ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

completeMigration();
