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

async function debugApiKey() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  console.log('🔍 Debugging API key storage and validation...');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();

    // Get the user profile for admin user
    const profile = await db.collection('ls_userProfiles').findOne({ 
      email: 'socrates73@gmail.com' 
    });

    if (!profile) {
      console.error('❌ User profile not found');
      return;
    }

    console.log('\n👤 USER PROFILE DATA:');
    console.log(`   User ID: ${profile.userId}`);
    console.log(`   Email: ${profile.email}`);
    console.log(`   Role: ${profile.role}`);

    console.log('\n🔑 API KEY DATA:');
    if (profile.apiKey) {
      console.log('   API Key object exists:');
      console.log(`   - encryptedKey: ${profile.apiKey.encryptedKey ? 'EXISTS' : 'MISSING'}`);
      console.log(`   - isValid: ${profile.apiKey.isValid}`);
      console.log(`   - addedAt: ${profile.apiKey.addedAt}`);
      console.log(`   - salt: ${profile.apiKey.salt ? 'EXISTS' : 'MISSING'}`);
      console.log(`   - keyHash: ${profile.apiKey.keyHash || 'MISSING'}`);
      
      // Show the actual structure
      console.log('\n📋 FULL API KEY OBJECT:');
      console.log(JSON.stringify(profile.apiKey, null, 2));
    } else {
      console.log('   ❌ NO API Key object found in profile');
    }

    // Check what the chat validation logic expects
    console.log('\n🧪 VALIDATION CHECK:');
    const hasEncryptedKey = profile.apiKey?.encryptedKey;
    const isValid = profile.apiKey?.isValid;
    
    console.log(`   - Has encryptedKey: ${!!hasEncryptedKey}`);
    console.log(`   - isValid flag: ${isValid}`);
    console.log(`   - Would pass validation: ${!!(hasEncryptedKey && isValid)}`);

    if (hasEncryptedKey && !isValid) {
      console.log('\n🔧 FIXING isValid flag...');
      const result = await db.collection('ls_userProfiles').updateOne(
        { email: 'socrates73@gmail.com' },
        { 
          $set: { 
            'apiKey.isValid': true,
            updatedAt: new Date()
          } 
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log('✅ Fixed isValid flag - API key should now work');
      } else {
        console.log('⚠️  No changes made');
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

debugApiKey();
