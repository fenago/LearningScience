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

async function fixMigration() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  console.log('🔧 Fixing migration data...');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();

    const oldCollection = db.collection('userProfiles');
    const newCollection = db.collection('ls_userProfiles');

    // Get the correct admin user from old collection
    const adminUser = await oldCollection.findOne({ 
      userId: '6816c101f3d0b212dafdccea',
      email: 'socrates73@gmail.com' 
    });

    if (!adminUser) {
      console.log('❌ Admin user not found in old collection');
      return;
    }

    console.log('👤 Found admin user:', {
      userId: adminUser.userId,
      email: adminUser.email,
      role: adminUser.role
    });

    // Update the user in the new collection with correct admin role
    const updateResult = await newCollection.updateOne(
      { userId: '6816c101f3d0b212dafdccea' },
      { 
        $set: { 
          role: 'ADMIN',
          updatedAt: new Date()
        } 
      }
    );

    if (updateResult.modifiedCount > 0) {
      console.log('✅ Successfully updated user role to ADMIN');
    } else {
      console.log('⚠️  No user was updated (user may not exist in new collection)');
    }

    // Clean up any invalid users in the new collection
    const deleteResult = await newCollection.deleteMany({
      $or: [
        { email: { $exists: false } },
        { email: null },
        { email: '' },
        { role: { $exists: false } },
        { role: null },
        { role: '' }
      ]
    });

    if (deleteResult.deletedCount > 0) {
      console.log(`🗑️  Cleaned up ${deleteResult.deletedCount} invalid user records`);
    }

    // Show final result
    console.log('\n📊 Final user data in ls_userProfiles:');
    const finalUsers = await newCollection.find({}).toArray();
    finalUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. userId: ${user.userId}, email: ${user.email}, role: ${user.role}`);
    });

  } catch (error) {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

fixMigration();
