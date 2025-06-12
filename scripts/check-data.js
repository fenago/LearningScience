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

async function checkCollectionData() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  console.log('🔍 Checking collection data...');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();

    // Check old userProfiles collection
    console.log('\n📋 OLD userProfiles collection:');
    const oldUserProfiles = await db.collection('userProfiles').find({}).toArray();
    oldUserProfiles.forEach((doc, index) => {
      console.log(`   ${index + 1}. userId: ${doc.userId}, email: ${doc.email}, role: ${doc.role}`);
    });

    // Check new ls_userProfiles collection
    console.log('\n📋 NEW ls_userProfiles collection:');
    const newUserProfiles = await db.collection('ls_userProfiles').find({}).toArray();
    newUserProfiles.forEach((doc, index) => {
      console.log(`   ${index + 1}. userId: ${doc.userId}, email: ${doc.email}, role: ${doc.role}`);
    });

    // Check if there are missing users
    const oldUserIds = new Set(oldUserProfiles.map(doc => doc.userId));
    const newUserIds = new Set(newUserProfiles.map(doc => doc.userId));
    
    const missingUsers = oldUserProfiles.filter(doc => !newUserIds.has(doc.userId));
    if (missingUsers.length > 0) {
      console.log('\n⚠️  MISSING USERS in new collection:');
      missingUsers.forEach(user => {
        console.log(`   - userId: ${user.userId}, email: ${user.email}, role: ${user.role}`);
      });
    } else {
      console.log('\n✅ All users have been migrated');
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

checkCollectionData();
